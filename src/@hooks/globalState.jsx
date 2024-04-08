import { useAtom } from "jotai";
import { atom } from "jotai";

export const roomAdminAtom = atom("");
export const nameRoomAdminAtom = atom("");

export const useRoomAdmin = () => {
  const [roomAdmin, setRoomAdmin] = useAtom(roomAdminAtom);
  return {
    roomAdmin,
    setRoomAdmin,
  };
};

export const useNameRoomAdmin = () => {
  const [nameRoomAdmin, setNameRoomAdmin] = useAtom(nameRoomAdminAtom);
  return {
    nameRoomAdmin,
    setNameRoomAdmin,
  };
};
