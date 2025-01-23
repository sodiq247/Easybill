import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
// import PaystackWebView from 'react-native-paystack-webview';
import { PaystackWebView } from 'react-native-paystack-webview';

import CustomButton from "../components/CustomButton";
// import { useWallet } from "./Wallet";

const PaywithPaystack = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);

  const validateInput = () => {
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount.");
      return false;
    }
    if (!email || !email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }
    return true;
  };

  return (
    <View className="bg-gray-50 p-4 rounded-lg shadow-lg">
      <Text className="text-lg font-bold text-gray-800 mb-4">Pay with Paystack</Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-600">Amount</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 mt-2"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-600">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-2 mt-2"
          placeholder="Enter email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Proceed"
          onPress={() => {
            if (validateInput()) setPaystackVisible(true);
          }}
          style="bg-blue-600 py-3 rounded-lg"
        />
      )}

      {paystackVisible && (
        <PaystackWebView
          showPayButton={false}
          paystackKey="pk_test_2fa77e4d6a3815e581c8f57a3e9c872bd2acd626"
          amount={parseInt(amount)}
          billingEmail={email}
          activityIndicatorColor="green"
          onCancel={(e) => {
            setPaystackVisible(false);
            Alert.alert("Payment Cancelled", "You cancelled the payment.");
          }}
          onSuccess={(response) => {
            setPaystackVisible(false);
            Alert.alert("Payment Successful", `Reference: ${response.transactionRef.reference}`);
            console.log("Payment Success:", response);
            // Call your wallet update function here
          }}
          autoStart={true}
        />
      )}
    </View>
  );
};

export default PaywithPaystack;
