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
import { useNavigation } from "@react-navigation/native";
import { useWallet } from "../components/Wallet";
import vasServices from "../services/vasServices";

const AirtimeScreen = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const navigation = useNavigation();

  const { state } = useWallet();
  const { balance = 0, name, lastname } = state;

  const handlePurchase = async () => {
    if (!selectedNetwork || !amount || !mobileNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);

    const data = {
      airtime_type: "VTU",
      amount: Number(amount),
      mobile_number: mobileNumber,
      network: selectedNetwork,
    };

    if (balance < Number(amount)) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
    try {
      const response = await vasServices.airTime(data);
     console.log("response", response)
      if (response && !response.data.error) {
        Alert.alert("Success", "Transaction successful");
        setTransactionDetails(data);
        setShowModal(false);
      } else {
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
    <ScrollView className="px-4 py-6 bg-gray-100 flex-1">
      <Text className="text-[20px] font-bold text-center mb-4">Buy Airtime</Text>
      <Text className="text-lg text-center mb-4">Balance: ₦{balance}</Text>
       
      <View className="flex-row gap-1 pr-2 my-2">
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"  onPress={ ()=> navigation.navigate("Home")}>
        <Text className="text-white text-center">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("Data")}>
        <Text className="text-white text-center">Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("CableTv")}>
        <Text className="text-white text-center">CableTv</Text>
      </TouchableOpacity>
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("Electricity")}>
        <Text className="text-white text-center">Electricity</Text>
      </TouchableOpacity>
      </View>
      <View className="p-4 mb-4 border rounded-lg border-gray-300 bg-white">
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
        className="p-4 mb-4 border rounded-lg border-gray-300 bg-white"
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter Amount"
        keyboardType="numeric"
        className="p-4 mb-6 border rounded-lg border-gray-300 bg-white"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Buy Now"
          onPress={() => setShowModal(true)}
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
            <Text>Network: {selectedNetwork}</Text>
            <Text>Mobile Number: {mobileNumber}</Text>
            <Text>Amount: ₦{amount}</Text>

            <TouchableOpacity
              className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
              onPress={handlePurchase}
            >
              <Text className="text-white text-center">Proceed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-4 px-4 py-2 bg-gray-400 rounded-lg"
              onPress={() => setShowModal(false)}
            >
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AirtimeScreen;
