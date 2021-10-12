import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { useInventory } from "@/lib/swr-hooks";

import Image from "next/image";
import TextField from "@/components/inputs/text-field";
import DeleteIcon from "@mui/icons-material/Delete";
import { InventoryObject, SaleItemObject } from "@/lib/types";
import { cartAtom } from "@/lib/atoms";
import {
  getItemSku,
  getItemDisplayName,
  getCartItemSummary,
  writeCartItemPriceTotal,
  writeCartItemPriceBreakdown,
  getImageSrc,
} from "@/lib/data-functions";

type SellListItemProps = {
  index: number;
  cartItem: SaleItemObject;
  deleteCartItem?: Function;
};

export default function SellListItem({
  index,
  cartItem,
  deleteCartItem,
}: SellListItemProps) {
  const { inventory } = useInventory();
  const [cart, setCart] = useAtom(cartAtom);
  const [item, setItem] = useState(null);
  useEffect(() => {
    setItem(
      inventory.filter((i: InventoryObject) => i.id === cartItem?.item_id)[0]
    );
  }, [inventory]);
  const [expanded, setExpanded] = useState(false);

  function onChangeCart(e: any, property: string) {
    let newCart = { ...cart };
    if (newCart?.items && newCart?.items[index])
      newCart.items[index][property] = e.target.value;
    setCart(newCart);
  }

  return (
    <>
      <div
        className="flex w-full bg-black text-white relative pt mb-2 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="w-20">
          <div className="w-20 h-20 relative">
            <Image
              layout="fill"
              objectFit="cover"
              src={getImageSrc(item)}
              alt={item?.title || "Inventory image"}
            />
            <div className="absolute w-20 h-8 bg-opacity-50 bg-black text-white text-sm flex justify-center items-center">
              {getItemSku(item)}
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full p-2 justify-between">
          <div className="text-sm pl-1">
            {item?.is_gift_card
              ? item?.gift_card_code
              : item?.is_misc_item
              ? item?.misc_item_description
              : getItemDisplayName(item)}
          </div>
          <div className="text-red-500 self-end">
            {getCartItemSummary(item, cartItem)}
          </div>
        </div>
      </div>
      <div
        className={`text-black bg-white px-2 overflow-y-hidden transition-height duration-200 ${
          expanded ? "h-64" : "h-0"
        }`}
      >
        <div>
          {!item?.is_gift_card && !item?.is_misc_item && (
            <div className="flex justify-between items-end">
              <TextField
                className="w-1/3"
                inputLabel="QTY"
                selectOnFocus
                min={1}
                inputType="number"
                valueNum={parseInt(cartItem?.quantity)}
                onChange={(e: any) => onChangeCart(e, "quantity")}
              />
              <TextField
                className="mx-2 w-1/3"
                inputLabel="VEND. DISC."
                selectOnFocus
                max={100}
                inputType="number"
                endAdornment="%"
                valueNum={parseInt(cartItem?.vendor_discount)}
                onChange={(e: any) => onChangeCart(e, "vendor_discount")}
              />
              <TextField
                className="w-1/3"
                inputLabel="STORE DISC."
                selectOnFocus
                max={100}
                inputType="number"
                endAdornment="%"
                valueNum={parseInt(cartItem?.store_discount)}
                onChange={(e: any) => onChangeCart(e, "store_discount")}
              />
            </div>
          )}
          <TextField
            multiline
            rows={2}
            divClass="py-2"
            inputLabel="NOTES"
            value={cartItem?.note ?? ""}
            onChange={(e: any) => onChangeCart(e, "note")}
          />
          <div className="flex w-full justify-between place-start">
            <div className="font-bold">
              {writeCartItemPriceBreakdown(item, cartItem)}
            </div>
            <div>
              <div className="font-bold self-center">
                {writeCartItemPriceTotal(item, cartItem)}
              </div>
              <div className="w-50 text-right">
                <button
                  className="py-2 text-tertiary hover:text-tertiary-dark"
                  onClick={() => deleteCartItem(cartItem?.item_id)}
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}