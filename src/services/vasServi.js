import AsyncStorage from "@react-native-async-storage/async-storage";

let baseUrl = "https://sdc-backend-t3j9.onrender.com/api/v18/vas/";

const getToken = async () => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (error) {
    console.error("Error fetching token from storage:", error);
    return null;
  }
};

const fetchWrapper = async (url, method = "GET", data = null) => {
  const token = await getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${baseUrl}${url}`, options);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "API error");
    return json;
  } catch (error) {
    console.error(`Fetch ${method} ${url} error:`, error);
    return null;
  }
};

const vasServices = {
  getTransaction: () => fetchWrapper("getTransactions"),
  airTime: (data) => fetchWrapper("airtime", "POST", data),
  dataBundle: (data) => fetchWrapper("data", "POST", data),
  validateMeter: (data) => fetchWrapper("validateMeter", "POST", data),
  electric: (data) => fetchWrapper("electric", "POST", data),
  validateIUC: (data) => fetchWrapper("validateIUC", "POST", data),
  cablesub: (data) => fetchWrapper("cablesub", "POST", data),
  creditWallet: (amount) =>
    fetchWrapper("fundWallet", "POST", { transaction_amt: amount }),
  getAllDataPlan: () => fetchWrapper("getAllDataPlans"),
  getAllTvPlan: () => fetchWrapper("getAllTvPlans"),
};

export default vasServices;
