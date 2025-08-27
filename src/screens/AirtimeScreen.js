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

const AirtimeScreen = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
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
  }

  const handlePurchase = async () => {
    if (!selectedNetwork || !amount || !mobileNumber) {
      Alert.alert("Error", "Please fill all fields.")
      return
    }
    if (Number.parseInt(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid positive amount.")
      return
    }
    setLoading(true)

    const data = {
      airtime_type: "VTU",
      amount: Number(amount),
      mobile_number: mobileNumber,
      network: selectedNetwork,
    }

    if (wallet.balance < Number(amount)) {
      Alert.alert("Error", "Insufficient balance.");
      setLoading(false);
      return;
    } else {
      try {
        const response = await vasServices.airTime(data)
        if (response && response.data.result && !response.data.result.error?.length) {
          Alert.alert("Success", "Transaction successful")
          setShowModal(false)
          // Reset form
          setSelectedNetwork("")
          setMobileNumber("")
          setAmount("")
          fetchWalletDetails()
        } else {
          const errorMessage = response?.data?.result?.error?.[0] || "Transaction unsuccessful"
          Alert.alert("Error", "Transaction failed, try again.")
          setShowModal(false)
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.")
      }
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear()
      navigation.replace("LoginScreen")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const networkOptions = [
    { label: "Select Network", value: "" },
    { label: "MTN", value: "1" },
    { label: "GLO", value: "2" },
    { label: "Airtel", value: "3" },
    { label: "9mobile", value: "4" },
  ]

  return (
    <SafeAreaView className="py-8" style={{ flex: 1, backgroundColor: theme.background }}>
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
          Buy Airtime
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
        </View>

        {/* Network Selection */}
        <Text style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.text,
            marginBottom: 6,
             marginLeft: 16,
            fontFamily: "Lufga",
          }}>
            Network
          </Text>
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
          }}
        >
          
          <Picker selectedValue={selectedNetwork} onValueChange={(itemValue) => setSelectedNetwork(itemValue)}>
            {networkOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        {/* Mobile Number Input */}
        <Input
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Enter mobile number"
          label="Mobile Number"
          keyboardType="numeric"
        />

        {/* Amount Input */}
        <Input
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="Enter amount"
          label="Amount"
          keyboardType="numeric"
        />

        {/* Buy Button */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          // <Button text="Buy Now" onPress={() => setShowModal(true)} fullWidth={true} />
           <Button
            text="Buy Now"
            onPress={() => {
              if (Number(amount) > 0 && wallet.balance < Number(amount)) {
                Alert.alert("Error", "Insufficient balance.");
              } else {
                setShowModal(true);
              }
            }}
            fullWidth={true}
          />
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
              <Text style={{ marginBottom: 8, color: theme.text }}>
                Network: {networkOptions.find((n) => n.value === selectedNetwork)?.label}
              </Text>
              <Text style={{ marginBottom: 8, color: theme.text }}>Mobile Number: {mobileNumber}</Text>
              <Text style={{ marginBottom: 24, color: theme.text }}>Amount: ₦{amount}</Text>

              <View style={{ gap: 12 }}>
                <Button text="Proceed" onPress={handlePurchase} loading={loading} fullWidth={true} />
                <Button text="Cancel" variant="outline" onPress={() => setShowModal(false)} fullWidth={true} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} logout={handleLogout} />
      {/* <Footer /> */}
    </SafeAreaView>
  )
}

export default AirtimeScreen
