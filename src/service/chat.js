// service/chat.js
import axios from "axios";
import { getMethod, postMethod } from "./axiosFetchData";

export async function getRoom() {
  try {
    const res = await getMethod("/api/allroom");
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getNotification() {
  try {
    const res = await getMethod("/api/notification");
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function saveMessage(name, sender_id, room_id, message_content) {
  try {
    const res = await postMethod(
      "/api/send",
      {
        name,
        sender_id,
        room_id,
        message_content,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function sendNotification(name, id_user) {
  try {
    const res = await postMethod(
      "/api/send/notification",
      {
        name,
        id_user,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    console.error("Error send notification:", error);
    throw error;
  }
}

export async function getChat(room_id) {
  try {
    const res = await getMethod(`/api/chat/${room_id}`);
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function uploadFile(formData) {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
