// Packages
import { useAtom } from "jotai";

// DB
import { useRegisterID } from "@/lib/swr-hooks";
import { clerkAtom, pageAtom, viewAtom } from "@/lib/atoms";

// Components
import Image from "next/image";
import Hamburger from "@/components/icon/hamburger";

import SellNavActions from "./actions/sell";
import InventoryNavActions from "./actions/inventory";
import PaymentNavActions from "./actions/payment";
import VendorNavActions from "./actions/vendor";
import ContactNavActions from "./actions/contact";

// Icons
import HelpIcon from "@mui/icons-material/Help";

// REVIEW fix all actions and clean up files

export default function Nav() {
  // SWR
  const { registerID } = useRegisterID();

  // Atoms
  const [clerk] = useAtom(clerkAtom);
  const [page] = useAtom(pageAtom);
  const [view, setView] = useAtom(viewAtom);

  return (
    <nav className="py-2 bg-black text-white h-nav">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-12">
            <div className="w-12 h-12 bg-black rounded-full mx-2 relative">
              <Image
                layout="fill"
                objectFit="cover"
                src={`${process.env.NEXT_PUBLIC_RESOURCE_URL}img/clerk/${clerk?.name}.png`}
                alt={clerk?.name}
              />
            </div>
          </div>
          <div className="ml-8">
            {/*<div className="sm:hidden">{`${clerk?.name?.toUpperCase()} @ R.O.S.S.`}</div>
            <div className="hidden sm:block">{`${clerk?.name?.toUpperCase()} @ RIDE ON SUPER SOUND`}</div>*/}
            <Image
              src={`${process.env.NEXT_PUBLIC_RESOURCE_URL}img/POS-RIDEONSUPERSOUNDLOGO.png`}
              alt="Ride On Super Sound"
              height="41px"
              width="283px"
            />
            {/*<div>{page?.toUpperCase()}</div>*/}
          </div>
        </div>
        <div className="flex mr-2">
          {page === "sell" && registerID > 0 && <SellNavActions />}
          {page === "inventory" && <InventoryNavActions />}
          {page === "contacts" && <ContactNavActions />}
          {page === "vendors" && <VendorNavActions />}
          {page === "payments" && <PaymentNavActions />}
          <button onClick={() => setView({ ...view, helpDialog: true })}>
            <HelpIcon />
          </button>
        </div>
        {/*<button
          className="px-4 sm:hidden"
          onClick={() => setView({...view, mainMenu: !view?.mainMenu})}
        >
          <Hamburger />
        </button>*/}
      </div>
    </nav>
  );
}

// <div
// className="bg-white rounded-full mx-2">
// <Image
//
//   layout="fill"
//   src={`${image ? URL.createObjectURL(blob) : "/clerk/guest.png"}`}
//   alt={clerk?.name}
// /></div>
