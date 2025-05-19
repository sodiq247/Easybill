import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

let baseUrl = "https://sdc-backend-t3j9.onrender.com/api/v1/";

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    return token || null;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

const setToken = async (token) => {
  try {
    await AsyncStorage.setItem("access_token", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("access_token");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

const fetchWrapper = async (url, method = "GET", data = null, auth = true) => {
  const token = auth ? await getToken() : null;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${baseUrl}${url}`, options);
    const json = await res.json();
    if (!res.ok) throw json;

    return json;
  } catch (error) {
    console.error(`Fetch ${method} ${url} error:`, error);
    return null;
  }
};

const accountServices = {
  login: async (data) => {
    const result = await fetchWrapper("account/token", "POST", data, false);
    if (result?.access_token) await setToken(result.access_token);
    return result;
  },

  signup: (data) => fetchWrapper("account/register", "POST", data, false),

  requestPasswordReset: (data) =>
    fetchWrapper("account/requestPasswordReset", "POST", data, false),

  resetPassword: (data) =>
    fetchWrapper("account/resetPassword", "POST", data, false),

  updateProfile: (data) => fetchWrapper("update-profile", "PUT", data),

  walletBalance: () => fetchWrapper("account/verify"),
};

export default accountServices;
