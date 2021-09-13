import { useMemo } from "react";
import { useAtom } from "jotai";
import { useInventory, useTransactions } from "@/lib/swr-hooks";
import { cartAtom, paymentDialogAtom, showSaleScreenAtom } from "@/lib/atoms";
import {
  getTotalPrice,
  // getTotalStoreCut,
  getRemainingBalance,
} from "@/lib/data-functions";

export default function Pay() {
  const [cart] = useAtom(cartAtom);
  const [, openPaymentDialog] = useAtom(paymentDialogAtom);
  const [showSaleScreen] = useAtom(showSaleScreenAtom);
  const { inventory } = useInventory();
  const { transactions } = useTransactions(cart?.id);
  // const storeCut = useMemo(() => getTotalStoreCut(cart, inventory), [
  //   cart,
  //   inventory,
  // ]);
  const totalPrice = useMemo(() => getTotalPrice(cart, inventory), [
    cart,
    inventory,
    showSaleScreen,
  ]);
  const remainingBalance = useMemo(
    () => getRemainingBalance(totalPrice, transactions) / 100,
    [totalPrice, transactions]
  );
  return (
    <div>
      <div className="flex justify-between mb-2 mt-8">
        <div className="text-2xl text-blue-600 font-bold">PAY</div>
        <div className="text-2xl text-red-500 font-bold text-xl">
          ${(remainingBalance || 0).toFixed(2)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          className="square-button"
          disabled={remainingBalance === 0}
          onClick={() => openPaymentDialog("cash")}
        >
          CASH
        </button>
        <button
          className="square-button"
          disabled={remainingBalance === 0}
          onClick={() => openPaymentDialog("card")}
        >
          CARD
        </button>
        <button
          className="square-button"
          disabled={
            true
            // !contactVendor ||
            // !get(saleDialog, "contactId", null) ||
            // remainingBalance === 0
          }
          onClick={() => openPaymentDialog("acct")}
        >
          ACCT
        </button>
        <button
          className="square-button"
          disabled={remainingBalance === 0}
          onClick={() => openPaymentDialog("gift")}
        >
          GIFT
        </button>
      </div>
    </div>
  );
}
