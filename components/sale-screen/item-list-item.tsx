// Packages
import { useState, useEffect } from "react";
import { useAtom } from "jotai";

// DB
import { useInventory, useSaleItemsForSale, useLogs } from "@/lib/swr-hooks";
import {
  newSaleObjectAtom,
  loadedSaleObjectAtom,
  alertAtom,
  clerkAtom,
} from "@/lib/atoms";
import { InventoryObject, SaleItemObject } from "@/lib/types";
import { MouseEventHandler } from "react";

// Functions
import {
  getItemSku,
  getItemDisplayName,
  getCartItemSummary,
  getImageSrc,
} from "@/lib/data-functions";
import {
  updateSaleItemInDatabase,
  saveLog,
  deleteSaleItemFromDatabase,
} from "@/lib/db-functions";

// Components
import Image from "next/image";

type SellListItemProps = {
  saleItem: SaleItemObject;
  isNew: boolean;
  selected?: boolean;
  onClick?: MouseEventHandler;
};

export default function ItemListItem({
  saleItem,
  isNew,
  selected,
  onClick,
}: SellListItemProps) {
  // Atoms
  const [sale] = useAtom(isNew ? newSaleObjectAtom : loadedSaleObjectAtom);

  // SWR
  const { inventory } = useInventory();

  // State
  const [item, setItem] = useState(null);

  // Load
  useEffect(() => {
    setItem(
      inventory?.filter((i: InventoryObject) => i.id === saleItem?.item_id)[0]
    );
  }, [inventory]);

  // Functions

  return (
    <div
      className={`flex w-full relative pt mb-2${
        saleItem?.is_refunded ? " opacity-50" : ""
      }${onClick ? " cursor-pointer" : ""}${selected ? " bg-red-100" : ""}`}
      onClick={onClick || null}
    >
      <div className="w-20">
        <div className="w-20 h-20 relative">
          <Image
            layout="fill"
            objectFit="cover"
            src={getImageSrc(item)}
            alt={item?.title || "Inventory image"}
          />
          {!item?.is_gift_card && !item?.is_misc_item && (
            <div className="absolute w-20 h-8 bg-opacity-50 bg-black text-white text-sm flex justify-center items-center">
              {getItemSku(item)}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col w-full p-2 justify-between">
        <div className="text-sm pl-1">
          <div>{getItemDisplayName(item)}</div>
          {saleItem?.is_refunded && (
            <div className={"text-red-500"}>REFUNDED</div>
          )}
        </div>
        <div
          className={`text-red-500 self-end${
            saleItem?.is_refunded ? " line-through" : ""
          }`}
        >
          <div>{getCartItemSummary(item, saleItem)}</div>
        </div>
      </div>
    </div>
  );
}
