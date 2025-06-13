"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Modal, Linking, Alert, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Icon from "react-native-vector-icons/MaterialIcons"
import PaywithPaystack from "./PaywithPaystack"
import Button from "./ui/Button"
import Input from "./ui/Input"
import { theme } from "../utils/theme"

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
      bankName: "Moniepoint",
      color: theme.primary,
      icon: "account-balance",
    },
    palmpay: {
      accountNumber: "8105082299",
      accountName: "Abdulrazaq Sodiq",
      bankName: "Opay",
      color: theme.accent,
      icon: "payment",
    },
  }

  // Retrieve email from AsyncStorage
  const getEmail = async () => {
    try {
      const walletDetailsString = await AsyncStorage.getItem("walletDetails")
      if (!walletDetailsString) {
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
    await getEmail()
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
    <View
      style={{
        // backgroundColor: theme.white,
        // borderRadius: 16,
        // padding: 24,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 5,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          textAlign: "center",
          color: theme.secondary,
          marginBottom: 24,
        }}
      >
        Fund Your Wallet
      </Text>

      {/* Amount Input */}
      <View style={{ marginBottom: 5, display: "flex", flexDirection: "column" }}>
        <Input
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="Enter amount"
          label="Amount (₦)"
          keyboardType="numeric"
        />
        {/* Proceed Button */}
      <Button
        text="Proceed"
        onPress={handleProceed}
        loading={proceedLoading}
        disabled={proceedLoading || !amount}
        fullWidth={true}
      />
      </View>
      

      {/* Payment Method Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: theme.white,
              borderRadius: 24,
              padding: 24,
              width: "90%",
              maxWidth: 400,
              maxHeight: "80%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentStep === "" ? (
                <>
                  {/* Payment Method Selection */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "700", color: theme.secondary }}>
                      Select Payment Method
                    </Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color={theme.textFaded} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      textAlign: "center",
                      color: theme.textLight,
                      marginBottom: 24,
                      fontSize: 16,
                    }}
                  >
                    Amount: ₦{formatAmount(amount)}
                  </Text>

                  <View style={{ gap: 16, marginBottom: 24 }}>
                    <Button
                      text="Pay with Bank Transfer"
                      icon="account-balance"
                      onPress={() => setPaymentStep("bank")}
                      fullWidth={true}
                    />

                    <Button
                      text="Pay with Card"
                      icon="credit-card"
                      variant="secondary"
                      onPress={() => setPaymentStep("paystack")}
                      fullWidth={true}
                    />
                  </View>
                </>
              ) : paymentStep === "bank" ? (
                <>
                  {/* Bank Transfer Section */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <TouchableOpacity onPress={() => setPaymentStep("")}>
                      <Icon name="arrow-back" size={24} color={theme.textFaded} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: theme.secondary }}>Bank Transfer</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color={theme.textFaded} />
                    </TouchableOpacity>
                  </View>

                  {/* Bank Selection Tabs */}
                  <Text style={{ fontSize: 18, fontWeight: "600", color: theme.secondary, marginBottom: 16 }}>
                    Select Your Bank
                  </Text>
                  <View style={{ flexDirection: "row", marginBottom: 24, gap: 8 }}>
                    {Object.keys(bankDetails).map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: activeTab === key ? theme.primary : theme.border,
                          backgroundColor: activeTab === key ? theme.primaryFaded : theme.background,
                        }}
                        onPress={() => setActiveTab(key)}
                      >
                        <View style={{ alignItems: "center" }}>
                          <Icon
                            name={bankDetails[key].icon}
                            size={24}
                            color={activeTab === key ? theme.primary : theme.textFaded}
                          />
                          <Text
                            style={{
                              textAlign: "center",
                              fontWeight: "600",
                              marginTop: 4,
                              color: activeTab === key ? theme.primary : theme.textLight,
                            }}
                          >
                            {bankDetails[key].bankName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Transfer Details */}
                  <View
                    style={{
                      backgroundColor: theme.primaryFaded,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 24,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary, marginBottom: 16 }}>
                      Transfer Details
                    </Text>

                    <View style={{ gap: 12 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: theme.textLight, fontWeight: "500" }}>Amount:</Text>
                        <Text style={{ color: theme.secondary, fontWeight: "700" }}>₦{formatAmount(amount)}</Text>
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: theme.textLight, fontWeight: "500" }}>Bank Name:</Text>
                        <Text style={{ color: theme.secondary, fontWeight: "600" }}>
                          {bankDetails[activeTab].bankName}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: theme.textLight, fontWeight: "500" }}>Account Number:</Text>
                        <Text style={{ color: theme.secondary, fontWeight: "600" }}>
                          {bankDetails[activeTab].accountNumber}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: theme.textLight, fontWeight: "500" }}>Account Name:</Text>
                        <Text style={{ color: theme.secondary, fontWeight: "600" }}>
                          {bankDetails[activeTab].accountName}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: `${theme.warning}20`,
                        borderRadius: 8,
                        padding: 5,
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ color: theme.warning, fontWeight: "600", textAlign: "center" }}>
                        ⚠️ Transfer the exact amount above!
                      </Text>
                    </View>
                     {/* Confirmation Button */}
                  <Button
                    text="I've Sent the Money"
                    icon="check-circle"
                    onPress={handleTransferConfirmation}
                    loading={loading}
                    disabled={loading}
                    fullWidth={true}
                    variant="success"
                  />
                  </View>

                 
                </>
              ) : (
                <>
                  {/* Paystack Payment Section */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <TouchableOpacity onPress={() => setPaymentStep("")}>
                      <Icon name="arrow-back" size={24} color={theme.textFaded} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: theme.secondary }}>Card Payment</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color={theme.textFaded} />
                    </TouchableOpacity>
                  </View>
                  <PaywithPaystack amount={amount} email={email} onClose={closeModal} />
                </>
              )}
            </ScrollView>

            {/* Cancel Button */}
            <Button text="Cancel" variant="outline" onPress={closeModal} fullWidth={true} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default FundWalletTypes
