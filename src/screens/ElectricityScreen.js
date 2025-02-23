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
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Import for navigation
import CustomButton from "../components/CustomButton";
import vasServices from "../services/vasServices";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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

  // Fetch wallet details from AsyncStorage
  const fetchWalletDetails = async () => {
    try {
      const storedWallet = await AsyncStorage.getItem("walletDetails");
      if (storedWallet) {
        setWallet(JSON.parse(storedWallet));
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

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
      disconame: selectedDisco,
      meternumber: meterNumber,
      mtype: meterType,
      amount: Number(amount),
    };
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
    <View className="flex-1">
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(false)} logout={handleLogout}
      />
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={onRefresh} logout={handleLogout}
      />

      <ScrollView
        className="p-6 bg-gray-100 flex-1"
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
            <Picker.Item label="Ikeja Electric" value="Ikeja Electric" />
            <Picker.Item label="Eko Electric" value="Eko Electric" />
            <Picker.Item label="Abuja Electric" value="Abuja Electric" />
            <Picker.Item label="Kano Electric" value="Kano Electric" />
            <Picker.Item label="Enugu Electric" value="Enugu Electric" />
            <Picker.Item
              label="Port Harcourt Electric"
              value="Port Harcourt Electric"
            />
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
    </View>
  );
};

export default ElectricityScreen;
