import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  Alert,
} from "react-native";
import PaywithPaystack from "./PaywithPaystack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FundWalletTypes = () => {
  const [activeTab, setActiveTab] = useState("opay"); // Tracks active bank tab
  const [amount, setAmount] = useState(""); // User-entered amount
  const [email, setEmail] = useState(""); // User's email from AsyncStorage
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [paymentStep, setPaymentStep] = useState(""); // Payment step: bank/paystack
  const [loading, setLoading] = useState(false);

  const bankDetails = {
    opay: {
      accountNumber: "8105082299",
      accountName: "Abdulrazaq Sodiq",
      bankName: "Opay",
    },
    palmpay: {
      accountNumber: "8105082299",
      accountName: "Abdulrazaq Sodiq",
      bankName: "Palmpay",
    },
  };

  // Retrieve email from AsyncStorage
  const getEmail = async () => {
    try {
      const walletDetailsString = await AsyncStorage.getItem("walletDetails");
      if (!walletDetailsString) {
        console.error("Wallet details not found in storage.");
        return;
      }
      const walletDetails = JSON.parse(walletDetailsString);
      const email = walletDetails.email;
      if (!email) {
        console.error("Email not found in wallet details.");
      }
      setEmail(email);
    } catch (error) {
      console.error("Error retrieving email:", error);
    }
  };

  const handleAmountChange = (e) => {
    // Get the current input value
    const value = e.target.value;
  
    // Only allow numeric characters (digits 0-9)
    const numericValue = value.replace(/[^0-9]/g, "");
  
    // Update the state with the sanitized value
    setAmount(numericValue);
  };
   // Handle proceed button
   const handleProceed = () => {
     if (!amount || parseInt(amount) <= 0) {
       Alert.alert("Error", "Please enter a valid amount.");
       return;
     }
     getEmail();
     setShowModal(true);
   };

  // Handle transfer confirmation via WhatsApp
  const handleTransferConfirmation = () => {
    setLoading(true);
    const selectedBank = bankDetails[activeTab];
    const message = `Payment Confirmation:\nAmount: ₦${amount}\nBank Name: ${selectedBank.bankName}\nAccount Name: ${selectedBank.accountName}\nAccount Number: ${selectedBank.accountNumber}\nEmail: ${email}`;
    const whatsappURL = `whatsapp://send?phone=+2348105082299&text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(whatsappURL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappURL);
        } else {
          Alert.alert(
            "Error",
            "WhatsApp is not installed or not supported on this device."
          );
        }
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to open WhatsApp.");
        console.error("Error opening WhatsApp:", error);
      });

    setLoading(false);
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mt-2">
      <Text className="text-xl font-semibold text-center text-gray-800 mb-4">
        Fund Your Wallet
      </Text>

      {/* Amount Input */}
      <View className="mb-2">
        <Text className="text-gray-600 font-medium mb-2 ml-4">Amount</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-2"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange} // Validate input here
        />
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        className=" bg-[#1F233B] rounded-lg py-2 px-4 mt-2"
        onPress={handleProceed}
      >
        <Text className="text-white font-medium text-center">Proceed</Text>
      </TouchableOpacity>

      {/* Modal for Payment Options */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            {paymentStep === "" ? (
              <>
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Select Payment Method
                </Text>
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg py-2 mb-2"
                  onPress={() => setPaymentStep("bank")}
                >
                  <Text className="text-white font-medium text-center">
                    Pay with Bank Transfer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-500 rounded-lg py-2"
                  onPress={() => setPaymentStep("paystack")}
                >
                  <Text className="text-white font-medium text-center">
                    Pay with Card
                  </Text>
                </TouchableOpacity>
              </>
            ) : paymentStep === "bank" ? (
              <>
                {/* Bank Account Tabs */}
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Select Your Prefer Bank
                </Text>
                <View className="flex flex-row justify-between mb-4">
                  {Object.keys(bankDetails).map((key) => (
                    <TouchableOpacity
                      key={key}
                      className={`flex-1 mx-2 py-2 rounded-lg ${
                        activeTab === key ? "bg-blue-500" : "bg-gray-200"
                      }`}
                      onPress={() => setActiveTab(key)}
                    >
                      <Text
                        className={`text-center font-medium ${
                          activeTab === key ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {bankDetails[key].bankName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Display Selected Bank Details */}
                <View>
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    Transfer Details
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    Amount: ₦{" "}
                    <Text className="text-gray-800 font-medium">{amount}</Text>
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    Bank Name:{" "}
                    <Text className="text-gray-800 font-medium">
                      {bankDetails[activeTab].bankName}
                    </Text>
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    Account Number:{" "}
                    <Text className="text-gray-800 font-medium">
                      {bankDetails[activeTab].accountNumber}
                    </Text>
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    Account Name:{" "}
                    <Text className="text-gray-800 font-medium">
                      {bankDetails[activeTab].accountName}
                    </Text>
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    <Text className="text-red-800 font-medium">
                      Transfer the exact amount above!
                    </Text>
                  </Text>
                  <TouchableOpacity
                    className={`bg-green-500 rounded-lg py-2 mt-4 flex items-center justify-center ${
                      loading ? "opacity-50" : ""
                    }`} // Reduce opacity when loading
                    onPress={handleTransferConfirmation}
                    disabled={loading} // Disable the button while loading
                  >
                    {loading ? (
                      <ActivityIndicator size="large" color="#FFFFFF" /> // ActivityIndicator for loading state
                    ) : (
                      <Text className="text-white font-medium text-center">
                        I've Sent the Money
                      </Text> // Default text
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <PaywithPaystack amount={amount} email={email} /> // Pass amount and email as props
            )}
            <TouchableOpacity
              className="bg-gray-300 rounded-lg py-2 mt-4"
              onPress={() => {
                setShowModal(false);
                setPaymentStep("");
              }}
            >
              <Text className="text-black font-medium text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FundWalletTypes;
