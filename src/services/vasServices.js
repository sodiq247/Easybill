import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  creditWallet: async (amount) => {
    // console.log("Sending amount to fund wallet:", amount);
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
  getAllDataPlan: async () => {
    try {
    const token = await getToken();

      const response = await axios.get(`${baseUrl}getAllDataPlans`,
        {
          headers: { Authorization: `Bearer ${token}` },
    });
      //   console.log("getAllDataPlans response", response.data);
      return response.data; // Assuming the API response structure includes `data`
    } catch (error) {
      console.error("Error fetching data plans:", error.message);
      throw error;
    }
  },
  getAllTvPlan: async () => {
    try {
    const token = await getToken();
      const response = await axios.get(`${baseUrl}getAllTvPlans`,
        {
          headers: { Authorization: `Bearer ${token}` },
    });
        // console.log("getAllDataPlans response", response.data);
      return response.data; // Assuming the API response structure includes `data`
    } catch (error) {
      console.error("Error fetching tv plans:", error.message);
      throw error;
    }
  },
  getTransaction: async () => {
    const token = await getToken();
    let response = await axios.get(`${baseUrl}getTransactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
  });
  // console.log("getTransaction", response.data )
    return response;
  },
};

export default vasServices;
