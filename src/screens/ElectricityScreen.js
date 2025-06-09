"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, Alert, ScrollView, ActivityIndicator, SafeAreaView, Modal, RefreshControl } from "react-native"
import { Picker } from "@react-native-picker/picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import vasServices from "../services/vasServices"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import accountServices from "../services/auth.services"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"

const ElectricityScreen = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [selectedDisco, setSelectedDisco] = useState("")
  const [meterNumber, setMeterNumber] = useState("")
  const [meterType, setMeterType] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState({})
  const [amountToPay, setAmountToPay] = useState(0)
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" })
  const navigation = useNavigation()

  useEffect(() => {
    fetchWalletDetails()
  }, [])

  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance()
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastName: walletResult.Profile?.lastname || "",
      }
      setWallet(walletDetails)
    } catch (error) {
      console.error("Error fetching wallet details:", error)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchWalletDetails().finally(() => setRefreshing(false))
  }, [])

  const handleAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, "")
    setAmount(sanitizedValue)
    const numericAmount = Number.parseFloat(sanitizedValue) || 0
    setAmountToPay(numericAmount + 100) // Add ₦100 service fee
  }

  const validateMeter = async () => {
    if (!selectedDisco || !meterNumber || !meterType || !amount) {
      Alert.alert("Error", "Please fill all fields.")
      return
    }
    setLoading(true)
    const data = {
      disco_name: selectedDisco,
      meter_number: meterNumber,
      MeterType: meterType,
      amount: Number(amount),
    }

    try {
      const response = await vasServices.validateMeter(data)
      if (response && !response.error) {
        setTransactionDetails({
          ...data,
          name: response.data.name,
          address: response.data.address,
        })
        setShowModal(true)
      } else {
        Alert.alert("Validation Failed", response?.message || "Error validating meter")
      }
    } catch (error) {
      console.error("Error validating meter:", error)
      Alert.alert("Error", "Validation failed.")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    setLoading(true)

    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.")
      setLoading(false)
      return
    }

    try {
      const response = await vasServices.electric(transactionDetails)
      if (response && !response.data.error) {
        Alert.alert("Success", "Transaction successful", [
          {
            text: "OK",
            onPress: () => {
              setShowModal(false)
              // Reset form
              setSelectedDisco("")
              setMeterNumber("")
              setMeterType("")
              setAmount("")
              setAmountToPay(0)
              fetchWalletDetails()
            },
          },
        ])
      } else {
        Alert.alert("Error", "Transaction unsuccessful")
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      Alert.alert("Error", "Transaction failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear()
      navigation.replace("LoginScreen")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const discoOptions = [
    { label: "Select Disco", value: "" },
    { label: "Ikeja Electric", value: "18" },
    { label: "Eko Electric", value: "20" },
    { label: "Abuja Electric", value: "25" },
    { label: "Kano Electric", value: "23" },
    { label: "Enugu Electric", value: "26" },
    { label: "Port Harcourt Electric", value: "21" },
    { label: "Ibadan Electric", value: "19" },
    { label: "Kaduna Electric", value: "22" },
    { label: "Jos Electric", value: "24" },
    { label: "Yola Electric", value: "28" },
    { label: "Benin Electric", value: "29" },
  ]

  const meterTypeOptions = [
    { label: "Select Meter Type", value: "" },
    { label: "Prepaid", value: "Prepaid" },
    { label: "Postpaid", value: "Postpaid" },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} logout={handleLogout} />

      <ScrollView
        style={{ flex: 1, padding: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            color: theme.secondary,
            marginBottom: 16,
          }}
        >
          Buy Electricity
        </Text>

        {/* Wallet Info */}
        <View
          style={{
            backgroundColor: theme.primaryFaded,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 18, textAlign: "center", color: theme.textLight, marginBottom: 4 }}>
            Balance: ₦{wallet.balance.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 16, textAlign: "center", color: theme.textLight }}>
            Welcome, {wallet.name} {wallet.lastname}
          </Text>
        </View>

        {/* Disco Selection */}
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text, margin: 16, marginBottom: 8 }}>
            Select Disco
          </Text>
          <Picker selectedValue={selectedDisco} onValueChange={(itemValue) => setSelectedDisco(itemValue)}>
            {discoOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        {/* Meter Number Input */}
        <Input
          value={meterNumber}
          onChangeText={setMeterNumber}
          placeholder="Enter meter number"
          label="Meter Number"
          keyboardType="numeric"
        />

        {/* Meter Type Selection */}
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text, margin: 16, marginBottom: 8 }}>
            Meter Type
          </Text>
          <Picker selectedValue={meterType} onValueChange={(itemValue) => setMeterType(itemValue)}>
            {meterTypeOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        {/* Amount Input */}
        <Input
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="Enter amount"
          label="Amount"
          keyboardType="numeric"
        />

        {/* Amount to Pay Display */}
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text, marginBottom: 8 }}>
            Amount to Pay (including ₦100 service fee)
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary, textAlign: "center" }}>
            ₦{amountToPay.toLocaleString() || "0.00"}
          </Text>
        </View>

        {/* Validate Button */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          <Button text="Validate Meter" onPress={validateMeter} fullWidth={true} />
        )}

        {/* Confirmation Modal */}
        <Modal transparent visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.white,
                borderRadius: 16,
                padding: 24,
                width: "85%",
                maxWidth: 400,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 16, color: theme.secondary }}>
                Transaction Details
              </Text>

              <View style={{ gap: 8, marginBottom: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Name:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text, flex: 1, textAlign: "right" }}>
                    {transactionDetails.name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Address:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text, flex: 1, textAlign: "right" }}>
                    {transactionDetails.address}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Meter Number:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>{meterNumber}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Amount:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>₦{amountToPay.toLocaleString()}</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <Button text="Proceed" onPress={handlePurchase} loading={loading} fullWidth={true} />
                <Button text="Cancel" variant="outline" onPress={() => setShowModal(false)} fullWidth={true} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} logout={handleLogout} />
      <Footer />
    </SafeAreaView>
  )
}

export default ElectricityScreen
