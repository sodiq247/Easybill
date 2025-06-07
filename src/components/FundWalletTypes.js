"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  Alert,
  ScrollView,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Icon from "react-native-vector-icons/MaterialIcons"
import PaywithPaystack from "./PaywithPaystack"

const FundWalletTypes = () => {
  const [activeTab, setActiveTab] = useState("opay")
  const [amount, setAmount] = useState("")
  const [email, setEmail] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState("")
  const [loading, setLoading] = useState(false)
  const [proceedLoading, setProceedLoading] = useState(false)

  const bankDetails = {
    opay: {
      accountNumber: "8105082299",
      accountName: "Abdulrazaq Sodiq",
      bankName: "Opay",
      color: "#1B4F72",
      icon: "account-balance",
    },
    palmpay: {
      accountNumber: "8105082299",
      accountName: "Abdulrazaq Sodiq",
      bankName: "Palmpay",
      color: "#7B68EE",
      icon: "payment",
    },
  }

  // Retrieve email from AsyncStorage
  const getEmail = async () => {
    try {
      const walletDetailsString = await AsyncStorage.getItem("walletDetails")
      if (!walletDetailsString) {
        // Try alternative storage keys
        const userDataString = await AsyncStorage.getItem("userData")
        if (userDataString) {
          const userData = JSON.parse(userDataString)
          setEmail(userData.email || "")
          return
        }
        console.error("Wallet details not found in storage.")
        return
      }
      const walletDetails = JSON.parse(walletDetailsString)
      const userEmail = walletDetails.email || walletDetails.Profile?.email || ""
      if (!userEmail) {
        console.error("Email not found in wallet details.")
      }
      setEmail(userEmail)
    } catch (error) {
      console.error("Error retrieving email:", error)
    }
  }

  useEffect(() => {
    getEmail()
  }, [])

  // Handle amount input with proper validation
  const handleAmountChange = (value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "")
    setAmount(numericValue)
  }

  // Validate and handle Proceed action
  const handleProceed = async () => {
    if (!amount || Number.parseInt(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.")
      return
    }

    if (Number.parseInt(amount) < 100) {
      Alert.alert("Minimum Amount", "Minimum funding amount is ₦100.")
      return
    }

    setProceedLoading(true)
    await getEmail() // Ensure email is fetched
    setProceedLoading(false)
    setShowModal(true)
  }

  // Handle transfer confirmation via WhatsApp
  const handleTransferConfirmation = async () => {
    if (!email) {
      Alert.alert("Error", "Email not found. Please try again.")
      return
    }

    setLoading(true)
    const selectedBank = bankDetails[activeTab]
    const message = `Payment Confirmation:
Amount: ₦${Number.parseInt(amount).toLocaleString()}
Bank Name: ${selectedBank.bankName}
Account Name: ${selectedBank.accountName}
Account Number: ${selectedBank.accountNumber}
Email: ${email}

Please confirm this payment.`

    const whatsappURL = `whatsapp://send?phone=+2348105082299&text=${encodeURIComponent(message)}`

    try {
      const canOpen = await Linking.canOpenURL(whatsappURL)
      if (canOpen) {
        await Linking.openURL(whatsappURL)
        // Close modal after successful WhatsApp opening
        setTimeout(() => {
          setShowModal(false)
          setPaymentStep("")
          setAmount("")
        }, 1000)
      } else {
        Alert.alert(
          "WhatsApp Not Available",
          "WhatsApp is not installed on this device. Please install WhatsApp or use card payment.",
          [
            { text: "Use Card Payment", onPress: () => setPaymentStep("paystack") },
            { text: "Cancel", style: "cancel" },
          ],
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open WhatsApp. Please try again.")
      console.error("Error opening WhatsApp:", error)
    }

    setLoading(false)
  }

  // Reset modal state
  const closeModal = () => {
    setShowModal(false)
    setPaymentStep("")
  }

  // Format amount display
  const formatAmount = (amt) => {
    if (!amt) return "0"
    return Number.parseInt(amt).toLocaleString()
  }

  return (
    <View className="bg-white rounded-2xl p-6 shadow-lg">
      <Text className="text-2xl font-bold text-center text-gray-900 mb-6">Fund Your Wallet</Text>

      {/* Amount Input */}
      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-3 text-base">Enter Amount</Text>
        <View className="relative">
          <TextInput
            className="border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-gray-900 bg-gray-50 focus:border-blue-500"
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
            maxLength={10}
          />
          <View className="absolute left-4 top-4">
            <Text className="text-lg font-semibold text-gray-600">₦</Text>
          </View>
        </View>
        {amount && <Text className="text-sm text-gray-500 mt-2">Amount: ₦{formatAmount(amount)}</Text>}
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        className={`bg-gray-900 rounded-xl py-4 px-6 ${proceedLoading || !amount ? "opacity-50" : ""}`}
        onPress={handleProceed}
        disabled={proceedLoading || !amount}
      >
        {proceedLoading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="text-white font-semibold text-center ml-2">Processing...</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold text-center text-lg">Proceed</Text>
        )}
      </TouchableOpacity>

      {/* Payment Method Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 w-11/12 max-w-md max-h-4/5">
            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentStep === "" ? (
                <>
                  {/* Payment Method Selection */}
                  <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-xl font-bold text-gray-900">Select Payment Method</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-center text-gray-600 mb-6">Amount: ₦{formatAmount(amount)}</Text>

                  <TouchableOpacity
                    className="bg-blue-500 rounded-xl py-4 mb-4 flex-row items-center justify-center"
                    onPress={() => setPaymentStep("bank")}
                  >
                    <Icon name="account-balance" size={24} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-center ml-3 text-lg">Pay with Bank Transfer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
                    onPress={() => setPaymentStep("paystack")}
                  >
                    <Icon name="credit-card" size={24} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-center ml-3 text-lg">Pay with Card</Text>
                  </TouchableOpacity>
                </>
              ) : paymentStep === "bank" ? (
                <>
                  {/* Bank Transfer Section */}
                  <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={() => setPaymentStep("")}>
                      <Icon name="arrow-back" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Bank Transfer</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Bank Selection Tabs */}
                  <Text className="text-lg font-semibold text-gray-800 mb-4">Select Your Bank</Text>
                  <View className="flex-row mb-6">
                    {Object.keys(bankDetails).map((key) => (
                      <TouchableOpacity
                        key={key}
                        className={`flex-1 mx-1 py-3 rounded-xl border-2 ${
                          activeTab === key ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-200"
                        }`}
                        onPress={() => setActiveTab(key)}
                      >
                        <View className="items-center">
                          <Icon
                            name={bankDetails[key].icon}
                            size={24}
                            color={activeTab === key ? "#3B82F6" : "#6B7280"}
                          />
                          <Text
                            className={`text-center font-semibold mt-1 ${
                              activeTab === key ? "text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {bankDetails[key].bankName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Transfer Details */}
                  <View className="bg-gray-50 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Transfer Details</Text>

                    <View className="space-y-3">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 font-medium">Amount:</Text>
                        <Text className="text-gray-900 font-bold">₦{formatAmount(amount)}</Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 font-medium">Bank Name:</Text>
                        <Text className="text-gray-900 font-semibold">{bankDetails[activeTab].bankName}</Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 font-medium">Account Number:</Text>
                        <Text className="text-gray-900 font-semibold">{bankDetails[activeTab].accountNumber}</Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 font-medium">Account Name:</Text>
                        <Text className="text-gray-900 font-semibold">{bankDetails[activeTab].accountName}</Text>
                      </View>
                    </View>

                    <View className="bg-red-50 rounded-lg p-3 mt-4">
                      <Text className="text-red-700 font-semibold text-center">⚠️ Transfer the exact amount above!</Text>
                    </View>
                  </View>

                  {/* Confirmation Button */}
                  <TouchableOpacity
                    className={`bg-green-500 rounded-xl py-4 flex-row items-center justify-center ${
                      loading ? "opacity-50" : ""
                    }`}
                    onPress={handleTransferConfirmation}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">Sending...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="check-circle" size={24} color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2 text-lg">I've Sent the Money</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Paystack Payment Section */}
                  <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={() => setPaymentStep("")}>
                      <Icon name="arrow-back" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Card Payment</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <PaywithPaystack amount={amount} email={email} onClose={closeModal} />
                </>
              )}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity className="bg-gray-200 rounded-xl py-3 mt-4" onPress={closeModal}>
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default FundWalletTypes
