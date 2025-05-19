import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Paystack } from "react-native-paystack-webview";

const PaywithPaystack = ({ amount, email }) => {
  const [loading, setLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(true);
  const paystackWebViewRef = useRef(null);

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    setPaystackVisible(false);

    try {
      const transactionReference = response?.transactionRef?.reference;
      if (!transactionReference) {
        throw new Error("Transaction reference not found.");
      }

      const verifyUrl = `https://api.paystack.co/transaction/verify/${transactionReference}`;

      const res = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer sk_test_fcad21719bcdddaaa51a90430b0c9c244ddce10e`, // 🔐 Replace with live/test key securely in production
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.status && data.data.status === "success") {
        const amountVerified = data.data.amount / 100;
        Alert.alert(
          "Payment Successful",
          `Your wallet has been credited with ₦${amountVerified}.`
        );
      } else {
        Alert.alert("Payment Failed", "Verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Verification Error:", error.message);
      Alert.alert("Verification Error", "Could not verify payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white p-6 rounded-lg shadow-lg">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Processing Payment...</Text>
      {loading && <ActivityIndicator color="#000" />}
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
      {!paystackVisible && !loading && (
        <TouchableOpacity
          className="w-full bg-[#14172A] text-white p-3 rounded-lg mt-6 flex items-center justify-center"
          onPress={() => setPaystackVisible(true)}
        >
          <Text className="text-white font-semibold">Retry Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PaywithPaystack;
