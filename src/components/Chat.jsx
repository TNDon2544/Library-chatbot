import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  CloseOutlined,
  LeftOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
  FileTextOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNameRoomAdmin, useRoomAdmin } from "../@hooks/globalState";
import {
  botApi,
  getChat,
  getRoom,
  saveMessage,
  sendNotification,
  uploadFile,
} from "../service/chat";
import { format } from "date-fns";
import Linkify from "react-linkify";
import Swal from "sweetalert2";
import botImg from "../assets/bot-img.jpg";
import { putMethod } from "../service/axiosFetchData";
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
  const [newMessage, setNewMessage] = useState();
  const [allRoom, setAllRoom] = useState([]);
  const { roomAdmin, setRoomAdmin } = useRoomAdmin();
  const { nameRoomAdmin, setNameRoomAdmin } = useNameRoomAdmin();
  const [botResponse, setBotResponse] = useState(true);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [file, setFile] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [searchRoom, setSearchRoom] = useState([]);
  const [chatLimit, setChatLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loadMoreChatTrigger, setLoadMoreChatTrigger] = useState(false);

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const clearImageInputValue = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const clearFileInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
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
        const botMessage = await botApi(username, currentMessage);
        if (botMessage.length > 0) {
          const res = await saveMessage(
            "bot",
            "bot123",
            room,
            botMessage[0].text
          );
          const newMessageData = {
            name: res.name,
            room: res.room_id,
            sender_id: res.sender_id,
            message_content: res.message_content,
            sent_at: res.sent_at,
          };
          await socket.emit("send_message", newMessageData);
          setMessageList((list) => [...list, newMessageData]);
          if (
            newMessageData.message_content ===
            "เราไม่เข้าใจที่คุณถาม กรุณาถามใหม่อีกครั้ง"
          ) {
            setBotResponse(false);
          }
        } else {
          setBotResponse(false);
        }
      } catch (error) {
        console.error("Error bot sending message:", error);
        setBotResponse(false);
      }
    }
  }, [botResponse, currentMessage, role, room, socket, username]);

  const getRoomFunction = useCallback(() => {
    if (role) {
      if (role === "a") {
        getRoom().then((res) => setAllRoom(res.data));
      }
    }
  }, [role]);

  useEffect(() => {
    getRoomFunction();
  }, [getRoomFunction, messageList, newMessage]);

  const loadMoreChat = useCallback(() => {
    setLoadMoreChatTrigger(true);
    setChatLimit(chatLimit + 10);
  }, [chatLimit]);

  const getChatFunction = useCallback(() => {
    if (role) {
      if (role === "a") {
        if (roomAdmin) {
          setMessageList([]);
          getChat(roomAdmin, chatLimit).then((res) => {
            setMessageList(res.data);
            if (res.data.length < chatLimit) {
              setHasMore(false);
            }
          });
        }
      } else {
        getChat(username, chatLimit).then((res) => {
          setMessageList(res.data);
          if (res.data.length < chatLimit) {
            setHasMore(false);
          }
        });
      }
    }
  }, [chatLimit, role, roomAdmin, username]);

  useEffect(() => {
    getChatFunction();
  }, [getChatFunction]);

  const sendMessage = async () => {
    if (currentMessage !== "" || images.length > 0 || file.length > 0) {
      try {
        if (images.length > 0) {
          await uploadImage();
        } else if (file.length > 0) {
          await uploadFileInput();
        } else {
          const res = await saveMessage(name, username, room, currentMessage);
          if (role === "a") {
            handleUpdateIsRead(roomAdmin);
          }
          const newMessageData = {
            name: res.name,
            room: res.room_id,
            sender_id: res.sender_id,
            message_content: res.message_content,
            sent_at: res.sent_at,
          };
          // console.log("res send", res);
          // console.log("newMessageData send", newMessageData);
          await socket.emit("send_message", newMessageData);
          setMessageList((list) => [...list, newMessageData]);
          setCurrentMessage("");
          setImages([]);
          setImageURLs([]);
          clearImageInputValue();
          bot();
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("Cannot send empty message");
    }
  };

  const uploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sender_id", username);
      formData.append("room_id", room);
      formData.append("message_content", currentMessage);
      formData.append("file_name", images[0].name);
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
      if (role === "a") {
        handleUpdateIsRead(roomAdmin);
      }
      const newMessageData = {
        name: res.name,
        room: res.room_id,
        sender_id: res.sender_id,
        message_content: res.message_content,
        sent_at: res.sent_at,
        file_data: res.file_data,
        file_name: res.file_name,
        file_type: res.file_type,
      };
      // console.log("res uploadImage", res);
      // console.log("newMessageData uploadImage", newMessageData);
      await socket.emit("send_message", newMessageData);
      setMessageList((list) => [...list, newMessageData]);
      setCurrentMessage("");
      setImages([]);
      setImageURLs([]);
      clearImageInputValue();
      // bot();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const uploadFileInput = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sender_id", username);
      formData.append("room_id", room);
      formData.append("message_content", currentMessage);
      formData.append("file", file[0]);
      formData.append("file_name", file[0].name);

      const res = await uploadFile(formData);
      if (role === "a") {
        handleUpdateIsRead(roomAdmin);
      }
      const newMessageData = {
        name: res.name,
        room: res.room_id,
        sender_id: res.sender_id,
        message_content: res.message_content,
        sent_at: res.sent_at,
        file_data: res.file_data,
        file_name: res.file_name,
        file_type: res.file_type,
      };
      // console.log("res uploadfile", res);
      // console.log("newMessageData uploadfile", newMessageData);
      await socket.emit("send_message", newMessageData);
      setMessageList((list) => [...list, newMessageData]);
      setCurrentMessage("");
      setFile([]);
      clearFileInputValue();
      // bot();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }, [currentMessage, file, name, role, room, roomAdmin, socket, username]);

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
        title: "คุณต้องการคุยกับ Admin ไหม?",
        showCancelButton: true,
        cancelButtonText: "ไม่ต้องการ",
        confirmButtonText: "ต้องการ",
        confirmButtonColor: "#1f5e95",
        showLoaderOnConfirm: true,
        preConfirm: () => {
          try {
            sendNotification(name, username).then(async (result) => {
              const newNotificationData = {
                create_time: result.create_time,
                id_user: result.id_user,
                message: result.message,
                name: result.name,
              };
              await socket.emit("send_notification", newNotificationData);
            });
          } catch (error) {
            Swal.showValidationMessage(`
              Request failed: ${error}
            `);
          }
        },

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
  }, [botResponse, name, role, socket, username]);

  const downloadFile = useCallback((file_url, file_name) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = file_url;
    downloadLink.download = file_name;
    downloadLink.click();
    URL.revokeObjectURL(file_url);
  }, []);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    const receiveAllMessage = (data) => {
      setNewMessage(data);
    };
    socket.on("receive_message", receiveMessageHandler);
    socket.on("receive_all_message", receiveAllMessage);
    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("receive_all_message", receiveAllMessage);
    };
  }, [socket]);

  const scrollToBottom = () => {
    const divChat = document.querySelector(".chat");
    if (divChat) {
      divChat.scrollTop = divChat.scrollHeight - divChat.clientHeight;
    }
  };

  const checkFileSize = (file) => {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    return new Promise((resolve, reject) => {
      if (file.size <= maxSizeInBytes) {
        resolve(file);
      } else {
        reject(new Error("File size exceeds the maximum allowed size."));
      }
    });
  };

  const handleUpdateIsRead = async (room_id) => {
    try {
      await putMethod(`/api/update-is-read`, { room_id: room_id });
    } catch (error) {
      console.error("Error update is read:", error);
    }
  };

  useEffect(() => {
    if (searchText && allRoom) {
      setSearchRoom(
        allRoom.filter((room) => room.room_name.includes(searchText))
      );
    } else {
      setSearchRoom([]);
    }
  }, [allRoom, searchText]);

  useEffect(() => {
    if (roomAdmin) {
      handleUpdateIsRead(roomAdmin);
      getRoomFunction();
    }
  }, [roomAdmin, newMessage, getRoomFunction]);

  useEffect(() => {
    if (!loadMoreChatTrigger) {
      scrollToBottom();
    }
  }, [loadMoreChatTrigger, messageList]);

  const linkStyle = {
    textDecoration: "underline",
  };

  return (
    <>
      {role ? (
        <div className="px-4 md:flex items-start gap-5 justify-center pt-3 md:pt-4 pb-7 ">
          <div className={`${roomAdmin ? "max-sm:hidden" : ""}`}>
            <div
              className={` ${
                role === "m" ? "hidden" : ""
              } h-[540px] w-full md:w-[300px] border-[1px] rounded-[15px] bg-white overflow-hidden`}
            >
              <div className="px-[20px] flex items-center shadow-[0px_1px_7px_0px_#62618E30] h-[40px]">
                <p className="font-[500] text-[23px] text-[#5E6470]">แชท</p>
              </div>
              <div className="flex items-center gap-1 relative px-[20px] pt-[20px] pb-[10px]">
                <div
                  className={`${
                    isSearch ? "" : "hidden"
                  } flex items-center justify-center w-10 h-8 rounded-full hover:bg-[#e9e8e8] cursor-pointer`}
                  onClick={() => {
                    setIsSearch(false);
                    setSearchText("");
                    setSearchRoom([]);
                  }}
                >
                  <ArrowLeftOutlined className="text-[#5E6470] text-[20px]" />
                </div>
                <input
                  placeholder="ค้นหาแชท"
                  className="flex pl-9 items-center gap-2 w-full h-[35px] rounded-full bg-[#f0f0f0] hover:bg-[#e9e8e8] px-4 outline-none"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={() => setIsSearch(true)}
                />
                <SearchOutlined
                  className={`absolute top-[43%] ${
                    isSearch ? "left-[65px]" : "left-7"
                  } text-[20px] text-[#5E6470]`}
                />
              </div>
              <div className="p-[20px] flex flex-col gap-3 overflow-auto h-[420px]">
                {isSearch
                  ? searchRoom?.map((room) => (
                      <div
                        key={room.room_id}
                        className={`${
                          roomAdmin === room.room_id
                            ? "bg-[#1f5e95] text-white"
                            : "bg-[#f0f0f0] hover:bg-[#e9e8e8]"
                        } w-full h-fit rounded-[15px] px-[20px] py-[8px] cursor-pointer relative`}
                        onClick={() => {
                          socket.emit("leave_room", roomAdmin);
                          setRoomAdmin(room.room_id);
                          setNameRoomAdmin(room.room_name);
                          setChatLimit(10);
                          setHasMore(true);
                          setLoadMoreChatTrigger(false)
                        }}
                      >
                        <div
                          className={`${
                            room.is_read === "read" ? "hidden" : ""
                          } absolute top-4 right-4 w-3 h-3 rounded-full bg-[#FF0000]`}
                        />
                        <div className="font-[500] text-lg">
                          {room.room_name}
                        </div>
                        <div className="flex items-center">
                          <div className="whitespace-nowrap">
                            {room.last_sender_name
                              ? room.last_sender_name.split(" ")[0] + ":"
                              : ""}
                          </div>
                          <div className="truncate">
                            {room.latest_message
                              ? room.latest_message
                              : "ยังไม่มีข้อความล่าสุด"}
                          </div>
                        </div>
                        <div className="text-sm leading-[25px]">
                          {room.latest_sent_at
                            ? format(
                                new Date(room.latest_sent_at).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: "UTC",
                                  }
                                ),
                                "d-MM-yyyy HH:mm"
                              )
                            : "-"}
                        </div>
                      </div>
                    ))
                  : allRoom?.map((room) => (
                      <div
                        key={room.room_id}
                        className={`${
                          roomAdmin === room.room_id
                            ? "bg-[#1f5e95] text-white"
                            : "bg-[#f0f0f0] hover:bg-[#e9e8e8]"
                        } w-full h-fit rounded-[15px] px-[20px] py-[8px] cursor-pointer relative`}
                        onClick={() => {
                          socket.emit("leave_room", roomAdmin);
                          setRoomAdmin(room.room_id);
                          setChatLimit(10);
                          setHasMore(true);
                          setLoadMoreChatTrigger(false)
                          setNameRoomAdmin(room.room_name);
                        }}
                      >
                        <div
                          className={`${
                            room.is_read === "read" ? "hidden" : ""
                          } absolute top-4 right-4 w-3 h-3 rounded-full bg-[#FF0000]`}
                        />
                        <div className="font-[500] text-lg">
                          {room.room_name}
                        </div>
                        <div className="flex items-center">
                          <div className="whitespace-nowrap">
                            {room.last_sender_name
                              ? room.last_sender_name.split(" ")[0] + ":"
                              : ""}
                          </div>
                          <div className="truncate">
                            {room.latest_message
                              ? room.latest_message
                              : "ยังไม่มีข้อความล่าสุด"}
                          </div>
                        </div>
                        <div className="text-sm leading-[25px]">
                          {room.latest_sent_at
                            ? format(
                                new Date(room.latest_sent_at).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: "UTC",
                                  }
                                ),
                                "d-MM-yyyy HH:mm"
                              )
                            : "-"}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div
            className={`${role === "a" && !roomAdmin ? "hidden md:block" : ""}`}
          >
            <div className="relative w-full md:w-[380px] lg:w-[580px] h-[540px] border-[1px] rounded-[15px] mx-auto overflow-hidden bg-white">
              <div className="px-3 flex justify-start items-center gap-2 shadow-[0px_1px_7px_0px_#62618E30] h-[40px]">
                <div
                  className={`${
                    role === "a" ? "md:hidden" : "hidden"
                  } flex justify-center items-center rounded-full w-[35px] h-[30px] hover:bg-[#f3f6ff] cursor-pointer`}
                  onClick={() => {
                    setRoomAdmin("");
                    setChatLimit(10);
                    setHasMore(true);
                    setLoadMoreChatTrigger(false)
                    setMessageList([]);
                  }}
                >
                  <LeftOutlined className="text-[#0185ff] text-[20px]" />
                </div>
                <div className="w-full flex justify-between items-center">
                  <p className="font-[500] text-[17px] text-[#5E6470]">
                    {role === "a"
                      ? nameRoomAdmin
                      : `Library Chatbot ${botResponse ? "(ฺBot)" : "(Admin)"}`}
                  </p>
                  <button
                    onClick={() => {
                      setBotResponse(false);
                    }}
                    className={`${
                      role === "m" && botResponse ? "" : "hidden"
                    } bg-[#1f5e95] hover:bg-[#386c9c] text-white rounded-[18px] w-fit px-3 text-sm py-1`}
                  >
                    คุยกับ Admin
                  </button>
                  <button
                    onClick={() => {
                      setBotResponse(true);
                    }}
                    className={`${
                      role === "m" && !botResponse ? "" : "hidden"
                    } bg-[#1f5e95] hover:bg-[#386c9c] text-white rounded-[18px] w-fit px-3 text-sm py-1`}
                  >
                    คุยกับ Bot
                  </button>
                </div>
              </div>
              <div
                className={`${
                  imageURLs.length > 0 || file.length > 0
                    ? "h-[60%]"
                    : "h-[80%]"
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
                  {(roomAdmin || role === "m") && (
                    <div
                      className={`${
                        !hasMore && "hidden"
                      } flex justify-center gap-1 items-center pt-2 cursor-pointer hover:text-slate-600`}
                      onClick={loadMoreChat}
                    >
                      กดโหลดแชทก่อนหน้า
                      <span className="pb-1">
                        <ReloadOutlined />
                      </span>
                    </div>
                  )}
                  {messageList?.map((messageContent, index) => {
                    return (
                      <div className="relative" key={index}>
                        {messageContent.file_data &&
                        messageContent.file_type === "image/jpeg" ? (
                          <div
                            className={`flex ${
                              messageContent.message_content ? "pt-5" : "py-5"
                            } ${
                              username === messageContent.sender_id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {/* Check if the file data is a base64 string */}
                            {isBase64(messageContent.file_data) ? (
                              // Display the image using base64 data
                              <img
                                src={`data:image/jpeg;base64,${messageContent.file_data}`}
                                className="rounded-[20px] max-w-[65%]"
                                alt={
                                  messageContent.file_name || "Uploaded File"
                                }
                              />
                            ) : (
                              // Display the image using the file data URL
                              <img
                                src={messageContent.file_data}
                                className="rounded-[20px] max-w-[65%]"
                                alt={
                                  messageContent.file_name || "Uploaded File"
                                }
                              />
                            )}
                          </div>
                        ) : (
                          <div
                            className={`flex ${
                              messageContent.message_content ? "pt-5" : "py-5"
                            } ${
                              username === messageContent.sender_id
                                ? "justify-end"
                                : "justify-start"
                            } ${messageContent.file_data ? "" : "hidden"}`}
                          >
                            <div
                              onClick={() => {
                                if (isBase64(messageContent.file_data)) {
                                  downloadFile(
                                    `data:${messageContent.file_type};base64,${messageContent.file_data}`,
                                    messageContent.file_name
                                  );
                                } else {
                                  downloadFile(
                                    messageContent.file_data,
                                    messageContent.file_name
                                  );
                                }
                              }}
                              className="hover:cursor-pointer w-[40%] px-3 py-2 flex items-center gap-2 rounded-[13px] bg-[#f0f0f0]"
                            >
                              <div className="w-[20%] h-9 rounded-full flex justify-center items-center bg-[#c4c4c4]">
                                <FileTextOutlined className="text-[20px]" />
                              </div>
                              <div className="w-[80%] line-clamp-2 break-words">
                                {messageContent.file_name
                                  ? messageContent.file_name
                                  : ""}
                              </div>
                            </div>
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-3 ${
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
                                new Date(messageContent.sent_at).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: "UTC",
                                  }
                                ),
                                "d MMM yyyy HH:mm"
                              )
                            : ""}
                        </div>
                      </div>
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
                        className="text-[#5E6470] hover:text-[#8e94a1]"
                        onClick={() => {
                          setImageURLs([]);
                          clearImageInputValue();
                        }}
                      />
                    </div>
                  </div>
                ))}
                {file.length > 0 && (
                  <div className="relative w-[40%] px-3 py-2 flex items-center gap-2 rounded-[13px] bg-[#f0f0f0]">
                    <div className="w-[20%] h-9 rounded-full flex justify-center items-center bg-[#c4c4c4]">
                      <FileTextOutlined className="text-[20px]" />
                    </div>
                    <div className="w-[80%] line-clamp-2 break-words">
                      {file[0].name}
                    </div>
                    <div className="absolute w-6 h-6 rounded-full bg-[#dddfe2] hover:bg-[#eaecee] flex justify-center items-center top-[-8px] right-[-5px]">
                      <CloseOutlined
                        className="text-[#5E6470]"
                        onClick={() => {
                          setFile([]);
                          clearFileInputValue();
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`${
                  role === "a" && !roomAdmin ? "hidden" : "flex"
                }  gap-2 bg-white items-center px-[20px] w-[95%] h-[50px] absolute m-auto left-0 right-0 bottom-[16px] shadow-[0px_5px_7px_1px_#62618E30] rounded-[15px]`}
              >
                <div>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }}
                    className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer"
                  >
                    <PaperClipOutlined className="text-[#0185ff] text-[20px]" />
                  </button>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={(e) => {
                      clearImageInputValue();
                      setImageURLs([]);
                      setImages([]);
                      checkFileSize(...e.target.files)
                        .then(() => setFile([...e.target.files]))
                        .catch(() =>
                          Swal.fire({
                            title: "",
                            text: "ไฟล์ มีขนาดใหญ่เกิน 10 MB กรุณาเลือกไฟล์ใหม่",
                            icon: "error",
                            confirmButtonColor: "#1f5e95",
                            confirmButtonText: "OK",
                          })
                        );
                    }}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
                </div>
                <div>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      imageInputRef.current?.click();
                    }}
                    className="flex justify-center items-center rounded-full w-[40px] h-[35px] hover:bg-[#f3f6ff] cursor-pointer"
                  >
                    <PictureOutlined className="text-[#0185ff] text-[20px]" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      clearFileInputValue();
                      setFile([]);
                      checkFileSize(...e.target.files)
                        .then(() => setImages([...e.target.files]))
                        .catch(() =>
                          Swal.fire({
                            title: "",
                            text: "รูป มีขนาดใหญ่เกิน 10 MB กรุณาเลือกรูปใหม่",
                            icon: "error",
                            confirmButtonColor: "#1f5e95",
                            confirmButtonText: "OK",
                          })
                        );
                    }}
                    style={{ display: "none" }}
                    ref={imageInputRef}
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
                  onClick={() => setLoadMoreChatTrigger(false)}
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
