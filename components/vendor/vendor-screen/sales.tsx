// DB
import { useInventory } from "@/lib/swr-hooks";
import { StockObject, VendorSaleItemObject } from "@/lib/types";

// Functions
import { getItemDisplayName } from "@/lib/data-functions";

// Components
import dayjs from "dayjs";

export default function VendorSales({ vendorDetails }) {
  // SWR
  const { inventory } = useInventory();

  return (
    <div>
      {vendorDetails?.totalSales?.length > 0 && (
        <div className="mt-4">
          <div className="border-b mb-2 flex text-sm">
            <div className="w-1/6">DATE SOLD</div>
            <div className="w-1/3">ITEM SOLD</div>
            <div className="w-1/6">FORMAT</div>
            <div className="w-1/6">TOTAL SELL</div>
            <div className="w-1/6">VENDOR TAKE</div>
          </div>

          <div className="border-b py-1 flex text-sm font-bold">
            <div className="w-1/6" />
            <div className="w-1/2">{`${vendorDetails?.totalSales?.length} ITEM${
              vendorDetails?.totalSales?.length === 1 ? "" : "S"
            } SOLD`}</div>
            <div className="w-1/6">
              {`$${(
                vendorDetails?.totalSales?.reduce(
                  (prev, curr) => prev + curr?.total_sell,
                  0
                ) / 100
              )?.toFixed(2)}`}
            </div>
            <div className="w-1/6">
              {`$${(
                vendorDetails?.totalSales?.reduce(
                  (prev, curr) => prev + curr?.vendor_cut,
                  0
                ) / 100
              )?.toFixed(2)}`}
            </div>
          </div>
          {vendorDetails?.totalSales
            ?.sort(
              (saleA: VendorSaleItemObject, saleB: VendorSaleItemObject) => {
                const a = dayjs(saleA?.date_sale_closed);
                const b = dayjs(saleB?.date_sale_closed);
                return a < b ? 1 : b < a ? -1 : 0;
              }
            )
            // ?.slice(0, 5)
            ?.map((sale: VendorSaleItemObject) => {
              const stockItem: StockObject = inventory?.filter(
                (i: StockObject) => i?.id === sale?.item_id
              )[0];
              return (
                <div
                  className="border-b py-1 flex hover:bg-gray-100 text-sm"
                  key={sale?.sale_id}
                >
                  <div className="font-bold w-1/6">
                    {dayjs(sale?.date_sale_closed).format("D MMMM YYYY")}
                  </div>
                  <div className="w-1/3">{`${
                    sale?.quantity
                  } x ${getItemDisplayName(stockItem)}`}</div>
                  <div className="w-1/6">{stockItem?.format}</div>
                  <div className="w-1/6">
                    {sale?.total_sell
                      ? `$${(sale?.total_sell / 100)?.toFixed(2)}`
                      : "N/A"}
                  </div>
                  <div className="w-1/6">
                    {sale?.vendor_cut
                      ? `$${(sale?.vendor_cut / 100)?.toFixed(2)}`
                      : "N/A"}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}