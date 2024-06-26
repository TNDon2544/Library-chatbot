import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import io from "socket.io-client";
import { checkRole } from "../service/auth";
import Chat from "./Chat";
import { useRoomAdmin } from "../@hooks/globalState";
import { UserSwitchOutlined, BellOutlined } from "@ant-design/icons";
import PopupEditRole from "./PopupEditRole";
import PopupNotification from "./PopupNotification";
import { getNotification } from "../service/chat";

function Home() {
  const [socket, setSocket] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupNotificationOpen, setPopupNotificationOpen] = useState(false);
  const username = localStorage.getItem("username");
  const [role, setRole] = useState("");
  const [notification, setNotification] = useState([]);
  const name = localStorage.getItem("name");
  const { roomAdmin } = useRoomAdmin();
  useEffect(() => {
    const newSocket = io.connect(`${import.meta.env.VITE_API_URL}`);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    checkRole().then((res) => setRole(res.role));
  }, []);

  useEffect(() => {
    getNotification().then((result) => setNotification(result.data));
  }, [popupNotificationOpen]);

  useEffect(() => {
    if (username !== "" && socket && role === "m") {
      socket.emit("join_room", username);
    } else if (username !== "" && socket && role === "a") {
      socket.emit("join_room", roomAdmin);
    }
  }, [username, socket, role, roomAdmin]);

  useEffect(() => {
    if (socket && role && role === "a") {
      const receiveNotificationHandler = (data) => {
        setNotification((list) => [...list, data]);
      };
      socket.on("receive_notification", receiveNotificationHandler);
      return () => {
        socket.off("receive_notification", receiveNotificationHandler);
      };
    }
  }, [role, socket]);

  return (
    <div>
      <Navbar />
      <div className="flex justify-end items-center gap-4 w-full md:w-[680px] lg:w-[880px] mx-auto px-8 pt-5">
        <button
          onClick={() => setPopupOpen(true)}
          className={`${
            role === "a" ? "" : "hidden"
          } relative group flex justify-center items-center bg-[#1f5e95] hover:bg-[#386c9c] p-2 rounded-full`}
        >
          <UserSwitchOutlined className="text-[20px] text-white" />
          <div className="z-[1] opacity-0 group-hover:opacity-100 duration-300 absolute top-[40px] bg-white border-[1px] border-[#B5C8DB] px-2 text-[#004370] text-sm font-[600] whitespace-nowrap ">
            Update Role
          </div>
        </button>
        <button
          onClick={() => setPopupNotificationOpen(true)}
          className={`${
            role === "a" ? "" : "hidden"
          } relative group flex justify-center items-center bg-[#1f5e95] hover:bg-[#386c9c] p-2 rounded-full`}
        >
          <BellOutlined className="text-[20px] text-white" />
          <div className="z-[1] opacity-0 group-hover:opacity-100 duration-300 absolute top-[40px] bg-white border-[1px] border-[#B5C8DB] px-2 text-[#004370] text-sm font-[600] whitespace-nowrap ">
            Notification
          </div>
          <div
            className={`${
              notification.length > 0 ? "" : "hidden"
            } absolute top-[-14px] right-[-6px] w-fit h-[25px] flex justify-center items-center px-2 bg-[#FF0000] border-[1px] border-white text-white rounded-full`}
          >
            {notification.length}
          </div>
        </button>
      </div>
      {socket ? (
        <Chat
          room={role === "m" ? username : roomAdmin}
          socket={socket}
          username={username}
          name={name}
          role={role}
        />
      ) : null}
      {popupOpen && (
        <div className="relative z-[2]">
          <PopupEditRole closePopup={() => setPopupOpen(false)} />
        </div>
      )}
      {popupNotificationOpen && (
        <div className="relative z-[2]">
          <PopupNotification
            notification={notification}
            socket={socket}
            closePopup={() => setPopupNotificationOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
