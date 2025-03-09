import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Linking } from "react-native";
import InAppBrowser from "react-native-inappbrowser-reborn";

let baseUrl = "https://sdc-backend-t3j9.onrender.com/api/v18/vas/";
// let baseUrl = "http://localhost:5030/api/v18/vas/";


const getToken = async () => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.error("Error fetching token from storage:", error);
    return null;
  }
};

const vasServices = {
  getTransaction: async () => {
    try {
      const token = await getToken();
      let response = await axios.get(`${baseUrl}getTransactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }
  },
  airTime: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}airtime`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error purchasing airtime:", error);
      return null;
    }
  },
  dataBundle: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}data`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error purchasing data:", error);
      return null;
    }
  },
  validateMeter: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}validateMeter`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error validating Meter:", error);
      return null;
    }
  },
  electric: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}electric`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error purchasing electric:", error);
      return null;
    }
  },
  validateIUC: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}validateIUC`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error validating IUC:", error);
      return null;
    }
  },
  cablesub: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}cablesub`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error purchasing cablesub:", error);
      return null;
    }
  },

  InitilizePaystack: async (data) => {
    console.log("data", data);
    try {
      const token = await getToken();
      console.log("data token", data, token);

      let response = await axios.post(`${baseUrl}initialize_paystack`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("InitilizePaystack response", response.data);

      if (response.data.authorization_url) {
        const url = response.data.authorization_url;

        // Ensure InAppBrowser is loaded
        if (!InAppBrowser || typeof InAppBrowser.isAvailable !== "function") {
          console.error("InAppBrowser not properly linked.");
          Alert.alert(
            "Error",
            "InAppBrowser is not available. Opening in default browser."
          );
          return Linking.openURL(url);
        }

        try {
          const isAvailable = await InAppBrowser.isAvailable();
          if (isAvailable) {
            await InAppBrowser.open(url, {
              dismissButtonStyle: "close",
              preferredBarTintColor: "#6200EE",
              preferredControlTintColor: "white",
              showTitle: true,
              enableUrlBarHiding: true,
              enableDefaultShare: true,
            });
          } else {
            console.warn(
              "InAppBrowser not supported, opening in default browser."
            );
            Linking.openURL(url);
          }
        } catch (browserError) {
          console.error("InAppBrowser error:", browserError);
          Alert.alert("Error", "Could not open Paystack URL.");
          Linking.openURL(url);
        }
      } else {
        Alert.alert("Error", "Failed to get Paystack authorization URL.");
      }
    } catch (error) {
      console.error("Error initializing Paystack:", error);
      Alert.alert("Error", "Failed to initialize Paystack.");
    }
  },
  verifyPaystack: async (data) => {
    try {
      const token = await getToken();
      console.log("token", token);
      console.log("reference sent:", data);

      let response = await axios.post(`${baseUrl}verify_paystack`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response:", response);
      console.log("response.data:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error verifying payment", error);
      return null;
    }
  },

  creditWallet: async (amount) => {
    console.log("Sending amount to fund wallet:", amount);
    const token = await getToken();
    let response = await axios.post(
      `${baseUrl}fundWallet`,
      { transaction_amt: amount },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};

export default vasServices;
