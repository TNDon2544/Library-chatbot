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

export async function saveMessage(name, sender_id, room_id, message_content) {
  try {
    const res = await postMethod("/api/send", {
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
    const res = await getMethod(`/api/chat/${room_id}`);
    return res;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
