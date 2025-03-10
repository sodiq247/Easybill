import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Paystack } from "react-native-paystack-webview";
import CustomButton from "./CustomButton";
import vasServices from "../services/vasServices";
import axios from "axios";

const PaywithPaystack = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);
  const paystackWebViewRef = useRef(null);

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    setPaystackVisible(false);

    try {
      const transactionReference = response?.transactionRef?.reference;
      if (!transactionReference) {
        throw new Error("Transaction reference not found");
      }

      const verifyUrl = `https://api.paystack.co/transaction/verify/${transactionReference}`;
      const res = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer sk_test_fcad21719bcdddaaa51a90430b0c9c244ddce10e`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.status && res.data.data.status === "success") {
        const amount = res.data.data.amount / 100; // Convert from kobo to Naira
        console.log("Verified amount:", amount);

        const response = await vasServices.creditWallet(amount);
        console.log("Fund Wallet Response:", response);

        Alert.alert(
          "Payment Successful",
          "Your wallet has been credited successfully."
        );
      } else {
        Alert.alert(
          "Payment Failed",
          "Verification failed. Please contact support."
        );
      }
    } catch (error) {
      console.error(
        "Verification Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Verification Error",
        "Could not verify payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-gray-60 p-4 rounded-lg shadow-lg">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        Pay with Paystack
      </Text>

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
      <TouchableOpacity
        className="w-full bg-[#14172A] text-white p-3 rounded-lg mt-6 flex items-center justify-center"
        onPress={() => setPaystackVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Pay Now</Text>
        )}
      </TouchableOpacity>
      {paystackVisible && (
        <Paystack
          ref={paystackWebViewRef}
          showPayButton={false}
          paystackKey="pk_live_f16d1e2318b3a040165ffad5c215f26b5f1206e1"
          amount={parseInt(amount)}
          billingEmail={email}
          activityIndicatorColor="green"
          onCancel={() => {
            setPaystackVisible(false);
            Alert.alert("Payment Cancelled", "You cancelled the payment.");
          }}
          onSuccess={handlePaymentSuccess}
          autoStart={true}
        />
      )}
    </View>
  );
};

export default PaywithPaystack;
