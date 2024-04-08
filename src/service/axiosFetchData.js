import axios from "axios";

export const getMethod = async (endpoint) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(endpoint, error);
    throw error;
  }
};

export const postMethod = async (endpoint, body, bearer) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(bearer)}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(endpoint, error);
    throw error;
  }
};

export const putMethod = async (endpoint, body) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(endpoint, error);
    throw error;
  }
};

export const deleteMethod = async (endpoint) => {
  try {
    const response = await axios
      .delete(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    return response;
  } catch (error) {
    console.log(endpoint, error);
    throw error;
  }
}
