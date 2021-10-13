import { useState, useMemo } from "react";
import Modal from "@/components/container/modal";
import { useAtom } from "jotai";
import { paymentDialogAtom, cartAtom, saleAtom, clerkAtom } from "@/lib/atoms";
import TextField from "@/components/inputs/text-field";
import { ModalButton } from "@/lib/types";

import {
  useSaleTransactionsForSale,
  useVendorTotalPayments,
  useVendorTotalSales,
  useVendorFromContact,
} from "@/lib/swr-hooks";
import { getTotalOwing } from "@/lib/data-functions";
import { saveSaleTransaction } from "@/lib/db-functions";

export default function Acct({ isCart }) {
  const [clerk] = useAtom(clerkAtom);
  const [paymentDialog, setPaymentDialog] = useAtom(paymentDialogAtom);
  const [cart, setCart] = useAtom(isCart ? cartAtom : saleAtom);
  const { vendor } = useVendorFromContact(cart?.contact_id);
  const { totalPayments } = useVendorTotalPayments(cart?.contact_id);
  const { totalSales } = useVendorTotalSales(cart?.contact_id);
  const { mutateSaleTransactions } = useSaleTransactionsForSale(cart?.id);
  const totalOwing = useMemo(
    () =>
      totalPayments && totalSales
        ? getTotalOwing(totalPayments, totalSales) / 100
        : 0,
    [totalPayments, totalSales]
  );
  const [acctPayment, setAcctPayment] = useState(
    `${paymentDialog?.remainingBalance}`
  );
  const [submitting, setSubmitting] = useState(false);

  const buttons: ModalButton[] = [
    {
      type: "ok",
      disabled:
        submitting ||
        parseFloat(acctPayment) > paymentDialog?.remainingBalance ||
        totalOwing < parseFloat(acctPayment) ||
        parseFloat(acctPayment) === 0 ||
        acctPayment <= "" ||
        isNaN(parseFloat(acctPayment)),
      onClick: async () => {
        setSubmitting(true);
        await saveSaleTransaction(
          cart,
          clerk,
          acctPayment,
          paymentDialog?.remainingBalance,
          "acct",
          mutateSaleTransactions,
          setCart,
          vendor
        );
        setSubmitting(false);
        setPaymentDialog(null);
      },
      text: "COMPLETE",
    },
  ];

  return (
    <Modal
      open={paymentDialog?.method === "acct"}
      closeFunction={() => setPaymentDialog(null)}
      title={"ACCOUNT PAYMENT"}
      buttons={buttons}
    >
      <>
        <TextField
          divClass="text-8xl"
          startAdornment="$"
          inputClass="text-center"
          value={acctPayment}
          autoFocus
          selectOnFocus
          onChange={(e: any) => setAcctPayment(e.target.value)}
        />
        <div className="text-center">{`Remaining to pay: $${(
          paymentDialog?.remainingBalance || 0
        ).toFixed(2)}`}</div>
        <div className="text-center font-bold">
          {`Remaining in account: $${totalOwing.toFixed(2)}`}
        </div>
        <div className="text-center text-xl font-bold my-4">
          {acctPayment === "" || parseFloat(acctPayment) === 0
            ? "..."
            : isNaN(parseFloat(acctPayment))
            ? "NUMBERS ONLY PLEASE"
            : parseFloat(acctPayment) > paymentDialog?.remainingBalance
            ? `PAYMENT TOO HIGH`
            : totalOwing < parseFloat(acctPayment)
            ? `NOT ENOUGH IN ACCOUNT`
            : parseFloat(acctPayment) < paymentDialog?.remainingBalance
            ? `AMOUNT SHORT BY $${(
                paymentDialog?.remainingBalance - parseFloat(acctPayment)
              ).toFixed(2)}`
            : "ALL GOOD!"}
        </div>
      </>
    </Modal>
  );
}
