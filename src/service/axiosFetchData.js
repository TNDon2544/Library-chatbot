import axios from "axios";

export const getMethod = (endpoint) => {
  return axios
    .get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(endpoint, error);
      throw error;
    });
};

export const postMethod = (endpoint, body, bearer) => {
  return axios
    .post(`${import.meta.env.VITE_API_URL}${endpoint}`, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(bearer)}`,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(endpoint, error);
      throw error;
    });
};
