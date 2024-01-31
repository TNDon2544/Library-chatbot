import axios from "axios";

export async function isUserLoggedIn() {
  try {
    await axios.get(
      "https://auth-api-backend-411408.uc.r.appspot.com/authtoken/protected",
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return true; 
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
}
