import { create } from 'zustand';

interface ModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useRegistrationModal = create<ModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
