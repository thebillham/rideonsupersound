import { useAtom } from "jotai";
import { paymentDialogAtom, cartAtom } from "@/lib/atoms";
import { useInventory, useSaleTransactions } from "@/lib/swr-hooks";
import Pay from "./pay";
import SaleSummary from "./sale-summary";
import Action from "./action";
import Acct from "./payment/acct";
import Card from "./payment/card";
import Cash from "./payment/cash";
import Gift from "./payment/gift";

export default function SaleScreen() {
  const [cart] = useAtom(cartAtom);
  const [paymentDialog] = useAtom(paymentDialogAtom);
  const { isInventoryLoading } = useInventory();
  const { isSaleTransactionsLoading } = useSaleTransactions(cart?.id);
  return (
    <div className="bg-white text-black">
      {isInventoryLoading || isSaleTransactionsLoading ? (
        <div className="loading-screen">
          <div className="loading-icon" />
        </div>
      ) : (
        <>
          {paymentDialog === "acct" && <Acct />}
          {paymentDialog === "card" && <Card />}
          {paymentDialog === "cash" && <Cash />}
          {paymentDialog === "gift" && <Gift />}
          <div className="sm:hidden flex flex-col justify-between h-menu px-2">
            <Pay />
            <SaleSummary />
            <Action />
          </div>
          <div className="hidden sm:flex h-menu">
            <div className="w-2/3">
              <SaleSummary />
            </div>
            <div className="w-1/3 p-2 flex flex-col justify-between">
              <Pay />
              <Action />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
