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

export async function saveMessage(name,sender_id, room_id, message_content) {
  try {
    const res = await axios.post("http://localhost:3001/api/send", {
      name,
      sender_id,
      room_id,
      message_content,
    });
    return res?.data;
  } catch (error) {
    console.error("Error sending message:", error);
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
