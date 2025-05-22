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
  const [dataplan, setDataPlan] = useState([]); // Initialize as an array
  const [filteredPlans, setFilteredPlans] = useState([]); // Store filtered plans
  const [amountToPay, setAmountToPay] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch wallet balance whenever the page is reloaded
    fetchWalletDetails();
    fetchDataPlan();
  }, []);

  // Reusable function to fetch wallet details
  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance();
      // console.log("Wallet Result:", walletResult);
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastName: walletResult.Profile?.lastname || "",
      };
      setWallet(walletDetails); // Set the fetched wallet details
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  // Fetch data plans
  const fetchDataPlan = async () => {
    try {
      const dataPlanResult = await vasServices.getAllDataPlan();
      // console.log("Fetched Data Plans:", dataPlanResult);
      setDataPlan(dataPlanResult.data); // Save all plans in state
    } catch (error) {
      console.error("Error fetching data plans:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails().finally(() => setRefreshing(false));
  }, []);

  // Handle network selection
  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
    setSelectedPlanId("");
    setAmountToPay(0);

    // Filter plans based on selected network ID
    const filtered = dataplan.filter(
      (plan) => plan.network_id === parseInt(value)
    );

    // console.log("Filtered Plans:", filtered); // Debug filtered plans
    setFilteredPlans(filtered);
  };

  // Handle plan selection and update amount
  const handlePlanChange = (planId) => {
    const selectedPlan = filteredPlans.find(
      (plan) => plan.plan_id === parseInt(planId)
    );
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setAmountToPay(
        Math.ceil(
          parseInt(selectedPlan.amount) + parseInt(selectedPlan.amount) * 0.2
        ) // Add 20% markup
      );
    }
  };

  const handlePurchase = async () => {
    if (!selectedNetwork || !selectedPlanId || !mobileNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);
    const data = {
      network: selectedNetwork,
      plan: selectedPlanId,
      mobile_number: mobileNumber,
      amount: amountToPay,
    };
    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const response = await vasServices.dataBundle(data);
        if (response && !response.data.error) {
          Alert.alert("Success", "Transaction successful");
          setTransactionDetails({ ...data });
          setShowModal(false);
        } else {
          Alert.alert("Error", "Transaction unsuccessful");
          navigation.replace("DataScreen");
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.");
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 h-screen bg-gray-100 ">
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(false)}
        logout={handleLogout}
      />
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={onRefresh}
        logout={handleLogout}
      />

      <ScrollView
        className="p-6 bg-gray-100 flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">
          Buy Data
        </Text>
        <Text className="text-lg text-center text-gray-600 mb-2">
          Balance: ₦{wallet.balance}
        </Text>
        <Text className="text-lg text-center text-gray-600 mb-6">
          Welcome, {wallet.name} {wallet.lastname}
        </Text>

        {/* <View className="flex-row gap-2 pr-2 my-4">
          {["Home", "Airtime", "CableTv", "Electricity"].map((screen) => (
            <TouchableOpacity
              key={screen}
              className="px-3 py-2 flex-1 rounded-lg bg-[#1F233B]"
              onPress={() => navigation.navigate(screen)}
            >
              <Text className="text-white text-center font-medium">
                {screen}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={selectedNetwork}
            onValueChange={(value) => handleNetworkChange(value)}
          >
            <Picker.Item label="Select Network" value="" />
            <Picker.Item label="MTN" value="1" />
            <Picker.Item label="GLO" value="2" />
            <Picker.Item label="Airtel" value="4" />
            <Picker.Item label="9mobile" value="3" />
          </Picker>
        </View>

        {selectedNetwork && (
          <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
            <Picker
              selectedValue={selectedPlanId}
              onValueChange={(value) => handlePlanChange(value)}
            >
              <Picker.Item label="Select Plan" value="" />
              {filteredPlans.map((plan) => (
                <Picker.Item
                  key={plan.plan_id || Math.random()}
                  value={plan.plan_id || ""}
                  label={`${plan.title || "Unknown Plan"} - ₦${Math.ceil(
                    parseFloat(plan.amount || 0) * 1.2
                  )}`}
                />
              ))}
            </Picker>
          </View>
        )}
        <TextInput
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Enter Mobile Number"
          keyboardType="numeric"
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md"
        />

        <Text className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md text-center font-semibold">
          Amount to Pay: ₦{amountToPay || "0.00"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1F233B" />
        ) : (
          <CustomButton
            title="Buy Now"
            onPress={() => setShowModal(true)}
            style="bg-[#1F233B]"
          />
        )}

        <Modal
          transparent
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View className="w-80 p-6 bg-white rounded-lg shadow-lg">
              <Text className="text-lg font-bold mb-4">
                Transaction Details
              </Text>
              {/* <Text>Network: {selectedNetwork}</Text>
              <Text>Plan: {selected}</Text> */}
              <Text>Mobile Number: {mobileNumber}</Text>
              <Text>Amount: ₦{amountToPay}</Text>
              <TouchableOpacity
                className="mt-4 px-4 py-2 bg-[#1F233B] rounded-lg"
                onPress={handlePurchase}
              >
                <Text className="text-white text-center">Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="mt-4 px-4 py-2 bg-gray-300 rounded-lg"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-black text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

export default DataScreen;
