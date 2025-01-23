/** @format */

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

let baseUrl = "https://sdc-backend-t3j9.onrender.com/api/v18/vas/";

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
  creditWallet: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}creditWallet`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error crediting wallet:", error);
      return null;
    }
  },
  dataBundle: async (data) => {
    const token = await getToken();
    try {
      let response = await axios.post(`${baseUrl}data`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error purchasing data bundle:", error);
      return null;
    }
  },
  electric: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}electric`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error paying electricity bill:", error);
      return null;
    }
  },
  cablesub: async (data) => {
    const token = await getToken();
    try {
      let response = await axios.post(`${baseUrl}cablesub`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error subscribing to cable service:", error);
      return null;
    }
  },
  validateMeter: async (data) => {
    console.log("elec data", data)
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}validateMeter`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    console.log("elec response ", response)

      return response;
    } catch (error) {
      console.error("Error validating meter:", error);
      return null;
    }
  },
  validateIUC: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}validateIUC`,  data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error validating IUC:", error);
      return null;
    }
  },
  InitilizePaystack: async (data) => {
    try {
      const token = await getToken();
      let response = await axios.post(`${baseUrl}initialize_paystack`, data, {
        headers: { Authorization: token },
      });
      if (response.data?.authorization_url) {
        Linking.openURL(response.data.authorization_url);
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
      let response = await axios.post(`${baseUrl}verify_paystack`, data, {
        headers: { Authorization: token },
      });
      return response;
    } catch (error) {
      console.error("Error verifying Paystack payment:", error);
      return null;
    }
  },
};

export default vasServices;
