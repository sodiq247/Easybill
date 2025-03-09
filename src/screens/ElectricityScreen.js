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
import { useNavigation } from "@react-navigation/native"; // Import for navigation
import CustomButton from "../components/CustomButton";
import vasServices from "../services/vasServices";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import accountServices from "../services/auth.services";

const ElectricityScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterType, setMeterType] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [amountToPay, setAmountToPay] = useState(0);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch wallet balance whenever the page is reloaded
    fetchWalletDetails();
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails().finally(() => setRefreshing(false));
  }, []);

  const validateMeter = async () => {
    if (!selectedDisco || !meterNumber || !meterType || !amount) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);
    const data = {
      disco_name: selectedDisco,
      meter_number: meterNumber,
      MeterType: meterType,
      amount: Number(amount),
    };
    console.log("data", data);
    try {
      const response = await vasServices.validateMeter(data);
      if (response && !response.error) {
        setTransactionDetails({
          ...data,
          name: response.data.name,
          address: response.data.address,
        });
        setShowModal(true);
      } else {
        Alert.alert(
          "Validation Failed",
          response?.message || "Error validating meter"
        );
      }
    } catch (error) {
      console.error("Error validating meter:", error);
      Alert.alert("Error", "Validation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);

    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
      setLoading(false);
      return;
    }

    try {
      const response = await vasServices.electric(transactionDetails);
      // console.log("pay elect response", response);
      if (response && !response.data.error) {
        Alert.alert("Success", "Transaction successful");
        navigation.replace("ElectricityScreen");
        setShowModal(false);
      } else {
        Alert.alert("Error", "Transaction unsuccessful");
        navigation.replace("ElectricityScreen");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Transaction failed.");
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView className="flex-1 h-screen bg-red-100 mt-[40px]">
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
        className="p-6 bg-red-100 flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">
          Buy Electricity
        </Text>
        {/* Display Wallet Info */}
        <Text className="text-lg text-center mb-4">
          Balance: ₦{wallet.balance}
        </Text>
        <Text className="text-lg text-center mb-4">
          Welcome, {wallet.name} {wallet.lastname}
        </Text>
        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={selectedDisco}
            onValueChange={(itemValue) => setSelectedDisco(itemValue)}
          >
            <Picker.Item label="Select Disco" value="" />
            <Picker.Item value="18" label="Ikeja Electric" />
            <Picker.Item value="20" label="Eko Electric" />
            <Picker.Item value="25" label="Abuja Electric" />
            <Picker.Item value="23" label="Kano Electric" />
            <Picker.Item value="26" label="Enugu Electric" />
            <Picker.Item value="21" label="Port Harcourt Electric" />
            <Picker.Item value="19" label="Ibadan Electric" />
            <Picker.Item value="22" label="Kaduna Electric" />
            <Picker.Item value="24" label="Jos Electric" />
            <Picker.Item value="28" label="Yola Electric" />
            <Picker.Item value="29" label="Benin Electric" />
          </Picker>
        </View>

        <TextInput
          value={meterNumber}
          onChangeText={setMeterNumber}
          placeholder="Enter Meter Number"
          keyboardType="numeric"
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md"
        />

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={meterType}
            onValueChange={(itemValue) => setMeterType(itemValue)}
          >
            <Picker.Item label="Select Meter Type" value="" />
            <Picker.Item label="Prepaid" value="Prepaid" />
            <Picker.Item label="Postpaid" value="Postpaid" />
          </Picker>
        </View>

        <TextInput
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            const numericAmount = parseFloat(value) || 0;
            setAmountToPay(numericAmount + 100); // Add ₦100 service fee
          }}
          placeholder="Enter Amount"
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
            title="Validate Meter"
            onPress={validateMeter}
            style="bg-[#1F233B]"
          />
        )}

        <Modal
          transparent={true}
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="w-80 p-6 bg-white rounded-lg shadow-lg">
              <Text className="text-lg font-bold mb-4">
                Transaction Details
              </Text>
              <Text>Disco: {transactionDetails.disconame}</Text>
              <Text>Meter Number: {transactionDetails.meternumber}</Text>
              <Text>Amount: ₦{amountToPay}</Text>
              <Text>Name: {transactionDetails.name}</Text>
              <Text>Address: {transactionDetails.address}</Text>
              {/* <TouchableOpacity
                className="mt-4 px-4 py-2 bg-[#1F233B] rounded-lg"
                onPress={handlePurchase}
              >
                <Text className="text-white text-center">Proceed</Text>
              </TouchableOpacity> */}
              {loading ? (
                <ActivityIndicator size="large" color="#1F233B" />
              ) : (
                <CustomButton
                  title="Proceed"
                  onPress={handlePurchase}
                  style="mt-4 px-4 py-2 bg-[#1F233B] rounded-lg"
                />
              )}
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
    </SafeAreaView>
  );
};

export default ElectricityScreen;
