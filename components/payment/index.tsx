import { useMemo } from "react";
import { useAtom } from "jotai";
import { useClerks, useVendors, useVendorPayments } from "@/lib/swr-hooks";
import { ClerkObject, VendorPaymentObject, VendorObject } from "@/lib/types";
import { nzDate, fDateTime } from "@/lib/data-functions";
import { viewAtom } from "@/lib/atoms";
import CashPaymentDialog from "./cash-payment-dialog";
import BatchPaymentDialog from "./batch-payment-dialog";

import Table from "@/components/table";

export default function PaymentsScreen() {
  const { vendors } = useVendors();
  const { vendorPayments } = useVendorPayments();
  const { clerks } = useClerks();
  const [view] = useAtom(viewAtom);
  const data = useMemo(
    () =>
      (vendorPayments || []).map((v: VendorPaymentObject) => ({
        date: v?.date,
        vendor_id: v?.vendor_id,
        amount: v?.amount,
        type: v?.type,
        clerk: (clerks || []).filter(
          (c: ClerkObject) => c?.id === v?.clerk_id
        )[0]?.name,
      })),
    [vendorPayments, clerks]
  );

  console.log(data);

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
        width: 270,
        Cell: (item: any) =>
          item ? <div>{fDateTime(item?.value)}</div> : <div />,
        sortType: (rowA: VendorPaymentObject, rowB: VendorPaymentObject) => {
          const a = nzDate(rowA?.date);
          const b = nzDate(rowB?.date);
          return a > b ? 1 : b > a ? -1 : 0;
        },
      },
      {
        Header: "Vendor",
        accessor: "vendor_id",
        Cell: ({ value }) =>
          (vendors || []).filter((v: VendorObject) => v?.id === value)[0]
            ?.name || "",
      },
      {
        Header: "Amount",
        accessor: "amount",
        width: 100,
        Cell: ({ value }) =>
          value && !isNaN(value) ? `$${(value / 100)?.toFixed(2)}` : "N/A",
      },
      { Header: "Clerk", accessor: "clerk" },
      { Header: "Type", accessor: "type" },
    ],
    [vendors]
  );

  return (
    <div className="flex relative overflow-x-hidden bg-white text-black">
      <div className="h-menu">
        <Table
          color="bg-col8"
          colorLight="bg-col8-light"
          colorDark="bg-col8-dark"
          data={data}
          columns={columns}
          heading={"Vendor Payments"}
          pageSize={20}
          sortOptions={[{ id: "date", desc: true }]}
        />
      </div>
      {view?.batchVendorPaymentDialog && <BatchPaymentDialog />}
      {view?.cashVendorPaymentDialog && <CashPaymentDialog />}
    </div>
  );
}
