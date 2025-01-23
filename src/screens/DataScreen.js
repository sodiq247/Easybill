import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "../components/CustomButton";
import { useNavigation } from '@react-navigation/native'; // Import for navigation
import { useWallet } from "../components/Wallet";
import vasServices from "../services/vasServices";
import dataPlans from "../Modules/Plans/dataPlans.json";

const DataScreen = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const navigation = useNavigation();
  
  // Access wallet state from WalletContext
  const { state } = useWallet();
  const { balance, name, lastname } = state;

  const handlePlanChange = (planId) => {
    const selectedPlan = dataPlans[selectedNetwork].find(
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
    if (balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const response = await vasServices.dataBundle(data);
        // console.log("buy data response", response);
        if (response && !response.data.error) {
          Alert.alert("Success", "Transaction successful");
          setTransactionDetails({ ...data });
          setShowModal(false);
        }  else {
          Alert.alert("Error","Transaction unsuccessful");
          navigation.goBack();
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.", error);
      }
    }
    setLoading(false);
  };

  return (
    <ScrollView className="p-4 bg-gray-100 flex-1">
      <Text className="text-xl font-bold text-center mb-4">Buy Data</Text>
      <Text className="text-lg text-center mb-4">Balance: ₦{balance}</Text>
       
      <View className="flex-row gap-1 pr-2 my-2">
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"  onPress={ ()=> navigation.navigate("Home")}>
        <Text className="text-white text-center">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"  onPress={ ()=> navigation.navigate("Airtime")}>
        <Text className="text-white text-center">Airtime</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("CableTv")}>
        <Text className="text-white text-center">CableTv</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("Electricity")}>
        <Text className="text-white text-center">Electricity</Text>
      </TouchableOpacity>
      </View>

      <View className="p-4 mb-4 border rounded-lg bg-white">
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

      {/* Plan Selector */}
      {selectedNetwork && (
        <View className="p-4 mb-4 border rounded-lg bg-white">
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

      {/* Mobile Number Input */}
      <TextInput
        value={mobileNumber}
        onChangeText={setMobileNumber}
        placeholder="Enter Mobile Number"
        keyboardType="numeric"
        className="p-4 mb-4 border rounded-lg bg-white"
      />

      {/* Amount Display */}
      <Text className="p-4 mb-4 border rounded-lg bg-white">
        Amount to Pay: ₦{amountToPay || "0.00"}
      </Text>

      {/* Buy Now Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Buy Now"
          onPress={() => setShowModal(true)}
          style="bg-blue-500"
        />
      )}

      {/* Transaction Modal */}
      <Modal
        transparent
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-80 p-6 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-4">Transaction Details</Text>
            <Text>Network: {selectedNetwork}</Text>
            <Text>Plan: {selectedPlanId}</Text>
            <Text>Mobile Number: {mobileNumber}</Text>
            <Text>Amount: ₦{amountToPay}</Text>
            <TouchableOpacity
              className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
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
  );
};

export default DataScreen;
