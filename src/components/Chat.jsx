import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  CloseOutlined,
  LeftOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useRoomAdmin } from "../@hooks/globalState";
import { getChat, getRoom, saveMessage } from "../service/chat";
import { format } from "date-fns";
import Linkify from "react-linkify";
import { botTest } from "../service/botTest";
import Swal from "sweetalert2";
import botImg from "../assets/bot-img.jpg";
Chat.propTypes = {
  socket: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

function Chat({ socket, name, username, room, role }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [allRoom, setAllRoom] = useState([]);
  const [nameRoom, setNameRoom] = useState("");
  const { roomAdmin, setRoomAdmin } = useRoomAdmin();
  const [botResponse, setBotResponse] = useState(true);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);

  const fileInputRef = useRef(null);

  const clearFileInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = [];
    images.forEach((image) => {
      if (typeof image === "string") return;
      newImageUrls.push(URL.createObjectURL(image));
    });
    setImageURLs(newImageUrls);
  }, [images]);

  const bot = useCallback(async () => {
    if (role === "m" && botResponse) {
      try {
        const botMessage = await botTest(currentMessage);
        if (botMessage) {
          const res = await saveMessage("bot", "bot123", room, botMessage);
          const newMessageData = {
            name: res.name,
            room: res.room_id,
            sender_id: res.sender_id,
            message_content: res.message_content,
            sent_at: res.sent_at,
          };
          await socket.emit("send_message", newMessageData);
          setMessageList((list) => [...list, newMessageData]);
        } else {
          setBotResponse(false);
        }
      } catch (error) {
        console.error("Error bot sending message:", error);
      }
    }
  }, [botResponse, currentMessage, role, room, socket]);

  const sendMessage = useCallback(async () => {
    if (currentMessage !== "" || images.length > 0) {
      try {
        const res = await saveMessage(
          name,
          username,
          room,
          currentMessage,
          images[0]
        );
        const newMessageData = {
          name: res.name,
          room: res.room_id,
          sender_id: res.sender_id,
          message_content: res.message_content,
          sent_at: res.sent_at,
          image: res.image,
        };
        await socket.emit("send_message", newMessageData);
        setMessageList((list) => [...list, newMessageData]);
        setCurrentMessage("");
        setImageURLs([]);
        clearFileInputValue();
        bot();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }, [bot, currentMessage, images, name, room, socket, username]);

  useEffect(() => {
    if (role === "m" && !botResponse) {
      Swal.fire({
        title: "Bot ไม่ตอบสนอง คุณต้องการคุยกับ Admin ไหม?",
        showCancelButton: true,
        cancelButtonText: "ไม่ต้องการ",
        confirmButtonText: "ต้องการ",
        confirmButtonColor: "#1f5e95",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          setBotResponse(false);
          Swal.fire({
            title: "กรุณารอ Admin เข้ามาสักครู่",
            confirmButtonColor: "#1f5e95",
          });
        } else {
          setBotResponse(true);
        }
      });
    }
  }, [botResponse, role]);

  useEffect(() => {
    if (role) {
      if (role === "a") {
        if (roomAdmin) {
          getChat(roomAdmin).then((res) => setMessageList(res.data));
        }
        getRoom().then((res) => setAllRoom(res.data));
      } else {
        getChat(username).then((res) => setMessageList(res.data));
      }
    }
  }, [role, roomAdmin, username]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", receiveMessageHandler);
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  const scrollToBottom = () => {
    const divChat = document.querySelector(".chat");
    if (divChat) {
      divChat.scrollTop = divChat.scrollHeight - divChat.clientHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const linkStyle = {
    textDecoration: "underline",
  };

  return (
    <>
      {role ? (
        <div className="px-4 md:flex items-start gap-5 justify-center pt-3 md:pt-4 pb-7 ">
          <div className={`${roomAdmin ? "hidden" : ""}`}>
            <div
              className={` ${
                role === "m" ? "hidden" : ""
              } h-[540px] w-full md:w-[580px] border-[1px] rounded-[15px] p-[20px] flex flex-col gap-3 bg-white`}
            >
              {allRoom?.map((room) => (
                <div
                  key={room.room_id}
                  className="flex items-center w-full h-[40px] rounded-[15px] bg-[#f0f0f0] hover:bg-[#e9e8e8] px-[20px] cursor-pointer"
                  onClick={() => {
                    socket.emit("leave_room", roomAdmin);
                    setRoomAdmin(room.room_id);
                    setNameRoom(room.room_name);
                  }}
                >
                  {room.room_name}
                </div>
              ))}
            </div>
          </div>
          <div className={`${role === "a" && !roomAdmin ? "hidden" : ""}`}>
            <div className="relative w-full md:w-[580px] h-[540px] border-[1px] rounded-[15px] mx-auto overflow-hidden bg-white">
              <div className="px-3 flex justify-start items-center gap-2 shadow-[0px_1px_7px_0px_#62618E30] h-[40px]">
                <div
                  className={`${
                    role === "a" ? "" : "hidden"
                  } flex justify-center items-center rounded-full w-[35px] h-[30px] hover:bg-[#f3f6ff] cursor-pointer`}
                  onClick={() => {
                    setRoomAdmin("");
                    setMessageList([]);
                  }}
                >
                  <LeftOutlined className="text-[#0185ff] text-[20px]" />
                </div>
                <p className="font-[500] text-[17px] text-[#5E6470]">
                  {role === "a" ? nameRoom : "Library Chatbot"}
                </p>
              </div>
              <div
                className={`${
                  imageURLs.length > 0 ? "h-[60%]" : "h-[80%]"
                } chat  overflow-y-auto overflow-x-hidden px-[20px] w-full`}
              >
                <Linkify
                  componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={decoratedHref}
                      key={key}
                      style={linkStyle}
                    >
                      {decoratedText}
                    </a>
                  )}
                >
                  {messageList.map((messageContent, index) => {
                    return (
                      <React.Fragment key={index}>
                        <div
                          className={`flex ${
                            messageContent.message_content ? "pt-5" : "py-5"
                          } ${
                            username === messageContent.sender_id
                              ? "justify-end"
                              : "justify-start"
                          } ${messageContent.image ? "" : "hidden"} `}
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL}/api/images/${
                              messageContent.image
                            }`}
                            className="rounded-[20px] max-w-[65%]"
                            alt={messageContent?.image}
                          />
                        </div>
                        <div
                          className={`relative flex items-center gap-3 ${
                            username === messageContent.sender_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`${
                              messageContent.sender_id === "bot123"
                                ? ""
                                : "hidden"
                            }`}
                          >
                            <img
                              src={botImg}
                              width={40}
                              height={40}
                              alt="bot-icon"
                              className="select-none rounded-full"
                            />
                          </div>
                          <div
                            className={`${
                              username === messageContent.sender_id
                                ? "bg-[#1f5e95] text-white"
                                : "bg-[#f1f0f0]"
                            } ${
                              messageContent.message_content ? "" : "hidden"
                            } rounded-[18px] my-4 py-2 px-3 w-fit max-w-[85%] whitespace-pre-wrap break-words`}
                          >
                            <p>{messageContent.message_content}</p>
                          </div>
                          <div
                            className={`${
                              username === messageContent.sender_id
                                ? "right-0"
                                : "left-0"
                            } absolute  bottom-[-6px] text-[12px] text-[#5E6470]`}
                          >
                            {messageContent.sent_at
                              ? format(
                                  new Date(
                                    messageContent.sent_at
                                  ).toLocaleString("en-US", {
                                    timeZone: "UTC",
                                  }),
                                  "d MMM yyyy HH:mm"
                                )
                              : ""}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </Linkify>
              </div>
              <div className="p-[20px]">
                {imageURLs?.map((imageSrc, index) => (
                  <div
                    key={index}
                    className="relative w-[81px] h-[81px] rounded-[17px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageSrc})` }}
                  >
                    <div className="absolute top-[5px] right-[5px]">
                      <CloseOutlined
                        className="text-[#5E6470]"
                        onClick={() => {
                          setImageURLs([]);
                          clearFileInputValue();
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 bg-white items-center px-[20px] w-[95%] h-[50px] absolute m-auto left-0 right-0 bottom-[16px] shadow-[0px_5px_7px_1px_#62618E30] rounded-[15px]">
                <div className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer">
                  <PaperClipOutlined className="text-[#0185ff] text-[20px]" />
                </div>
                <div>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }}
                    className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer"
                  >
                    <PictureOutlined className="text-[#0185ff] text-[20px]" />
                  </button>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      setImages([...e.target.files]);
                    }}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
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
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Chat;
