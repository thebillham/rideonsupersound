import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  useInventory,
  useContacts,
  useVendorFromContact,
} from "@/lib/swr-hooks";
import {
  newSaleObjectAtom,
  loadedSaleObjectAtom,
  viewAtom,
  loadedContactObjectAtom,
} from "@/lib/atoms";
import { ContactObject } from "@/lib/types";
import { getSaleVars } from "@/lib/data-functions";
import CreateableSelect from "@/components/inputs/createable-select";
import TextField from "@/components/inputs/text-field";

export default function Pay({ isNew }) {
  const [sale, setSale] = useAtom(
    isNew ? newSaleObjectAtom : loadedSaleObjectAtom
  );
  const [, setContact] = useAtom(loadedContactObjectAtom);
  const [view, setView] = useAtom(viewAtom);
  const { inventory } = useInventory();
  const { contacts } = useContacts();
  const { vendor } = useVendorFromContact(sale?.contact_id);
  const [note, setNote] = useState("");
  useEffect(() => {
    const { totalRemaining } = getSaleVars(sale, inventory);
    setSale({ ...sale, remainingBalance: totalRemaining });
  }, [view, sale]);
  //
  // function onClickGoBack() {
  //   setShowSaleScreen(false);
  // }
  return (
    <div className="flex flex-col justify-between">
      <div className="flex justify-between my-2">
        <div className="text-2xl font-bold">LEFT TO PAY</div>
        <div className="text-2xl text-red-500 font-bold text-xl">
          ${(sale?.remainingBalance || 0).toFixed(2)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          className="square-button"
          disabled={sale?.remainingBalance === 0}
          onClick={() => setView({ ...view, cashPaymentDialog: true })}
        >
          CASH
        </button>
        <button
          className="square-button"
          disabled={sale?.remainingBalance === 0}
          onClick={() => setView({ ...view, cardPaymentDialog: true })}
        >
          CARD
        </button>
        <button
          className="square-button"
          disabled={
            !sale?.contact_id || !vendor || sale?.remainingBalance === 0
          }
          onClick={() => setView({ ...view, acctPaymentDialog: true })}
        >
          ACCT
          <div className={`text-xs ${sale?.contact_id ? "hidden" : "w-full"}`}>
            Contact Required
          </div>
        </button>
        <button
          className="square-button"
          disabled={true || sale?.remainingBalance === 0}
          onClick={() => setView({ ...view, giftPaymentDialog: true })}
        >
          GIFT
          <div className={`text-xs`}>Out of Order</div>
        </button>
      </div>
      <CreateableSelect
        inputLabel="Select contact"
        value={sale?.contact_id}
        label={
          (contacts || []).filter(
            (c: ContactObject) => c?.id === sale?.contact_id
          )[0]?.name || ""
        }
        onChange={(contactObject: any) => {
          setSale({
            ...sale,
            contact_id: parseInt(contactObject?.value),
          });
        }}
        onCreateOption={(inputValue: string) => {
          setContact({ name: inputValue });
          setView({ ...view, createContact: true });
        }}
        options={contacts?.map((val: ContactObject) => ({
          value: val?.id,
          label: val?.name || "",
        }))}
      />
      <TextField
        inputLabel="Note"
        multiline
        value={note}
        onChange={(e: any) => setNote(e.target.value)}
      />
    </div>
  );
}
