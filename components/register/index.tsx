import { useState, useEffect } from "react";
import { useAtom } from "jotai";

// Store
import { getAmountFromCashMap } from "@/lib/data-functions";
import { saveAndOpenRegister } from "@/lib/db-functions";
import { TillObject, RegisterObject } from "@/lib/types";
import { useRegisterID } from "@/lib/swr-hooks";
import { clerkAtom } from "@/lib/atoms";

import TextField from "@/components/inputs/text-field";
import CircularProgress from "@mui/material/CircularProgress";
import OpenIcon from "@mui/icons-material/ShoppingCart";
import CashMap from "./cash-map";

export default function OpenRegisterScreen() {
  // State
  const { mutateRegisterID } = useRegisterID();
  const [clerk] = useAtom(clerkAtom);
  const [till, setTill] = useState({});
  const [notes, setNotes] = useState("");
  const [openAmount, setOpenAmount]: [string, Function] = useState(
    `${getAmountFromCashMap(till)}`
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => setOpenAmount(getAmountFromCashMap(till)), [till]);
  const invalidOpenAmount = isNaN(parseFloat(`${openAmount}`));

  const openRegister = async () => {
    const register: RegisterObject = {
      opened_by_id: clerk?.id,
      open_amount: openAmount ? parseFloat(openAmount) * 100 : 0,
      open_note: notes || null,
    };
    setLoading(true);
    await saveAndOpenRegister(register, till, clerk);
    mutateRegisterID();
    setLoading(false);
  };

  return (
    <div className="flex justify-center bg-white h-menu">
      <div className="flex flex-col justify-center h-full pt-12 max-w-md">
        <div className="text-sm">
          Open register by entering the total float in the till. Either enter
          the notes and coins or enter the total directly.
        </div>
        <TextField
          startAdornment="$"
          inputLabel="Total Float"
          divClass="text-5xl"
          selectOnFocus
          error={isError(till)}
          value={`${openAmount}`}
          onChange={(e: any) => setOpenAmount(e.target.value)}
        />
        <CashMap till={till} setTill={setTill} />
        <TextField
          inputLabel="Notes"
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
          multiline
        />
        <button
          disabled={isError(till) || invalidOpenAmount || loading}
          className="my-6 dialog-action__ok-button"
          onClick={openRegister}
        >
          {loading ? (
            <span className="pr-4">
              <CircularProgress color="inherit" size={18} />
            </span>
          ) : (
            <OpenIcon className="mr-2" />
          )}
          Open Register
        </button>
      </div>
    </div>
  );
}

function isError(till: TillObject) {
  let error = false;
  [
    "one_hundred_dollar",
    "fifty_dollar",
    "twenty_dollar",
    "ten_dollar",
    "five_dollar",
    "two_dollar",
    "one_dollar",
    "fifty_cent",
    "twenty_cent",
    "ten_cent",
  ].forEach((denom) => {
    if (
      till[denom] &&
      (isNaN(parseInt(till[denom])) || parseInt(till[denom]) < 0)
    )
      error = true;
  });
  return error;
}