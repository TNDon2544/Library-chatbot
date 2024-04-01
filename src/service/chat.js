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

export async function saveMessage(
  name,
  sender_id,
  room_id,
  message_content,
  image
) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sender_id", sender_id);
    formData.append("room_id", room_id);
    formData.append("message_content", message_content);
    formData.append("image", image);
    const res = await postMethod("/api/send", formData);
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
