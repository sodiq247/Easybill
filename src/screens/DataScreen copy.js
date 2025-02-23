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
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import vasServices from "../services/vasServices";
import dataPlans from "../Modules/Plans/dataPlans.json";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DataScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const navigation = useNavigation();

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

  const handlePlanChange = (planId) => {
    const selectedPlan = dataPlans[selectedNetwork]?.find(
      (plan) => plan.id === planId
    );
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setAmountToPay(selectedPlan.amount);
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
          onRefresh();
        } else {
          Alert.alert("Error", "Transaction unsuccessful");
          navigation.goBack();
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.");
      }
    }
    setLoading(false);
  };

  return (
    <View className="flex-1">
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} />
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} />
      
    <ScrollView
      className="p-6 bg-gray-100 flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">Buy Data</Text>
      <Text className="text-lg text-center text-gray-600 mb-2">Balance: ₦{wallet.balance}</Text>
      <Text className="text-lg text-center text-gray-600 mb-6">Welcome, {wallet.name} {wallet.lastname}</Text>
      
      <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
        <Picker
          selectedValue={selectedNetwork}
          onValueChange={(value) => {
            setSelectedNetwork(value);
            setSelectedPlanId("");
            setAmountToPay(0);
          }}
        >
          <Picker.Item label="Select Network" value="" />
          <Picker.Item label="MTN" value="1" />
          <Picker.Item label="GLO" value="2" />
          <Picker.Item label="Airtel" value="3" />
          <Picker.Item label="9mobile" value="4" />
        </Picker>
      </View>

      {selectedNetwork && (
        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Picker
            selectedValue={selectedPlanId}
            onValueChange={(value) => handlePlanChange(value)}
          >
            <Picker.Item label="Select Plan" value="" />
            {dataPlans[selectedNetwork]?.map((plan) => (
              <Picker.Item key={plan.id} label={plan.title} value={plan.id} />
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
    </ScrollView>
    </View>
  );
};

export default DataScreen;
