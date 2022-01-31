import RadioButton from "@/components/_components/inputs/radio-button";
import Image from "next/image";
import SettingsSelect from "@/components/_components/inputs/settings-select";
import TextField from "@/components/_components/inputs/text-field";
import {
  getImageSrc,
  getItemDisplayName,
  getItemSku,
} from "@/lib/data-functions";
import { StockObject, VendorObject } from "@/lib/types";
import { useMemo } from "react";
import { useVendors } from "@/lib/swr-hooks";

interface inventoryProps {
  item: StockObject;
  setItem: Function;
  disabled?: boolean;
}

export default function InventoryItemForm({
  item,
  setItem,
  disabled,
}: inventoryProps) {
  const handleChange = (e) =>
    setItem({ ...item, [e.target.name]: e.target.value });
  const { vendors } = useVendors();

  const vendor = useMemo(
    () =>
      (vendors &&
        vendors.filter(
          (vendor: VendorObject) => vendor?.id === item?.vendor_id
        )[0]) ||
      null,
    [item]
  );
  return (
    <div>
      <div className="flex justify-start w-full">
        {/* IMAGE */}
        <div className="pr-2 w-52 mr-2">
          <div className="w-52 h-52 relative">
            <Image
              layout="fill"
              objectFit="contain"
              src={getImageSrc(item)}
              alt={item?.title || "Inventory image"}
            />
            {item?.id && (
              <div className="absolute w-52 h-8 bg-opacity-50 bg-black text-white flex justify-center items-center">
                {getItemSku(item)}
              </div>
            )}
          </div>
        </div>
        {/* MAIN DETAILS */}
        <div className="w-full">
          <TextField
            value={item?.artist || ""}
            onChange={(e: any) => setItem({ ...item, artist: e.target.value })}
            inputLabel="ARTIST"
            disabled={disabled}
          />
          <TextField
            value={item?.title || ""}
            onChange={(e: any) => setItem({ ...item, title: e.target.value })}
            inputLabel="TITLE"
            disabled={disabled}
          />
          <TextField
            value={item?.display_as || getItemDisplayName(item)}
            onChange={(e: any) =>
              setItem({ ...item, display_as: e.target.value })
            }
            inputLabel="DISPLAY NAME"
            disabled={disabled}
          />
          {vendor && (
            <div className="font-bold text-sm">{`Selling for ${vendor?.name}`}</div>
          )}
        </div>
      </div>
      <div className="mb-2">
        <TextField
          id="barcode"
          multiline
          inputLabel="BARCODE"
          value={item?.barcode || ""}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <SettingsSelect
          object={item}
          onEdit={setItem}
          inputLabel="TYPE"
          dbField="media"
          isCreateDisabled={true}
          isDisabled={disabled}
        />
        <SettingsSelect
          object={item}
          onEdit={setItem}
          inputLabel="FORMAT"
          dbField="format"
          isDisabled={disabled}
        />
      </div>
      {item?.format == "Shirt" ? (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <SettingsSelect
            object={item}
            onEdit={setItem}
            inputLabel="COLOUR"
            dbField="colour"
            isDisabled={disabled}
          />
          <SettingsSelect
            object={item}
            onEdit={setItem}
            inputLabel="SIZE"
            dbField="size"
            isDisabled={disabled}
          />
        </div>
      ) : (
        <div className="flex items-end">
          <RadioButton
            key={`isNew${item?.is_new}`}
            inputLabel="CONDITION"
            group="isNew"
            value={item?.is_new ? "true" : "false"}
            onChange={(value: string) =>
              setItem({ ...item, is_new: value === "true" ? 1 : 0 })
            }
            options={[
              { id: "new", value: "true", label: "New" },
              { id: "used", value: "false", label: "Used" },
            ]}
            disabled={disabled}
          />
          <SettingsSelect
            className="w-full"
            object={item}
            onEdit={setItem}
            dbField="cond"
            isCreateDisabled={true}
            isDisabled={disabled}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 items-center justify-center">
        <SettingsSelect
          object={item}
          onEdit={setItem}
          inputLabel="COUNTRY"
          dbField="country"
          isDisabled={disabled}
        />
        <SettingsSelect
          object={item}
          onEdit={setItem}
          inputLabel="GENRE"
          dbField="genre"
          isDisabled={disabled}
        />
      </div>
      <SettingsSelect
        object={item}
        onEdit={setItem}
        isMulti
        inputLabel="TAGS"
        dbField="tag"
        isDisabled={disabled}
      />
      <TextField
        id="description"
        inputLabel="DESCRIPTION"
        value={item?.description || ""}
        onChange={handleChange}
        multiline
        disabled={disabled}
      />
      <TextField
        id="note"
        inputLabel="NOTES"
        value={item?.note || ""}
        onChange={handleChange}
        multiline
        disabled={disabled}
      />
    </div>
  );
}
