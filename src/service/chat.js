// service/chat.js
import axios from "axios";

export async function getRoom() {
  try {
    const res = await axios.get("http://localhost:3001/api/allroom", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function saveMessage(name, sender_id, room_id, message_content) {
  try {
    const res = await axios.post("http://localhost:3001/api/send", {
      name,
      sender_id,
      room_id,
      message_content,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res?.data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function getChat(room_id) {
  try {
    const res = await axios.get(
      `http://localhost:3001/api/chat/${room_id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function uploadFile(formData) {
  try {
    const res = await axios.post("http://localhost:3001/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res?.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}


