import { jwtDecode } from "jwt-decode";
import { getMethod, postMethod } from "./axiosFetchData";

export async function isUserLoggedIn() {
  try {
    await getMethod("/authtoken/protected");
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

export async function checkRole() {
  try {
    const res = await getMethod("/authtoken/protected");
    return res?.data?.user;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("Refresh token not found");
      return;
    }

    const res = await postMethod(
      "/authtoken/refresh",
      refreshToken,
      "refreshToken"
    );
    if (res?.data?.accessToken) {
      localStorage.setItem("token", res.data.accessToken);
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        localStorage.setItem("exp", decoded.exp);
      }
      console.log("Refresh token success");
    } else {
      console.error("setItem Refresh Token Fail !!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("username");
  localStorage.removeItem("exp");
  localStorage.removeItem("refreshToken");
}
