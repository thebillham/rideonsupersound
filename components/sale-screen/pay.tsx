// Packages
import { useState } from "react";
import { useAtom } from "jotai";

// DB
import {
  useCustomers,
  useVendorFromCustomer,
  useSaleTransactionsForSale,
  useSaleItemsForSale,
  useSaleInventory,
} from "@/lib/swr-hooks";
import {
  newSaleObjectAtom,
  loadedSaleObjectAtom,
  viewAtom,
  loadedCustomerObjectAtom,
} from "@/lib/atoms";
import {
  CustomerObject,
  SaleTransactionObject,
  OpenWeatherObject,
} from "@/lib/types";

// Functions
import {
  convertMPStoKPH,
  convertDegToCardinal,
  getSaleVars,
} from "@/lib/data-functions";

// Components
import CreateableSelect from "@/components/inputs/createable-select";
import TextField from "@/components/inputs/text-field";

export default function Pay({ isNew }) {
  // Atoms
  const [sale, setSale] = useAtom(
    isNew ? newSaleObjectAtom : loadedSaleObjectAtom
  );
  const [, setCustomer] = useAtom(loadedCustomerObjectAtom);
  const [view, setView] = useAtom(viewAtom);

  // SWR
  const { customers } = useCustomers();
  const { vendor } = useVendorFromCustomer(sale?.customer_id);
  const { items } = useSaleItemsForSale(sale?.id);
  const { transactions } = useSaleTransactionsForSale(sale?.id);
  const { saleInventory } = useSaleInventory();

  // State
  const [note, setNote] = useState("");
  const { totalRemaining } = getSaleVars(items, transactions, saleInventory);

  // Components
  const SaleCompletedDetails = () => {
    const weather: OpenWeatherObject = sale?.weather
      ? JSON.parse(sale?.weather)
      : null;
    console.log(weather);
    return (
      <div className="px-2">
        {weather && (
          <div className="bg-blue-200 p-2 mb-2 rounded-md">
            <div className="font-bold">Weather</div>
            <div className="flex">
              <div>
                <img
                  src={`http://openweathermap.org/img/w/${weather?.weather[0]?.icon}.png`}
                />
              </div>
              <div>
                <div className="font-bold">{`${weather?.weather[0]?.main} (${weather?.weather[0]?.description})`}</div>
                <div>{`${weather?.main?.temp.toFixed(
                  1
                )}°C (felt like ${weather?.main?.feels_like.toFixed(
                  1
                )}°C)`}</div>
                {weather?.wind && (
                  <div>
                    Wind was {convertMPStoKPH(weather?.wind?.speed).toFixed(1)}
                    km/hr, {convertDegToCardinal(weather?.wind?.deg)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {sale?.geo_latitude && sale?.geo_longitude && (
          <iframe
            width="400"
            height="400"
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_API_KEY}
      &q=${sale?.geo_latitude},${sale?.geo_longitude}`}
          ></iframe>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="flex justify-between my-2">
        <div
          className={`text-2xl font-bold ${
            totalRemaining === 0
              ? "text-primary"
              : totalRemaining < 0
              ? "text-secondary"
              : "text-tertiary"
          }`}
        >
          {sale?.state === "completed"
            ? "SALE COMPLETED"
            : totalRemaining === 0
            ? "ALL PAID"
            : totalRemaining < 0
            ? "CUSTOMER OWED"
            : "LEFT TO PAY"}
        </div>
        <div className="text-2xl text-red-500 font-bold text-xl">
          {totalRemaining === 0
            ? ""
            : totalRemaining < 0
            ? `$${Math.abs(totalRemaining || 0)?.toFixed(2)}`
            : `$${(totalRemaining || 0)?.toFixed(2)}`}
        </div>
      </div>
      {sale?.state === "completed" && <SaleCompletedDetails />}
      {totalRemaining === 0 && sale?.state !== "completed" && (
        <div className="font-sm">Click complete sale to finish.</div>
      )}
      {sale?.state !== "completed" && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            className="square-button"
            onClick={() => setView({ ...view, cashPaymentDialog: true })}
          >
            CASH
          </button>
          <button
            className="square-button"
            onClick={() => setView({ ...view, cardPaymentDialog: true })}
          >
            CARD
          </button>
          <button
            className="square-button"
            disabled={!sale?.customer_id}
            onClick={() => setView({ ...view, acctPaymentDialog: true })}
          >
            ACCT
          </button>
          <button
            className="square-button"
            onClick={() => setView({ ...view, giftPaymentDialog: true })}
          >
            GIFT
          </button>
        </div>
      )}
      {sale?.state === "completed" ||
      sale?.state === "layby" ||
      transactions?.filter(
        (s: SaleTransactionObject) => s?.payment_method === "acct"
      )?.length > 0 ? (
        <div className="mt-2">
          {sale?.customer_id ? (
            <div>
              <span className="font-bold">Customer: </span>
              <span>
                {(customers || []).filter(
                  (c: CustomerObject) => c?.id === sale?.customer_id
                )[0]?.name || ""}
              </span>
            </div>
          ) : (
            <div>No customer set.</div>
          )}
        </div>
      ) : (
        <>
          <div className="font-bold mt-2">
            Select customer to enable laybys and account payments.
          </div>
          <CreateableSelect
            inputLabel="Select customer"
            value={sale?.customer_id}
            label={
              (customers || []).filter(
                (c: CustomerObject) => c?.id === sale?.customer_id
              )[0]?.name || ""
            }
            onChange={(customerObject: any) => {
              setSale((s) => ({
                ...s,
                customer_id: parseInt(customerObject?.value),
              }));
            }}
            onCreateOption={(inputValue: string) => {
              setCustomer({ name: inputValue });
              setView({ ...view, createCustomer: true });
            }}
            options={customers?.map((val: CustomerObject) => ({
              value: val?.id,
              label: val?.name || "",
            }))}
          />
        </>
      )}
      <TextField
        inputLabel="Note"
        multiline
        value={note}
        onChange={(e: any) => setNote(e.target.value)}
      />
    </div>
  );
}
