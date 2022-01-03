import {
  SaleObject,
  SaleItemObject,
  SaleTransactionObject,
  ClerkObject,
  GiftCardObject,
  VendorObject,
  VendorPaymentObject,
  InventoryObject,
  RegisterObject,
  LogObject,
  TillObject,
  HoldObject,
  CustomerObject,
  TaskObject,
  SaleStateTypes,
  PaymentMethodTypes,
  StockMovementTypes,
} from "@/lib/types";

import {
  getItemDisplayName,
  getItemQuantity,
  getSaleVars,
} from "./data-functions";

export async function loadSaleToCart(
  cart: SaleObject,
  setCart: Function,
  sale: SaleObject,
  clerk: ClerkObject,
  customers: CustomerObject[],
  logs: LogObject[],
  mutateLogs: Function,
  sales: SaleObject[],
  mutateSales: Function,
  inventory: InventoryObject[],
  mutateInventory: Function,
  giftCards: GiftCardObject[],
  mutateGiftCards: Function
) {
  if (cart?.date_sale_opened && (cart?.items || cart?.id !== sale?.id)) {
    // Cart is loaded with a different sale or
    // Cart has been started but not loaded into sale
    console.log("Park old sale");
    await saveSaleAndPark(
      cart,
      clerk,
      customers,
      logs,
      mutateLogs,
      sales,
      mutateSales,
      inventory,
      mutateInventory,
      giftCards,
      mutateGiftCards
    );
  }
  setCart(sale);
}

export async function saveSaleAndPark(
  cart: SaleObject,
  clerk: ClerkObject,
  customers: CustomerObject[],
  logs: LogObject[],
  mutateLogs: Function,
  sales: SaleObject[],
  mutateSales: Function,
  inventory: InventoryObject[],
  mutateInventory: Function,
  giftCards: GiftCardObject[],
  mutateGiftCards: Function
) {
  const id = await saveSaleItemsTransactionsToDatabase(
    { ...cart, state: SaleStateTypes.Parked },
    clerk,
    sales,
    mutateSales,
    inventory,
    mutateInventory,
    giftCards,
    mutateGiftCards
  );
  saveLog(
    {
      log: `Sale #${id} parked (${cart?.items?.length} item${
        cart?.items?.length === 1 ? "" : "s"
      }${
        cart?.customer_id
          ? ` for ${
              customers?.filter(
                (c: CustomerObject) => c?.id === cart?.customer_id
              )[0]?.name
            }.`
          : ""
      }).`,
      clerk_id: clerk?.id,
      table_id: "sale",
      row_id: id,
    },
    logs,
    mutateLogs
  );
  mutateInventory && mutateInventory();
}

export async function saveSaleItemsTransactionsToDatabase(
  cart: SaleObject,
  clerk: ClerkObject,
  sales: SaleObject[],
  mutateSales: Function,
  inventory: InventoryObject[],
  mutateInventory: Function,
  giftCards: GiftCardObject[],
  mutateGiftCards: Function,
  prevState?: string
) {
  let { totalStoreCut, totalPrice, numberOfItems, itemList } = getSaleVars(
    cart,
    inventory
  );
  let newSale = {
    ...cart,
    store_cut: totalStoreCut * 100,
    total_price: totalPrice * 100,
    number_of_items: numberOfItems,
    item_list: itemList,
  };
  let newSaleId = newSale?.id;
  //
  // HANDLE SALE OBJECT
  //
  // console.log(newSale);
  if (!newSaleId) {
    // Sale is new, save to database and add id to sales
    newSale.state = newSale?.state || SaleStateTypes.InProgress;
    console.log("Getting sale ID");
    newSaleId = await saveSaleToDatabase(newSale, clerk);
    console.log("Got sale ID");
    newSale = { ...newSale, id: newSaleId };
    mutateSales([...sales, newSale], false);
  } else {
    // Sale already has id, update
    updateSaleInDatabase(newSale);
    let otherSales = sales?.filter((s: SaleObject) => s?.id !== newSaleId);
    mutateSales([...otherSales, newSale], false);
  }
  //
  // HANDLE ITEMS
  //
  for (const item of cart?.items) {
    let invItem = inventory?.filter(
      (i: InventoryObject) => i?.id === item?.item_id
    )[0];
    console.log(invItem);
    // Check whether inventory item needs restocking
    const quantity = getItemQuantity(invItem, cart?.items);
    let quantity_layby = invItem?.quantity_layby || 0;
    // let quantity_sold = invItem?.quantity_sold || 0;
    if (quantity > 0) {
      invItem.needs_restock = true;
      addRestockTask(invItem?.id);
    }

    // If sale is complete, validate gift card
    if (cart?.state === SaleStateTypes.Completed && item?.is_gift_card) {
      // Add to collection
      invItem.gift_card_is_valid = true;
      const otherGiftCards = giftCards?.filter(
        (g: GiftCardObject) => g?.id !== invItem?.id
      );
      mutateGiftCards([...otherGiftCards, invItem], false);
      validateGiftCard(item?.item_id);
    }

    // Add or update Sale Item
    if (!item?.id) {
      // Item is new to sale
      console.log("Creating new item in " + newSaleId);
      let newSaleItem = { ...item, sale_id: newSaleId };
      saveSaleItemToDatabase(newSaleItem);
    } else {
      // Item was already in sale, update in case discount, quantity has changed or item has been deleted
      updateSaleItemInDatabase(item);
    }

    // Add stock movement if it's a regular stock item
    if (!item?.is_gift_card && !item?.is_misc_item) {
      if (cart?.state === SaleStateTypes.Completed) {
        // If it was a layby, unlayby it before marking as sold
        if (prevState === SaleStateTypes.Layby && !item?.is_gift_card) {
          saveStockMovementToDatabase(
            item,
            clerk,
            StockMovementTypes.Unlayby,
            null
          );
          quantity_layby -= 1;
          console.log("Removed layby quantity");
        }
        // Mark stock as sold
        saveStockMovementToDatabase(item, clerk, StockMovementTypes.Sold, null);
        // Sold quantity is not in main inventory
        // quantity_sold += 1;
        // console.log("Added sold quantity");

        // Add layby stock movement if it's a new layby
      } else if (
        cart?.state === SaleStateTypes.Layby &&
        prevState !== SaleStateTypes.Layby
      ) {
        saveStockMovementToDatabase(
          item,
          clerk,
          StockMovementTypes.Layby,
          null
        );
        quantity_layby += 1;
        console.log("Added layby quantity");
      }

      // Update inventory item if it's a regular stock item
      const otherInventoryItems = inventory?.filter(
        (i: InventoryObject) => i?.id !== invItem?.id
      );
      mutateInventory &&
        mutateInventory(
          [...otherInventoryItems, { ...invItem, quantity, quantity_layby }],
          false
        );
      console.log({ ...invItem, quantity, quantity_layby });
    }
  }

  //
  // HANDLE TRANSACTIONS
  //
  for await (const trans of cart?.transactions) {
    if (!trans?.id) {
      // Transaction is new to sale
      console.log("Creating new transaction in " + newSaleId);
      let newSaleTransaction = { ...trans, sale_id: newSaleId };
      saveSaleTransaction(
        newSaleTransaction,
        clerk,
        giftCards,
        mutateGiftCards
      );
    }
  }
  // console.log(cartTransactions);
  // // TODO does this need a return
  // return { ...newSale, items: cartItems, transactions: cartTransactions };
  return newSaleId;
}

export async function saveSaleToDatabase(sale: SaleObject, clerk: ClerkObject) {
  console.log("Sale being saved");
  console.log(
    JSON.stringify({
      customer_id: sale?.customer_id || null,
      state: sale?.state || null,
      sale_opened_by: clerk?.id,
      weather: JSON.stringify(sale?.weather) || "",
      geo_latitude: sale?.geo_latitude || null,
      geo_longitude: sale?.geo_longitude || null,
      note: sale?.note || null,
      layby_started_by: sale?.layby_started_by || null,
      date_layby_started: sale?.date_layby_started || null,
      sale_closed_by: sale?.sale_closed_by || null,
      date_sale_closed: sale?.date_sale_closed || null,
      store_cut: sale?.store_cut || null,
      total_price: sale?.total_price || null,
      number_of_items: sale?.number_of_items || null,
      item_list: sale?.item_list || null,
    })
  );
  try {
    const res = await fetch(
      `/api/create-sale?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: sale?.customer_id || null,
          state: sale?.state || null,
          sale_opened_by: clerk?.id,
          weather: JSON.stringify(sale?.weather) || "",
          geo_latitude: sale?.geo_latitude || null,
          geo_longitude: sale?.geo_longitude || null,
          note: sale?.note || null,
          layby_started_by: sale?.layby_started_by || null,
          date_layby_started: sale?.date_layby_started || null,
          sale_closed_by: sale?.sale_closed_by || null,
          date_sale_closed: sale?.date_sale_closed || null,
          store_cut: sale?.store_cut || null,
          total_price: sale?.total_price || null,
          number_of_items: sale?.number_of_items || null,
          item_list: sale?.item_list || null,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveSaleItemToDatabase(item: SaleItemObject) {
  try {
    const res = await fetch(
      `/api/create-sale-item?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_id: item?.sale_id,
          item_id: item?.item_id,
          quantity: item?.quantity,
          vendor_discount: item?.vendor_discount || null,
          store_discount: item?.store_discount || null,
          is_gift_card: item?.is_gift_card || null,
          is_misc_item: item?.is_misc_item || null,
          note: item?.note || null,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveSaleTransaction(
  transaction: SaleTransactionObject,
  clerk: ClerkObject,
  giftCards: GiftCardObject[],
  mutateGiftCards: Function
) {
  if (transaction?.payment_method === PaymentMethodTypes.Account) {
    // Add account payment as a store payment to the vendor
    let vendorPaymentId = null;
    const vendorPayment = {
      amount: transaction?.is_refund
        ? transaction?.amount * -1
        : transaction?.amount,
      clerk_id: transaction?.clerk_id,
      vendor_id: transaction?.vendor?.id,
      type: "sale",
    };
    vendorPaymentId = await saveVendorPaymentToDatabase(vendorPayment);
    transaction = { ...transaction, vendor_payment_id: vendorPaymentId };
  }
  if (transaction?.payment_method === PaymentMethodTypes.GiftCard) {
    if (transaction?.is_refund) {
      // Gift card is new, create new one
      saveStockToDatabase(transaction?.gift_card_update, clerk);
    } else {
      // Update gift card
      updateStockItemInDatabase(transaction?.gift_card_update);
    }
    const otherGiftCards = giftCards?.filter(
      (g: GiftCardObject) => g?.id !== transaction?.gift_card_update?.id
    );
    mutateGiftCards([...otherGiftCards, transaction?.gift_card_update], false);
  }
  saveSaleTransactionToDatabase(transaction);
}

export async function saveSaleTransactionToDatabase(
  transaction: SaleTransactionObject
) {
  try {
    const res = await fetch(
      `/api/create-sale-transaction?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveClosedRegisterToDatabase(
  register_id: number,
  register: RegisterObject,
  till: TillObject,
  logs: LogObject[],
  mutateLogs: Function
) {
  try {
    const tillID = await saveTillToDatabase(till);
    const res = await fetch(
      `/api/update-register?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...register,
          id: register_id,
          close_till_id: tillID,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    saveLog(
      {
        log: `Register closed.`,
        table_id: "register",
        row_id: json?.insertId,
        clerk_id: register?.closed_by_id,
      },
      logs,
      mutateLogs
    );
    setRegister(json?.insertId);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveAndOpenRegister(
  register: RegisterObject,
  till: TillObject,
  clerk: ClerkObject,
  logs: LogObject[],
  mutateLogs: Function
) {
  try {
    const tillID = await saveTillToDatabase(till);
    const res = await fetch(
      `/api/create-register?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...register, open_till_id: tillID }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    saveLog(
      {
        log: `Register opened.`,
        table_id: "register",
        row_id: json?.insertId,
        clerk_id: clerk?.id,
      },
      logs,
      mutateLogs
    );
    setRegister(json?.insertId);
    return [{ num: json?.insertId }];
  } catch (e) {
    throw Error(e.message);
  }
}

export async function savePettyCashToRegister(
  registerID: number,
  clerkID: number,
  isTake: boolean,
  amount: string,
  note: string,
  logs: LogObject[],
  mutateLogs: Function
) {
  try {
    let numberAmount = parseFloat(amount) * 100;
    if (isTake) numberAmount = numberAmount * -1;
    const res = await fetch(
      `/api/create-petty-cash?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          register_id: registerID,
          clerk_id: clerkID,
          amount: numberAmount,
          is_take: isTake,
          note,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    saveLog(
      {
        log: `$${parseFloat(amount)?.toFixed(2)} ${
          isTake ? "taken from till." : "put in till."
        }`,
        table_id: "register_petty_cash",
        row_id: json?.insertId,
        clerk_id: clerkID,
      },
      logs,
      mutateLogs
    );
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveTillToDatabase(till: TillObject) {
  try {
    const res = await fetch(
      `/api/create-till?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(till),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveVendorPaymentToDatabase(
  vendorPayment: VendorPaymentObject
) {
  try {
    const res = await fetch(
      `/api/create-vendor-payment?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorPayment),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveSelectToDatabase(
  label: string,
  setting_select: string,
  mutate: Function
) {
  try {
    const res = await fetch(
      `/api/create-setting-select?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label, setting_select }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    mutate();
    return json.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveHoldToDatabase(
  sale: SaleObject,
  item: SaleItemObject,
  holdPeriod: number,
  note: string,
  clerk: ClerkObject
) {
  try {
    const res = await fetch(
      `/api/create-hold?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: sale?.customer_id,
          item_id: item?.item_id,
          quantity: item?.quantity,
          vendor_discount: item?.vendor_discount,
          store_discount: item?.store_discount,
          hold_period: holdPeriod,
          started_by: clerk?.id,
          note: note,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    saveStockMovementToDatabase(item, clerk, "hold", null);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveCustomerToDatabase(
  customer: CustomerObject,
  clerk: ClerkObject,
  customers: CustomerObject[],
  mutateCustomers: Function
) {
  try {
    const res = await fetch(
      `/api/create-customer?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...customer, created_by_clerk_id: clerk?.id }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    mutateCustomers([...customers, customer], false);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function updateCustomerInDatabase(
  customer: CustomerObject,
  customers: CustomerObject[],
  mutateCustomers: Function
) {
  try {
    const res = await fetch(
      `/api/update-customer?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    const otherCustomers = customers?.filter(
      (c: CustomerObject) => c?.id !== customer?.id
    );
    mutateCustomers([...otherCustomers, customer], false);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function returnHoldToStock(
  hold: HoldObject,
  clerk: ClerkObject,
  holds: HoldObject[],
  mutateHolds: Function,
  inventory: InventoryObject[],
  mutateInventory: Function
) {
  // TODO Return Hold to Stock
  // setLog(
  //   `Hold returned to stock.`,
  //   "holds",
  //   get(hold, "id", ""),
  //   currentStaff
  // );
  // updateData({
  //   dispatch,
  //   collection: "holds",
  //   doc: get(hold, "id", null),
  //   update: {
  //     deleted: true,
  //     dateRemovedFromHold: new Date(),
  //     removedFromHoldBy: get(currentStaff, "id", null),
  //     sold: false,
  //   },
  // });
  // setHold(null);
  // dispatch(closeDialog("holdItem"));
  // updateData({
  //   dispatch,
  //   collection: "inventory",
  //   doc: get(hold, "item.id", null),
  //   update: {
  //     quantity: get(stockItem, "quantity", 0) + holdItemQty,
  //     quantityOnHold:
  //       get(stockItem, "quantityOnHold", 0) - holdItemQty,
  //   },
  // });
}

export async function updateHoldInDatabase(item) {
  try {
    const res = await fetch(
      `/api/update-hold?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveGiftCardToDatabase() {
  try {
    const res = await fetch(
      `/api/create-hold?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveLog(
  log: LogObject,
  logs: LogObject[],
  mutateLogs: Function
) {
  let logObj = {
    log: log?.log,
    table_id: log?.table_id || null,
    row_id: log?.row_id || null,
    clerk_id: log?.clerk_id || null,
  };
  try {
    const res = await fetch(
      `/api/create-log?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logObj),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    if (logs) mutateLogs([...logs, { ...logObj, id: json?.insertId }], false);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function addRestockTask(id: number) {
  console.log("Adding restock task");
  try {
    const res = await fetch(
      `/api/restock-task?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, needs_restock: true }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveTaskToDatabase(task: TaskObject, clerk: ClerkObject) {
  try {
    const res = await fetch(
      `/api/create-task?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: task?.description,
          created_by_clerk_id: clerk?.id,
          assigned_to: task?.assigned_to || null,
          assigned_to_clerk_id: task?.assigned_to_clerk_id || null,
          is_priority: task?.is_priority || 0,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function completeTask(task: TaskObject, clerk: ClerkObject) {
  try {
    const res = await fetch(
      `/api/complete-task?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: task?.id,
          completed_by_clerk_id: clerk?.id,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function completeRestockTask(id: number) {
  try {
    const res = await fetch(
      `/api/restock-task?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, needs_restock: false }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveStockPriceToDatabase(
  stock_id: number,
  clerk: ClerkObject,
  total_sell: number,
  vendor_cut: number,
  note: string
) {
  try {
    const res = await fetch(
      `/api/create-stock-price?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock_id,
          clerk_id: clerk?.id,
          vendor_cut,
          total_sell,
          note,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveStockMovementToDatabase(
  item: SaleItemObject,
  clerk: ClerkObject,
  act: string,
  note: string
) {
  try {
    const res = await fetch(
      `/api/create-stock-movement?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock_id: item?.item_id,
          clerk_id: clerk?.id,
          quantity:
            act === StockMovementTypes.Received ||
            act === StockMovementTypes.Unhold ||
            act === StockMovementTypes.Unlayby ||
            act === StockMovementTypes.Found ||
            act === StockMovementTypes.Unsold
              ? parseInt(item?.quantity)
              : -parseInt(item?.quantity),
          act,
          note,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function saveStockToDatabase(
  item: InventoryObject | GiftCardObject,
  clerk: ClerkObject
) {
  try {
    const res = await fetch(
      `/api/create-stock-item?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...item, created_by_id: clerk?.id || null }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    return json?.insertId;
  } catch (e) {
    throw Error(e.message);
  }
}

export async function updateStockItemInDatabase(
  item: InventoryObject | GiftCardObject
) {
  try {
    const res = await fetch(
      `/api/update-stock-item?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function updateGiftCard(giftCard: GiftCardObject) {
  try {
    const res = await fetch(
      `/api/update-gift-card?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(giftCard),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function updateSaleInDatabase(sale: SaleObject) {
  try {
    const res = await fetch(
      `/api/update-sale?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_id: sale?.id,
          customer_id: sale?.customer_id || null,
          state: sale?.state || null,
          note: sale?.note ? sale?.note : null,
          date_layby_started: sale?.date_layby_started || null,
          layby_started_by: sale?.layby_started_by || null,
          date_sale_closed: sale?.date_sale_closed || null,
          sale_closed_by: sale?.sale_closed_by || null,
          store_cut: sale?.store_cut || null,
          total_price: sale?.total_price || null,
          number_of_items: sale?.number_of_items || null,
          item_list: sale?.item_list || null,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function updateSaleItemInDatabase(saleItem: SaleItemObject) {
  try {
    const res = await fetch(
      `/api/update-sale-item?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_item_id: saleItem?.id,
          sale_id: saleItem?.sale_id,
          item_id: saleItem?.item_id,
          quantity: parseInt(saleItem?.quantity),
          vendor_discount: parseInt(saleItem?.vendor_discount),
          store_discount: parseInt(saleItem?.store_discount),
          note: saleItem?.note,
          is_refunded: saleItem?.is_refunded,
          refund_note: saleItem?.refund_note,
          is_deleted: saleItem?.is_deleted,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function setRegister(register_id: number) {
  console.log("Set Register");
  try {
    const res = await fetch(
      `/api/set-register?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          register_id: register_id,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function validateGiftCard(id: number) {
  try {
    const res = await fetch(
      `/api/validate-gift-card?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

// export async function updateSaleTransactionInDatabase(
//   transaction: SaleTransactionObject
// ) {
//   try {
//     const res = await fetch("/api/update-sale-transaction", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         // sale_item_id: cartItem?.id,
//         // sale_id: cart?.id,
//         // item_id: cartItem?.item_id,
//         // quantity: parseInt(cartItem?.quantity),
//         // vendor_discount: parseInt(cartItem?.vendor_discount),
//         // store_discount: parseInt(cartItem?.store_discount),
//         // note: cartItem?.note,
//         // is_deleted: cartItem?.is_deleted,
//       }),
//     });
//     const json = await res.json();
//     if (!res.ok) throw Error(json.message);
//   } catch (e) {
//     throw Error(e.message);
//   }
// }

export async function deleteSaleItemFromDatabase(sale_item_id: number) {
  try {
    const res = await fetch(
      `/api/delete-sale-item?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_item_id,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function deleteSaleTransactionFromDatabase(
  transaction_id: number,
  transactions: SaleTransactionObject[],
  mutate: Function
) {
  try {
    const res = await fetch(
      `/api/delete-sale-transaction?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
    let deletedTransaction = transactions?.filter(
      (t: SaleTransactionObject) => t?.id === transaction_id
    )[0];
    let otherTransactions = transactions?.filter(
      (t: SaleTransactionObject) => t?.id !== transaction_id
    );
    mutate(
      [...otherTransactions, { ...deletedTransaction, is_deleted: true }],
      false
    );
  } catch (e) {
    throw Error(e.message);
  }
}

export async function deleteSaleFromDatabase(sale_id: number) {
  try {
    const res = await fetch(
      `/api/delete-sale?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sale_id,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw Error(json.message);
  } catch (e) {
    throw Error(e.message);
  }
}

export async function receiveStock(
  newStockData: any,
  obj: any,
  clerk: ClerkObject
) {
  let items = obj?.items || {};
  let vendorId = obj?.vendor_id;
  // Save new stock items
  newStockData.forEach(async (row: any) => {
    const newStockID = await saveStockToDatabase(row, clerk);
    saveStockMovementToDatabase(
      {
        item_id: newStockID,
        quantity: row?.quantityReceived,
      },
      clerk,
      StockMovementTypes?.Received,
      "New stock received."
    );
  });
  // Save added items
  if (vendorId && Object.keys(items).length > 0) {
    Object.entries(items)
      .filter(([id, receiveQuantity]) => parseInt(`${receiveQuantity}`) > 0)
      .forEach(([id, receiveQuantity]) => {
        saveStockMovementToDatabase(
          {
            item_id: parseInt(id),
            quantity: `${receiveQuantity}`,
          },
          clerk,
          StockMovementTypes?.Received,
          "Existing stock received."
        );
      });
  }
}

export function returnStock(
  vendorId: number,
  items: any,
  notes: string,
  clerk: ClerkObject,
  inventory: InventoryObject[],
  mutateInventory: Function,
  logs: LogObject[],
  mutateLogs: Function
) {
  if (vendorId && Object.keys(items).length > 0) {
    const itemIds = Object.entries(items)?.map(([id]) => parseInt(id));
    const otherInventoryItems = inventory?.filter(
      (i: InventoryObject) => !itemIds?.includes(i?.id)
    );
    let updatedInventoryItems = [];
    Object.entries(items)
      .filter(
        ([id, returnQuantity]: [string, string]) =>
          parseInt(`${returnQuantity}`) > 0
      )
      .forEach(([id, returnQuantity]: [string, string]) => {
        const stockItem = inventory?.filter(
          (i: InventoryObject) => i?.id === parseInt(id)
        )[0];
        updatedInventoryItems.push({
          ...stockItem,
          quantity_returned:
            (stockItem?.quantity_returned || 0) + parseInt(returnQuantity),
          quantity: (stockItem?.quantity || 0) - parseInt(returnQuantity),
        });
        saveStockMovementToDatabase(
          {
            item_id: parseInt(id),
            quantity: `${returnQuantity}`,
          },
          clerk,
          StockMovementTypes?.Returned,
          notes || "Stock returned to vendor."
        );
        saveLog(
          {
            log: `${getItemDisplayName(
              stockItem
            )} (x${returnQuantity}) returned to vendor.`,
            clerk_id: clerk?.id,
            table_id: "stock_movement",
            row_id: null,
          },
          logs,
          mutateLogs
        );
      });
    mutateInventory([...otherInventoryItems, ...updatedInventoryItems], false);
  }
}

export function uploadFiles(files) {
  // const body = new FormData();
  // body.append("file", files);
  // console.log(body);
  // console.log(files);
  try {
    fetch(`/api/upload-file?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: files,
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  } catch (e) {
    throw Error(e.message);
  }
}
