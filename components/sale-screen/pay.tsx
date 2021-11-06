// Packages
import { useState } from "react";
import { useAtom } from "jotai";

// DB
import { useContacts, useVendorFromContact } from "@/lib/swr-hooks";
import {
  newSaleObjectAtom,
  loadedSaleObjectAtom,
  viewAtom,
  loadedContactObjectAtom,
} from "@/lib/atoms";
import {
  ContactObject,
  SaleTransactionObject,
  OpenWeatherObject,
} from "@/lib/types";

// Functions
import { convertMPStoKPH, convertDegToCardinal } from "@/lib/data-functions";

// Components
import CreateableSelect from "@/components/inputs/createable-select";
import TextField from "@/components/inputs/text-field";

export default function Pay({ isNew }) {
  // Atoms
  const [sale, setSale] = useAtom(
    isNew ? newSaleObjectAtom : loadedSaleObjectAtom
  );
  const [, setContact] = useAtom(loadedContactObjectAtom);
  const [view, setView] = useAtom(viewAtom);

  // SWR
  const { contacts } = useContacts();
  const { vendor } = useVendorFromContact(sale?.contact_id);

  // State
  const [note, setNote] = useState("");

  // Components
  const SaleCompletedDetails = () => {
    console.log(sale?.weather);
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
            sale?.totalRemaining === 0
              ? "text-primary"
              : sale?.totalRemaining < 0
              ? "text-secondary"
              : "text-tertiary"
          }`}
        >
          {sale?.state === "completed"
            ? "SALE COMPLETED"
            : sale?.totalRemaining === 0
            ? "ALL PAID"
            : sale?.totalRemaining < 0
            ? "CUSTOMER OWED"
            : "LEFT TO PAY"}
        </div>
        <div className="text-2xl text-red-500 font-bold text-xl">
          {sale?.totalRemaining === 0
            ? ""
            : sale?.totalRemaining < 0
            ? `$${Math.abs(sale?.totalRemaining || 0)?.toFixed(2)}`
            : `$${(sale?.totalRemaining || 0)?.toFixed(2)}`}
        </div>
      </div>
      {sale?.state === "completed" && <SaleCompletedDetails />}
      {sale?.totalRemaining === 0 && sale?.state !== "completed" && (
        <div className="font-sm">Click complete sale to finish.</div>
      )}
      {sale?.state !== "completed" && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            className="square-button"
            disabled={sale?.totalRemaining === 0}
            onClick={() => setView({ ...view, cashPaymentDialog: true })}
          >
            CASH
          </button>
          <button
            className="square-button"
            disabled={sale?.totalRemaining === 0}
            onClick={() => setView({ ...view, cardPaymentDialog: true })}
          >
            CARD
          </button>
          <button
            className="square-button"
            disabled={
              !sale?.contact_id || !vendor || sale?.totalRemaining === 0
            }
            onClick={() => setView({ ...view, acctPaymentDialog: true })}
          >
            ACCT
            <div
              className={`text-xs ${sale?.contact_id ? "hidden" : "w-full"}`}
            >
              Contact Required
            </div>
          </button>
          <button
            className="square-button"
            disabled={true || sale?.totalRemaining === 0}
            onClick={() => setView({ ...view, giftPaymentDialog: true })}
          >
            GIFT
            <div className={`text-xs`}>Out of Order</div>
          </button>
        </div>
      )}
      {sale?.state === "completed" ||
      sale?.state === "layby" ||
      sale?.transactions?.filter(
        (s: SaleTransactionObject) => s?.payment_method === "acct"
      )?.length > 0 ? (
        <div className="mt-2">
          {sale?.contact_id ? (
            <div>
              <span className="font-bold">Contact: </span>
              <span>
                {(contacts || []).filter(
                  (c: ContactObject) => c?.id === sale?.contact_id
                )[0]?.name || ""}
              </span>
            </div>
          ) : (
            <div>No contact set.</div>
          )}
        </div>
      ) : (
        <>
          <div className="font-bold mt-2">
            Select contact to enable laybys and account payments.
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
