import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CloseOutlined, LeftOutlined, PaperClipOutlined, PictureOutlined, SendOutlined } from "@ant-design/icons";
import { useRoomAdmin } from "../@hooks/globalState";
import { getChat, getRoom, saveMessage, uploadFile } from "../service/chat";
import { format } from "date-fns";
import Linkify from "react-linkify";
import Swal from "sweetalert2";
import botImg from "../assets/bot-img.jpg";
import { botTest } from "../service/botTest";

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

  const fileInputRef = useRef(null);

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };


  const clearFileInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const bot = useCallback(async () => {
    if (role === "m" && botResponse) {
      try {
        const botMessage = await botTest(currentMessage);
        if (botMessage) {
          const res = await saveMessage("bot", "bot123", room, botMessage);
          setMessageList((list) => [...list, res]);
        } else {
          setBotResponse(false);
        }
      } catch (error) {
        console.error("Error bot sending message:", error);
      }
    }
  }, [botResponse, currentMessage, role, room]);

  // Function to send a message
  const sendMessage = async () => {
    if (currentMessage !== "" || images.length > 0) {
      try {
        if (images.length > 0) {
          // Upload image and send message with image URL
          await uploadImage();
        } else {
          // Send text message
          const res = await saveMessage(name, username, room, currentMessage);
          setMessageList((list) => [...list, res]);
          setCurrentMessage("");
          bot();
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("Cannot send empty message");
    }
  };

  // Function to upload and downscale an image
  const uploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sender_id", username);
      formData.append("room_id", room);
      formData.append("message_content", ""); // Empty message content for image uploads
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        // Downscale image
        const downscaledImageDataURL = await downscaleImage(image);
        // Convert downscaled image data URL to Blob
        const downscaledImageBlob = await dataURLToBlob(downscaledImageDataURL);
        // Append downscaled image Blob to form data
        formData.append("file", downscaledImageBlob);
      }
      const res = await uploadFile(formData);
      setMessageList((list) => [...list, res]);
      setCurrentMessage("");
      setImages([]);
      clearFileInputValue();
      bot();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Function to downscale an image
  const downscaleImage = async (image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width * 0.5; // Scale down to 50%
        canvas.height = img.height * 0.5; // Scale down to 50%
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const downscaledDataURL = canvas.toDataURL("image/jpeg");
        resolve(downscaledDataURL);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });
  };

  // Function to convert data URL to Blob
  const dataURLToBlob = async (dataURL) => {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob;
  };

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
      if (data.file_data) {
        // If it's an image message, add it to the images array
        setImages((prevImages) => [...prevImages, data.file_data]);
      } else {
        // If it's a text message, add it to the message list
        setMessageList((list) => [...list, data]);
      }
    };
    socket.on("newImage", receiveMessageHandler); // Handle new image messages
    return () => {
      socket.off("newImage", receiveMessageHandler); // Clean up the event listener
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
              className={` ${role === "m" ? "hidden" : ""
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
                  className={`${role === "a" ? "" : "hidden"
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
                className={`${images.length > 0 ? "h-[60%]" : "h-[80%]"
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
                        {messageContent.message_content && (
                          <div
                            className={`relative flex items-center gap-3 ${username === messageContent.sender_id ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`${messageContent.sender_id === "bot123" ? "" : "hidden"}`}>
                              <img src={botImg} width={40} height={40} alt="bot-icon" className="select-none rounded-full" />
                            </div>
                            <div className={`${username === messageContent.sender_id ? "bg-[#1f5e95] text-white" : "bg-[#f1f0f0]"} ${messageContent.message_content ? "" : "hidden"} rounded-[18px] my-4 py-2 px-3 w-fit max-w-[85%] whitespace-pre-wrap break-words`}>
                              <p>{messageContent.message_content}</p>
                            </div>
                            <div className={`${username === messageContent.sender_id ? "right-0" : "left-0"} absolute bottom-[-6px] text-[12px] text-[#5E6470]`}>
                              {messageContent.sent_at ? format(new Date(messageContent.sent_at).toLocaleString("en-US", { timeZone: "UTC" }), "d MMM yyyy HH:mm") : ""}
                            </div>
                          </div>
                        )}
                        {messageContent.file_data && (
                          <div className={`flex ${messageContent.message_content ? "pt-5" : "py-5"} ${username === messageContent.sender_id ? "justify-end" : "justify-start"}`}>
                            {/* Check if the file data is a base64 string */}
                            {isBase64(messageContent.file_data) ? (
                              // Display the image using base64 data
                              <img src={`data:image/jpeg;base64,${messageContent.file_data}`} className="rounded-[20px] max-w-[65%]" alt="Uploaded File" />
                            ) : (
                              // Display the image using the file data URL
                              <img src={messageContent.file_data} className="rounded-[20px] max-w-[65%]" alt="Uploaded File" />
                            )}
                          </div>
                        )}

                      </React.Fragment>
                    );
                  })}
                </Linkify>
              </div>
              <div className="p-[20px]">
                {images?.map((imageSrc, index) => (
                  <div
                    key={index}
                    className="relative w-[81px] h-[81px] rounded-[17px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageSrc})` }}
                  >
                    <div className="absolute top-[5px] right-[5px]">
                      <CloseOutlined
                        className="text-[#5E6470]"
                        onClick={() => {
                          setImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
