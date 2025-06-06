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
import vasServices from "../services/vasServices";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import accountServices from "../services/auth.services";

const AirtimeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  // Validate and sanitize amount input
  const handleAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setAmount(sanitizedValue);
  };

  const handlePurchase = async () => {
    if (!selectedNetwork || !amount || !mobileNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (parseInt(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid positive amount.");
      return;
    }
    setLoading(true);

    const data = {
      airtime_type: "VTU",
      amount: Number(amount),
      mobile_number: mobileNumber,
      network: selectedNetwork,
    };

    if (wallet.balance < Number(amount)) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const response = await vasServices.airTime(data);
        // console.log("response", response);
        if (
          response &&
          response.data.result &&
          !response.data.result.error?.length
        ) {
          Alert.alert("Success", "Transaction successful");
          setShowModal(false);
        } else {
          const errorMessage =
            response?.data?.result?.error?.[0] || "Transaction unsuccessful";
          console.log("Error", errorMessage);
          Alert.alert("Transaction unsuccessful");
          navigation.replace("AirtimeScreen");
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.");
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
     

      <ScrollView
        className="p-6 bg-gray-100 flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">
          Buy Airtime
        </Text>
        <Text className="text-lg text-center text-gray-600 mb-2">
          Balance: ₦{wallet.balance}
        </Text>
        <Text className="text-lg text-center text-gray-600 mb-6">
          Welcome, {wallet.name} {wallet.lastname}
        </Text>

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={selectedNetwork}
            onValueChange={(itemValue) => setSelectedNetwork(itemValue)}
          >
            <Picker.Item label="Select Network" value="" />
            <Picker.Item label="MTN" value="1" />
            <Picker.Item label="GLO" value="2" />
            <Picker.Item label="Airtel" value="3" />
            <Picker.Item label="9mobile" value="4" />
          </Picker>
        </View>

        <TextInput
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Enter Mobile Number"
          keyboardType="numeric"
          className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md"
        />
        <TextInput
          value={amount}
          onChangeText={handleAmountChange} // Validate amount here
          placeholder="Enter Amount"
          keyboardType="numeric"
          className="p-4 mb-6 border border-gray-300 rounded-lg bg-white shadow-md"
        />

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
              {/* <Text>Network: {selectedNetwork}</Text> */}
              <Text>Mobile Number: {mobileNumber}</Text>
              <Text>Amount: ₦{amount}</Text>
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
       <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={onRefresh}
        logout={handleLogout}
      />
      <Footer /> 

    </SafeAreaView>
  );
};

export default AirtimeScreen;
