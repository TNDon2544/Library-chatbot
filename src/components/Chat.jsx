import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useRoomAdmin } from "../@hooks/globalState";

Chat.propTypes = {
  socket: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

function Chat({ socket, username, room, role }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const { roomAdmin, setRoomAdmin } = useRoomAdmin();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", receiveMessageHandler);
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  return (
    <>
      {role ? (
        <div className="relative w-[580px] h-[520px] border-[1px] rounded-[15px] mx-auto mt-12">
          <div
            className={` ${
              role === "m" ? "hidden" : ""
            } absolute h-[520px] w-[300px] border-[1px] rounded-[15px] left-[-400px] top-0 p-[20px] flex flex-col gap-3`}
          >
            <div
              className="flex items-center w-full h-[40px] rounded-[15px] bg-[#f0f0f0] hover:bg-[#e9e8e8] px-[20px] cursor-pointer"
              onClick={() => {
                socket.emit("leave_room", roomAdmin);
                setRoomAdmin("s6203051613140");
              }}
            >
              กฤติน ลิ้มสมเกียรติ
            </div>
            <div
              className="flex items-center w-full h-[40px] rounded-[15px] bg-[#f0f0f0] hover:bg-[#e9e8e8] px-[20px] cursor-pointer"
              onClick={() => {
                socket.emit("leave_room", roomAdmin);
                setRoomAdmin("s6203051613093");
              }}
            >
              ภานุศักดิ์ ชอบธรรม
            </div>
            <div>
              Select :
              {roomAdmin === "s6203051613140"
                ? "กฤติน ลิ้มสมเกียรติ"
                : roomAdmin === "s6203051613093"
                ? "ภานุศักดิ์ ชอบธรรม"
                : ""}
            </div>
          </div>
          <div className="h-[85%] overflow-auto px-[20px]">
            {messageList.map((messageContent, index) => {
              return (
                <div
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                  key={index}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 bg-white items-center px-[20px] w-[95%] h-[50px] absolute m-auto left-0 right-0 bottom-[20px] shadow-[0px_5px_7px_1px_#62618E30] rounded-[15px]">
            <div className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer">
              <PaperClipOutlined className="text-[#0185ff] text-[20px]" />
            </div>
            <div className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer">
              <PictureOutlined className="text-[#0185ff] text-[20px]" />
            </div>
            <input
              type="text"
              value={currentMessage}
              className="w-full focus:outline-none"
              placeholder="Type a message here"
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyDown={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <div className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer">
              <SendOutlined
                onClick={sendMessage}
                className="text-[#0185ff] text-[20px]"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Chat;
