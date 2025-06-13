"use client"

import { useRef, useState } from "react"
import { View, Text, ActivityIndicator, Alert } from "react-native"
import { Paystack } from "react-native-paystack-webview"
import axios from "axios"
import Button from "./ui/Button"
import { theme } from "../utils/theme"

const PaywithPaystack = ({ amount, email, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [paystackVisible, setPaystackVisible] = useState(true)
  const paystackWebViewRef = useRef(null)

  const handlePaymentSuccess = async (response) => {
    setLoading(true)
    setPaystackVisible(false)

    try {
      const transactionReference = response?.transactionRef?.reference
      if (!transactionReference) {
        throw new Error("Transaction reference not found.")
      }

      const verifyUrl = `https://api.paystack.co/transaction/verify/${transactionReference}`
      const res = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer sk_test_fcad21719bcdddaaa51a90430b0c9c244ddce10e`, // Replace with your actual test/live key
          "Content-Type": "application/json",
        },
      })

      if (res.data.status && res.data.data.status === "success") {
        const amountVerified = res.data.data.amount / 100 // Convert from kobo to Naira
        Alert.alert("Payment Successful", `Your wallet has been credited with ₦${amountVerified}.`, [
          {
            text: "OK",
            onPress: () => {
              if (onClose) onClose()
            },
          },
        ])
      } else {
        Alert.alert("Payment Failed", "Verification failed. Please contact support.")
      }
    } catch (error) {
      console.error("Verification Error:", error.message)
      Alert.alert("Verification Error", "Could not verify payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentCancel = () => {
    setPaystackVisible(false)
    Alert.alert("Payment Cancelled", "You cancelled the payment.")
  }

  return (
    <View
      style={{
        backgroundColor: theme.white,
        padding: 24,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: theme.secondary,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Processing Payment...
      </Text>

      {loading && (
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={{ color: theme.textLight, marginTop: 8 }}>Verifying payment...</Text>
        </View>
      )}

      {paystackVisible && (
        <Paystack
          ref={paystackWebViewRef}
          showPayButton={false}
          paystackKey="pk_live_f16d1e2318b3a040165ffad5c215f26b5f1206e1"
          amount={Number.parseInt(amount)} // Amount passed as prop
          billingEmail={email} // Email passed as prop
          activityIndicatorColor={theme.primary}
          onCancel={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          autoStart={true}
        />
      )}

      {!paystackVisible && !loading && (
        <View style={{ gap: 12, marginTop: 24 }}>
          <Button text="Retry Payment" onPress={() => setPaystackVisible(true)} fullWidth={true} />
          <Button text="Cancel" variant="outline" onPress={onClose} fullWidth={true} />
        </View>
      )}
    </View>
  )
}

export default PaywithPaystack
