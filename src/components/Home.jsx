import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import io from "socket.io-client";
import { checkRole } from "../service/auth";
import Chat from "./Chat";
import { useRoomAdmin } from "../@hooks/globalState";

function Home() {
  const [socket, setSocket] = useState(null);
  const username = localStorage.getItem("username");
  const [role, setRole] = useState("");
  const name = localStorage.getItem("name");
  const { roomAdmin } = useRoomAdmin();
  useEffect(() => {
    const newSocket = io.connect("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    checkRole().then((res) => setRole(res.role));
  }, []);

  useEffect(() => {
    if (username !== "" && socket && role === "m") {
      socket.emit("join_room", username);
    } else if (username !== "" && socket && role === "a") {
      socket.emit("join_room", roomAdmin);
    }
  }, [username, socket, role, roomAdmin]);

  return (
    <div>
      <Navbar />
      {socket ? (
        <Chat
          room={role === "m" ? username : roomAdmin}
          socket={socket}
          username={username}
          name={name}
          role={role}
        />
      ) : null}
    </div>
  );
}

export default Home;
