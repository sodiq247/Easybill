import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import vasServices from "../services/vasServi";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import accountServices from "../services/auth.serv";

const CableTvScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTvType, setSelectedTvType] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [tvplan, setTvPlan] = useState([]); // Initialize as an array
  const [filteredPlans, setFilteredPlans] = useState([]); // Store filtered plans
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [showReceipt, setShowReceipt] = useState(false);
  const [iucName, setIucName] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch wallet balance whenever the page is reloaded
    fetchWalletDetails();
    fetchTvPlan();
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

  const fetchTvPlan = async () => {
    try {
      const tvPlanResult = await vasServices.getAllTvPlan();
      // console.log("Fetched TV Plans:", tvPlanResult); // Debug fetched plans
      setTvPlan(tvPlanResult.data || []); // Set the plans or default to an empty array
    } catch (error) {
      console.error("Error fetching TV plans:", error.message);
    }
  };

  const handleTvTypeChange = (value) => {
    setSelectedTvType(value);
    setSelectedPlanId("");
    setAmountToPay(0);

    // Filter plans based on selected TV type
    const filtered = (tvplan || []).filter((plan) => plan.type === value);
    setFilteredPlans(filtered); // Update filtered plans
    // console.log("Filtered Plans:", filtered); // Debug filtered plans
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = filteredPlans.find(
      (plan) => plan.plan_id === parseInt(planId)
    );
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setAmountToPay(parseFloat(selectedPlan.amount) + 80); // Add a processing fee
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails().finally(() => setRefreshing(false));
  }, []);

  const mapCablenameToNumber = (cablename) => {
    switch (cablename) {
      case "GOTV":
        return 1;
      case "DSTV":
        return 2;
      case "STARTIME":
        return 3;
      default:
        return null;
    }
  };

  const validateIUC = async () => {
    if (!selectedTvType || !selectedPlanId || !smartCardNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        cablename: selectedTvType,
        cableplan: selectedPlanId,
        smart_card_number: smartCardNumber,
      };
      const response = await vasServices.validateIUC(data);
      const selectedPlans = tvplan[data.cablename] || [];
      const plan =
        selectedPlans.find((plan) => plan.id === data.cableplan) || {};
      setPlanTitle(plan.title);
      setIucName(response.data.name);

      setTransactionDetails({ ...data, name: response.data.name });
      setShowModal(true);
    } catch (error) {
      Alert.alert("Error", "Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);

    const mappedCablename = mapCablenameToNumber(transactionDetails.cablename);
    const dataToSubmit = {
      ...transactionDetails,
      cablename: mappedCablename,
    };

    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const response = await vasServices.cablesub(dataToSubmit);
        if (response && !response.data.error) {
          Alert.alert(
            "Success",
            "Subscription successful.",
            [
              {
                text: "Download",
                onPress: () => setShowReceipt(true), // Show the receipt to download
              },
              {
                text: "Cancel",
                onPress: () => {
                  setShowReceipt(false);
                  // Navigate back to the refreshed CableTvScreen
                  navigation.goBack();
                },
              },
            ],
            { cancelable: false }
          );
          navigation.replace("CableTvScreen");
          setShowModal(false);
        } else {
          Alert.alert("Error", "Transaction unsuccessful");
          navigation.replace("CableTvScreen");
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.", error);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
        <Text className="text-xl font-bold text-center mb-4">
          Cable TV Subscription
        </Text>
        {/* Display Wallet Info */}
        <Text className="text-lg text-center mb-4">
          Balance: ₦{wallet.balance}
        </Text>
        <Text className="text-lg text-center mb-4">
          Welcome, {wallet.name} {wallet.lastname}
        </Text>
        {/* Select TV Provider */}
        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={selectedTvType}
            onValueChange={handleTvTypeChange}
          >
            <Picker.Item label="Select Provider" value="" />
            <Picker.Item label="GOTV" value="GOTV" />
            <Picker.Item label="DSTV" value="DSTV" />
            <Picker.Item label="STARTIME" value="STARTIME" />
          </Picker>
        </View>

        {/* Select Plan */}
        {selectedTvType && (
          <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
            <Picker
              selectedValue={selectedPlanId}
              onValueChange={handlePlanChange}
            >
              <Picker.Item label="Select Plan" value="" />
              {filteredPlans.map((plan) => (
                <Picker.Item
                  key={plan.plan_id}
                  label={`${plan.title} - ₦${plan.amount}`}
                  value={plan.plan_id}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* Enter Smart Card Number */}

        <TextInput
          value={smartCardNumber}
          onChangeText={setSmartCardNumber}
          placeholder="Enter Smart Card / IUC Number"
          keyboardType="numeric"
          className="p-4 mb-4 border rounded-lg bg-white"
        />

        <Text className="p-4 mb-4 border rounded-lg bg-white">
          Amount to Pay: ₦{amountToPay || "0.00"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1F233B" />
        ) : (
          <CustomButton
            title="Validate"
            onPress={validateIUC}
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
              <Text>TV Provider: {selectedTvType}</Text>
              {/* <Text>Plan: {planTitle}</Text> */}
              <Text>IUC Name: {iucName}</Text>
              <Text>IUC Number: {smartCardNumber}</Text>
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

        {/* {showReceipt && (
        <PDFReceipt
          show={showReceipt}
          onHide={() => setShowReceipt(false)}
          transactionDetails={transactionDetails}
        />
      )} */}
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

export default CableTvScreen;
