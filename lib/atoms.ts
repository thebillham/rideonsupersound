import { atom } from "jotai";

import { ClerkObject, CartObject, Modal } from "@/lib/types";

export const clerkAtom = atom<ClerkObject>({ id: null });
export const cartAtom = atom<CartObject>({ uid: null, items: {} });
export const pageAtom = atom<string>("sell");
export const menuDisplayAtom = atom<boolean>(false);
export const showCartAtom = atom<boolean>(false);

// modals
export const sellModalAtom = atom<Modal>({ open: false });
export const sellSearchBarAtom = atom<string>("");
