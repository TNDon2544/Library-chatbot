import { getMethod } from "./axiosFetchData";

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

    const res = await getMethod("/authtoken/refresh");
    if (res?.accessToken) {
      localStorage.setItem("token", res.accessToken);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("username");
  localStorage.removeItem("refreshToken");
}
