import { useAtom } from "jotai";
import {
  showCartAtom,
  showCartScreenAtom,
  showHoldAtom,
  showCreateContactAtom,
  showItemScreenAtom,
  showCloseRegisterScreenAtom,
  pettyCashAtom,
} from "@/lib/atoms";
import { useInventory } from "@/lib/swr-hooks";
import { useSwipeable } from "react-swipeable";

import SearchBar from "./sell-search-bar";
import InventoryScroll from "./inventory-scroll";
import ShoppingCart from "./shopping-cart";
import HoldScreen from "@/components/hold/hold-screen";
import CreateContactScreen from "@/components/contact/create-contact-screen";
import SaleScreen from "@/components/sale-screen";
import InventoryItemScreen from "../inventory/inventory-item-screen";
import PettyCashDialog from "@/components/register/petty-cash";
import CloseRegisterScreen from "@/components/register/close-register-screen";

export default function SellScreen() {
  const [showCart, setShowCart] = useAtom(showCartAtom);
  const [showSaleScreen, setShowSaleScreen] = useAtom(showCartScreenAtom);
  const [pettyCashDialog] = useAtom(pettyCashAtom);
  const [showHold, setShowHold] = useAtom(showHoldAtom);
  const [showCreateContact, setShowCreateContact] = useAtom(
    showCreateContactAtom
  );
  const [showItemScreen] = useAtom(showItemScreenAtom);
  const [showCloseRegisterScreen] = useAtom(showCloseRegisterScreenAtom);
  useInventory();
  const handlers = useSwipeable({
    onSwipedRight: () =>
      showSaleScreen
        ? setShowSaleScreen(false)
        : showCreateContact?.id
        ? setShowCreateContact({ id: 0 })
        : showHold
        ? setShowHold(false)
        : showCart
        ? setShowCart(false)
        : null,
    onSwipedLeft: () => (!showCart ? setShowCart(true) : null),
    preventDefaultTouchmoveEvent: true,
  });

  return (
    <div className="flex relative overflow-x-hidden" {...handlers}>
      <div className={`bg-blue-200 w-full sm:w-2/3`}>
        <SearchBar />
        <InventoryScroll />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showCart ? "left-0" : "left-full"
        } sm:left-2/3 h-full w-full bg-yellow-200 sm:w-1/3 sm:h-menu`}
      >
        <ShoppingCart />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showHold ? "left-0 sm:left-2/3" : "left-full"
        } h-full w-full bg-yellow-200 sm:w-1/3 sm:h-menu`}
      >
        <HoldScreen />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showCreateContact?.id ? "left-0 sm:left-2/3" : "left-full"
        } h-full w-full bg-yellow-200 sm:w-1/3 sm:h-menu`}
      >
        <CreateContactScreen />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showSaleScreen ? "left-0" : "left-full"
        } h-full w-full bg-yellow-200 sm:h-menu`}
      >
        <SaleScreen isCart={true} />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showItemScreen ? "left-0" : "left-full"
        } h-full w-full bg-yellow-200 sm:h-menu`}
      >
        <InventoryItemScreen />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showCreateContact?.id ? "left-0 sm:left-2/3" : "left-full"
        } h-full w-full bg-yellow-200 sm:w-1/3 sm:h-menu`}
      >
        <CreateContactScreen />
      </div>
      <div
        className={`absolute top-0 transition-offset duration-300 ${
          showCloseRegisterScreen ? "left-0" : "left-full"
        } h-full w-full bg-yellow-200 sm:h-menu`}
      >
        <CloseRegisterScreen />
      </div>
      {pettyCashDialog && <PettyCashDialog />}
    </div>
  );
}