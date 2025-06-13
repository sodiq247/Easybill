/** @format */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// 🌐 Base URL for API
let baseUrl = "https://sdc-backend-t3j9.onrender.com/api/v1/";
// let baseUrl = "http://localhost:5030/api/v1/";

// 🔐 Get token from AsyncStorage
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      console.error("Token not found in storage");
      return null;
    }
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

// ✅ Optional: Save token to AsyncStorage
const setToken = async (token) => {
  try {
    await AsyncStorage.setItem("access_token", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

// ✅ Optional: Remove token (for logout)
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("access_token");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

// 🛠️ Account Services
const accountServices = {
  // 🔑 User Login
  login: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}account/token`, data);
      // console.log("response", response);
      // Store token after successful login
      if (response.data.access_token) {
        await setToken(response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching wallet balance:", error.response || error);

      if (error.response?.data?.body?.name === "TokenExpiredError") {
        Alert.alert("Session Expired", "Please log in again.");
        await removeToken(); // Remove expired token
        return null;
      }

      Alert.alert("Error", "Unable to fetch wallet balance.");
      return null;
    }
  },

  // 📝 User Signup
  signup: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}account/register`, data);
      return response.data;
    } catch (error) {
      console.error("Error signing up:", error.response || error);
      Alert.alert("Signup Error", "Registration failed. Please try again.");
      return null;
    }
  },

  resendOTP: async function (email) {
    try {
      const response = await axios.post(`${baseUrl}account/resend-otp`, {
        email: email,
      });
      return response;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      throw error;
    }
  },

  // 🔐 Request Password Reset
  requestPasswordReset: async (data) => {
    try {
      const response = await axios.post(
        `${baseUrl}account/requestPasswordReset`,
        data
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.body || "Failed to request password reset.";
      console.error("Error requesting password reset:", errorMessage);
      Alert.alert("Failed to request password reset.");
      return null;
    }
  },

  // 🔄 Reset Password
  resetPassword: async (data) => {
    try {
      const response = await axios.post(
        `${baseUrl}account/resetPassword`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error.response || error);
      Alert.alert("Error", "Password reset failed.");
      return null;
    }
  },

  // 👤 Update User Profile
  updateProfile: async (data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      const response = await axios.put(`${baseUrl}update-profile`, data, {
        headers: { Authorization: token },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      Alert.alert("Error", "Failed to update profile.");
      return null;
    }
  },

  // 💰 Fetch Wallet Balance
  walletBalance: async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      // const response = await axios.get(`${baseUrl}account/verify`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      const response = await axios.get(`${baseUrl}account/verify`, {
        headers: { Authorization: `Bearer ${token.trim()}` }, // Trim to avoid extra spaces
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet balance:", error.response || error);
      Alert.alert("Error", "Unable to fetch wallet balance.");
      return null;
    }
  },
};

export default accountServices;
