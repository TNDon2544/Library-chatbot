import axios from "axios";

export async function isUserLoggedIn() {
  try {
    await axios.get(
      "https://auth-api-backend-411408.uc.r.appspot.com/authtoken/protected",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

export async function checkRole() {
  try {
    const res = await axios.get(
      "https://auth-api-backend-411408.uc.r.appspot.com/authtoken/protected",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res?.data?.user;
  } catch (error) {
    console.error("Error:", error);
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("username");
}
