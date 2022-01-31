// Packages
import { useState } from "react";
import { useAtom } from "jotai";

// DB
import { useInventory, useRegisterID } from "@/lib/swr-hooks";
import { viewAtom, clerkAtom, receiveStockAtom } from "@/lib/atoms";
import { ModalButton } from "@/lib/types";

// Functions
import { receiveStock } from "@/lib/db-functions";

// Components
import Stepper from "@/components/_components/navigation/stepper";
import ScreenContainer from "@/components/_components/container/screen";

// Icons
import SelectVendor from "./select-vendor";
import SelectItems from "./add-items";
import PrintLabel from "./print-label";
import CheckDetails from "./check-details";
import SetPriceAndQuantities from "./set-price-and-quantities";

export default function ReceiveStockScreen() {
  // Atoms
  const [basket, setBasket] = useAtom(receiveStockAtom);
  const { inventory, mutateInventory } = useInventory();
  const [view, setView] = useAtom(viewAtom);
  const [clerk] = useAtom(clerkAtom);
  const [step, setStep] = useState(0);
  const [receivedStock, setReceivedStock] = useState(null);

  // SWR
  const { registerID } = useRegisterID();

  const buttons: ModalButton[][] = [
    [
      {
        type: "cancel",
        onClick: () => setView({ ...view, receiveStockScreen: false }),
        text: "CANCEL",
      },
      {
        type: "ok",
        text: "NEXT",
        disabled: !basket?.vendor_id,
        onClick: () => setStep(1),
      },
    ],
    [
      {
        type: "cancel",
        onClick: () => {
          setStep(0);
          setBasket({});
        },
        text: "RESET",
      },
      {
        type: "ok",
        text: "NEXT",
        disabled: basket?.items?.length === 0,
        onClick: () => setStep(2),
      },
    ],
    [
      { type: "cancel", onClick: () => setStep(1), text: "BACK" },
      {
        type: "ok",
        text: "NEXT",
        onClick: () => {
          setStep(3);
        },
      },
    ],
    [
      { type: "cancel", onClick: () => setStep(2), text: "BACK" },
      {
        type: "ok",
        disabled: isDisabled(),
        text: "RECEIVE ITEMS",
        onClick: async () => {
          const receivedStock = await receiveStock(basket, clerk, registerID);
          mutateInventory();
          setReceivedStock(receivedStock);
          setStep(4);
        },
      },
    ],
    [
      {
        type: "ok",
        disabled: isDisabled(),
        text: "DONE",
        onClick: () => {
          setBasket({});
          setView({ ...view, receiveStockScreen: false });
        },
      },
    ],
  ];

  // TODO make stepper receive
  // Step 1 - select vendor or create new
  // Step 2 - select items, either
  //    from vendor items
  //    from csv
  //    write into table
  //    barcode -> discogs / googlebooks
  // Step 3 - select discogs/googlebooks
  // Step 4 - enter PRICE
  // Step 5 - enter quantity
  // Step 6 - print labels

  return (
    <ScreenContainer
      show={view?.receiveStockScreen}
      closeFunction={() => setView({ ...view, receiveStockScreen: false })}
      title={"RECEIVE STOCK"}
      buttons={buttons[step]}
      titleClass="bg-col2"
    >
      <div className="flex flex-col w-full">
        <Stepper
          steps={[
            "Select vendor",
            "Add items",
            "Check details",
            "Set price and quantities",
            "Print labels",
          ]}
          value={step}
          onChange={setStep}
          disabled
          selectedBg="bg-col2"
          notSelectedBg="bg-gray-200"
          selectedText="text-col2-dark"
          notSelectedText="text-black"
          selectedTextHover="text-col2-dark"
          notSelectedTextHover="text-gray-800"
        />
        {step === 0 && (
          <div>
            <SelectVendor />
          </div>
        )}
        {step === 1 && (
          <div>
            <SelectItems />
          </div>
        )}
        {step == 2 && (
          <div>
            <CheckDetails />
          </div>
        )}
        {step == 3 && (
          <div>
            <SetPriceAndQuantities />
          </div>
        )}
        {step == 4 && (
          <div>
            <PrintLabel receivedStock={receivedStock} />
          </div>
        )}
      </div>
    </ScreenContainer>
  );

  function isDisabled() {
    console.log(basket?.items);
    return (
      !basket?.vendor_id ||
      basket?.items?.length === 0 ||
      basket?.items?.filter(
        (item) =>
          !Number.isInteger(parseInt(`${item?.quantity}`)) ||
          !(
            (Number.isInteger(parseInt(`${item?.vendor_cut}`)) &&
              Number.isInteger(parseInt(`${item?.total_sell}`))) ||
            item?.item?.id
          )
      ).length > 0
    );
  }
}
