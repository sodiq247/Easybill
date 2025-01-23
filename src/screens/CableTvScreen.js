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
import { useWallet } from "../components/Wallet";
import vasServices from "../services/vasServices";
import tvPlans from "../Modules/Plans/tvPlans.json";
import PDFReceipt from "../components/PDFReceipt";
import { useNavigation } from '@react-navigation/native'; // Import for navigation

const CableTvScreen = () => {
  const [selectedTvType, setSelectedTvType] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [iucName, setIucName] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  // Access wallet state from WalletContext
  const { state } = useWallet();
  const { balance, name, lastname } = state;

  // Navigation hook
  const navigation = useNavigation();

  const handlePlanChange = (planId) => {
    const selectedPlan = tvPlans[selectedTvType]?.find(plan => plan.id === planId);
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setAmountToPay(parseFloat(selectedPlan.amount) + 80);
    }
  };

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
      const selectedPlans = tvPlans[data.cablename] || [];
      const plan = selectedPlans.find((plan) => plan.id === data.cableplan) || {};
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

    if (balance < amountToPay) {
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
        navigation.goBack();
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
    <ScrollView className="p-4 bg-gray-100 flex-1">
      {/* <Text className="text-xl font-bold text-center mb-2">Welcome, {name} {lastname}</Text> */}
      <Text className="text-xl font-bold text-center mb-4">Cable TV Subscription</Text>
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
      <TouchableOpacity className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500" onPress={ ()=> navigation.navigate("Electricity")}>
        <Text className="text-white text-center">Electricity</Text>
      </TouchableOpacity>
      </View>
      <View className="p-4 mb-4 border rounded-lg bg-white">
        <Picker
          selectedValue={selectedTvType}
          onValueChange={(value) => {
            setSelectedTvType(value);
            setSelectedPlanId("");
            setAmountToPay(0);
          }}
        >
          <Picker.Item label="Select Cable TV" value="" />
          <Picker.Item label="GOTV" value="GOTV" />
          <Picker.Item label="DSTV" value="DSTV" />
          <Picker.Item label="STARTIME" value="STARTIME" />
        </Picker>
      </View>

      {selectedTvType && (
        <View className="p-4 mb-4 border rounded-lg bg-white">
          <Picker selectedValue={selectedPlanId} onValueChange={handlePlanChange}>
            <Picker.Item label="Select Plan" value="" />
            {tvPlans[selectedTvType]?.map((plan) => (
              <Picker.Item key={plan.id} label={plan.title} value={plan.id} />
            ))}
          </Picker>
        </View>
      )}

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
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Validate"
          onPress={validateIUC}
          style="bg-blue-500"
        />
      )}

      <Modal
        transparent
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-80 p-6 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-4">Transaction Details</Text>
            <Text>TV Provider: {selectedTvType}</Text>
            <Text>Plan: {planTitle}</Text>
            <Text>IUC Number: {smartCardNumber}</Text>
            <Text>IUC Name: {iucName}</Text>
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

      {/* {showReceipt && (
        <PDFReceipt
          show={showReceipt}
          onHide={() => setShowReceipt(false)}
          transactionDetails={transactionDetails}
        />
      )} */}
    </ScrollView>
  );
};

export default CableTvScreen;
