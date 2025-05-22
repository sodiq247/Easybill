import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import vasServices from "../services/vasServices";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import accountServices from "../services/auth.services";

const DataScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [dataplan, setDataPlan] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [amountToPay, setAmountToPay] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const navigation = useNavigation();

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance();
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastName: walletResult.Profile?.lastname || "",
      };
      setWallet(walletDetails);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  const fetchDataPlan = async (network) => {
    try {
      const data = { serviceID: network };
      console.log("request data", data);
      const response = await vasServices.allDataPlans(data);
      console.log("response", response);
      if (response.variations && Array.isArray(response.variations)) {
        setDataPlan(response.variations);
        setFilteredPlans(response.variations);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Error fetching data plans--- req", error);
      Alert.alert("Error", "Failed to load data plans. Please try again.");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails().finally(() => setRefreshing(false));
  }, []);

  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
    setSelectedPlanId("");
    setAmountToPay(0);
    fetchDataPlan(value);
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = filteredPlans.find(
      (plan) => plan.variation_code === planId
    );
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setSelectedPlanName(selectedPlan.name);
      setAmountToPay(Math.ceil(parseFloat(selectedPlan.variation_amount)));
    }
  };

  const handlePurchase = async () => {
    if (!selectedNetwork || !selectedPlanId || !mobileNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);

    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const now = new Date();
        const request_id =
          now.getFullYear().toString() +
          String(now.getMonth() + 1).padStart(2, "0") +
          String(now.getDate()).padStart(2, "0") +
          String(now.getHours()).padStart(2, "0") +
          String(now.getMinutes()).padStart(2, "0") +
          String(now.getSeconds()).padStart(2, "0");

        const payload = {
          request_id,
          serviceID: selectedNetwork,
          billersCode: mobileNumber,
          variation_code: selectedPlanId,
          name: selectedPlanName,
          phone: mobileNumber,
          amount: amountToPay,
        };

        const response = await vasServices.dataBundle(payload);

        if (response === "TRANSACTION SUCCESSFUL") {
          Alert.alert("Success", "Transaction successful");
          fetchWalletDetails();
          setTransactionDetails({
            planTitle: selectedPlanName,
            mobile_number: mobileNumber,
            amount: amountToPay,
          });
        } else {
          Alert.alert("Error", "Transaction failed, Try again.");
        }
        setShowModal(false);
      } catch (error) {
        Alert.alert("Error", "Transaction failed.");
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 h-screen bg-gray-100">
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} />
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} />

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">Buy Data</Text>
        <Text className="text-lg text-center text-gray-600 mb-2">Balance: ₦{wallet.balance}</Text>
        <Text className="text-lg text-center text-gray-600 mb-6">Welcome, {wallet.name} {wallet.lastname}</Text>

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker selectedValue={selectedNetwork} onValueChange={handleNetworkChange}>
            <Picker.Item label="Select Network" value="" />
            <Picker.Item label="MTN" value="mtn-data" />
            <Picker.Item label="GLO" value="glo-data" />
            <Picker.Item label="Airtel" value="airtel-data" />
            <Picker.Item label="9mobile" value="etisalat-data" />
          </Picker>
        </View>

        {selectedNetwork && (
          <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
            <Picker selectedValue={selectedPlanId} onValueChange={handlePlanChange}>
              <Picker.Item label="Select Plan" value="" />
              {filteredPlans.map((plan) => (
                <Picker.Item key={plan.variation_code} value={plan.variation_code} label={`${plan.name} - ₦${plan.variation_amount}`} />
              ))}
            </Picker>
          </View>
        )}

        <TextInput value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter Mobile Number" keyboardType="numeric" className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md" />
        <Text className="text-center font-semibold">Amount to Pay: ₦{amountToPay || "0.00"}</Text>

        {loading ? <ActivityIndicator size="large" color="#1F233B" /> : <CustomButton title="Buy Now" onPress={handlePurchase} />}
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
};

export default DataScreen;