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

export async function saveMessage(sender_id, room_id, message_content) {
  try {
    await axios.post("http://localhost:3001/api/send", {
      sender_id,
      room_id,
      message_content,
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
