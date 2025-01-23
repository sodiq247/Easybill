import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "../components/CustomButton";
import { useNavigation } from '@react-navigation/native'; // Import for navigation

import vasServices from "../services/vasServices";
import { useWallet } from "../components/Wallet";

const ElectricityScreen = () => {
  const [selectedDisco, setSelectedDisco] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterType, setMeterType] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [amountToPay, setAmountToPay] = useState(0);
  // Access wallet state from WalletContext
  const { state } = useWallet();
  const { balance, name, lastname } = state;

  // Navigation hook
  const navigation = useNavigation();

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

    if (balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
      setLoading(false);
      return;
    }

    try {
      const response = await vasServices.electric(transactionDetails);
      // console.log("pay elect response", response);
      if (response && !response.data.error) {
        Alert.alert("Success", "Transaction successful");
        navigation.goBack();
        setShowModal(false);
      } else {
        Alert.alert("Error","Transaction unsuccessful");
        navigation.goBack();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="px-4 py-6 bg-gray-100 flex-1">
      <Text className="text-[20px] font-bold text-center mb-4">
        Buy Electricity
      </Text>
      <Text className="text-lg text-center mb-4">Balance: ₦{balance}</Text>
      
      <View className="flex-row gap-1 pr-2 my-2">
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"  onPress={ ()=> navigation.navigate("Home")}>
        <Text className="text-white text-center">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("Data")}>
        <Text className="text-white text-center">Data</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"  onPress={ ()=> navigation.navigate("Airtime")}>
        <Text className="text-white text-center">Airtime</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("CableTv")}>
        <Text className="text-white text-center">CableTv</Text>
      </TouchableOpacity>
       </View>
      <View className="p-4 mb-4 border rounded-lg border-gray-300 bg-white">
       
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
        className="p-4 mb-4 border rounded-lg border-gray-300 bg-white"
      />

      <View className="p-4 mb-4 border rounded-lg border-gray-300 bg-white">
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
        className="p-4 mb-6 border rounded-lg border-gray-300 bg-white"
      />

      <Text className="p-4 mb-4 border rounded-lg bg-white">
        Amount to Pay: ₦{amountToPay || "0.00"}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Validate Meter"
          onPress={validateMeter}
          style="bg-blue-500"
        />
      )}

      <Modal
        transparent={true}
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-80 p-6 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-4">Transaction Details</Text>
            <Text>Disco: {transactionDetails.disconame}</Text>
            <Text>Meter Number: {transactionDetails.meternumber}</Text>
            <Text>Amount: ₦{amountToPay}</Text>
            <Text>Name: {transactionDetails.name}</Text>
            <Text>Address: {transactionDetails.address}</Text>
            <TouchableOpacity
              className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
              onPress={handlePurchase}
            >
              <Text className="text-white text-center">Proceed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4 px-4 py-2 bg-gray-500 rounded-lg"
              onPress={() => setShowModal(false)}
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ElectricityScreen;
