import { useAtom } from "jotai";
import { atom } from "jotai";

export const roomAdminAtom = atom("");

export const useRoomAdmin = () => {
  const [roomAdmin, setRoomAdmin] = useAtom(roomAdminAtom);
  return {
    roomAdmin,
    setRoomAdmin,
  };
};
