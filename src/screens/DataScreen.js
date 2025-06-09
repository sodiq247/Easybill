"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  RefreshControl,
  Share,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useForm, Controller } from "react-hook-form"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import accountServices from "../services/auth.services"
import vasServices from "../services/vasServices"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"

const DataScreen = () => {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      network: "",
      plan: "",
      mobile_number: "",
    },
  })

  const [refreshing, setRefreshing] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [selectedPlanName, setSelectedPlanName] = useState("")
  const [dataplan, setDataPlan] = useState([])
  const [filteredPlans, setFilteredPlans] = useState([])
  const [amountToPay, setAmountToPay] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [message, setMessage] = useState("")
  const [transactionDetails, setTransactionDetails] = useState({
    planTitle: "",
    mobile_number: "",
    amount: 0,
    status: "",
  })
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
        lastname: walletResult.Profile?.lastname || "",
      }
      setWallet(walletDetails)
    } catch (error) {
      console.error("Error fetching wallet details:", error)
      setMessage("Failed to load wallet details. Please try again.")
    }
  }

  const fetchDataPlan = async (network) => {
    try {
      setLoading(true)
      const data = { serviceID: network }
      const response = await vasServices.allDataPlans(data)

      if (!response.variations || !Array.isArray(response.variations)) {
        throw new Error("Invalid data format received from API")
      }

      setDataPlan(response.variations)
      setFilteredPlans(response.variations)
    } catch (error) {
      console.error("Error fetching data plans:", error)
      setMessage("Failed to load data plans. Please try again.")
      Alert.alert("Error", "Failed to load data plans. Please try again.")
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

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchWalletDetails().finally(() => setRefreshing(false))
  }, [])

  const handleNetworkChange = (networkValue) => {
    setSelectedNetwork(networkValue)
    setValue("network", networkValue)
    setSelectedPlanId("")
    setValue("plan", "")
    setAmountToPay(0)

    if (networkValue) {
      fetchDataPlan(networkValue)
    } else {
      setFilteredPlans([])
    }
  }

  const handlePlanChange = (variationCode) => {
    setSelectedPlanId(variationCode)
    setValue("plan", variationCode)

    const selectedPlan = filteredPlans.find((plan) => plan.variation_code === variationCode)

    if (selectedPlan) {
      setSelectedPlanName(selectedPlan.name)
      const calculatedAmount = Math.ceil(Number.parseFloat(selectedPlan.variation_amount))
      setAmountToPay(calculatedAmount)
    } else {
      setSelectedPlanName("")
      setAmountToPay(0)
    }
  }

  const onSubmit = (data) => {
    if (!selectedNetwork || !selectedPlanId || !data.mobile_number) {
      Alert.alert("Error", "Please fill all fields.")
      return
    }

    if (wallet.balance < amountToPay) {
      setMessage("Insufficient balance")
      Alert.alert("Error", "Insufficient balance.")
      return
    }

    setTransactionDetails({
      planTitle: selectedPlanName,
      mobile_number: data.mobile_number,
      amount: amountToPay,
      status: "",
    })

    setShowModal(true)
  }

  const handlePurchase = async () => {
    setLoading(true)
    setShowModal(false)

    const now = new Date()
    const request_id =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")

    const data = {
      request_id,
      serviceID: selectedNetwork,
      billersCode: watch("mobile_number"),
      variation_code: selectedPlanId,
      name: selectedPlanName,
      phone: watch("mobile_number"),
      amount: amountToPay,
    }

    try {
      const response = await vasServices.dataBundle(data)

      if (response === "TRANSACTION SUCCESSFUL") {
        setMessage("Transaction successful")
        await fetchWalletDetails()
        setTransactionDetails({
          ...transactionDetails,
          status: "Success",
        })
      } else {
        setMessage("Transaction failed, Try again.")
        setTransactionDetails({
          ...transactionDetails,
          status: "Failed",
        })
      }

      setShowReceiptModal(true)
    } catch (error) {
      console.error("Error occurred during transaction:", error)
      setMessage("Transaction failed, Try again.")
      Alert.alert("Error", "Transaction failed. Please try again.")
      setTransactionDetails({
        ...transactionDetails,
        status: "Failed",
      })
      setShowReceiptModal(true)
    } finally {
      setLoading(false)
    }
  }

  const shareReceipt = async () => {
    try {
      const message = `
Transaction Receipt
-------------------
Plan: ${transactionDetails.planTitle}
Phone Number: ${transactionDetails.mobile_number}
Amount: ₦${transactionDetails.amount}
Status: ${transactionDetails.status}
Date: ${new Date().toLocaleString()}
      `

      await Share.share({
        message,
        title: "Data Purchase Receipt",
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share receipt")
    }
  }

  const networkOptions = [
    { label: "Select Network", value: "" },
    { label: "MTN", value: "mtn-data" },
    { label: "GLO", value: "glo-data" },
    { label: "Airtel", value: "airtel-data" },
    { label: "9mobile", value: "etisalat-data" },
    { label: "Smile", value: "smile-direct" },
    { label: "Spectranet", value: "spectranet" },
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
          Buy Data
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

        {/* Message Display */}
        {message ? (
          <View
            style={{
              backgroundColor: message.includes("successful") ? theme.primaryFaded : "#FEE2E2",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: message.includes("successful") ? theme.success : theme.error,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {message}
            </Text>
          </View>
        ) : null}

        {/* Network Selection */}
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
            Network
          </Text>
          <Controller
            control={control}
            name="network"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  onChange(itemValue)
                  handleNetworkChange(itemValue)
                }}
              >
                {networkOptions.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            )}
          />
        </View>

        {/* Plan Selection */}
        {selectedNetwork && (
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
              Plan
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ margin: 16 }} />
            ) : (
              <Controller
                control={control}
                name="plan"
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => {
                      onChange(itemValue)
                      handlePlanChange(itemValue)
                    }}
                  >
                    <Picker.Item label="Select Plan" value="" />
                    {filteredPlans
                      .sort((a, b) => Number.parseFloat(a.variation_amount) - Number.parseFloat(b.variation_amount))
                      .map((plan) => (
                        <Picker.Item
                          key={plan.variation_code}
                          value={plan.variation_code}
                          label={`${plan.name} - ₦${plan.variation_amount}`}
                        />
                      ))}
                  </Picker>
                )}
              />
            )}
          </View>
        )}

        {/* Phone Number Input */}
        <Controller
          control={control}
          name="mobile_number"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Enter mobile number"
              label="Phone Number"
              keyboardType="numeric"
            />
          )}
        />

        {/* Amount Display */}
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
          <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text, marginBottom: 8 }}>Amount to Pay</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary, textAlign: "center" }}>
            ₦{amountToPay.toLocaleString() || "0.00"}
          </Text>
        </View>

        {/* Buy Button */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          <Button text="Buy Now" onPress={handleSubmit(onSubmit)} fullWidth={true} />
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
              <Text style={{ marginBottom: 16, color: theme.text }}>
                You're about to buy {transactionDetails.planTitle} - ₦{amountToPay} to{" "}
                {transactionDetails.mobile_number}
              </Text>

              <View style={{ gap: 12 }}>
                <Button text="Proceed" onPress={handlePurchase} loading={loading} fullWidth={true} />
                <Button text="Cancel" variant="outline" onPress={() => setShowModal(false)} fullWidth={true} />
              </View>
            </View>
          </View>
        </Modal>

        {/* Receipt Modal */}
        <Modal
          transparent
          visible={showReceiptModal}
          animationType="slide"
          onRequestClose={() => setShowReceiptModal(false)}
        >
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
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 16,
                  textAlign: "center",
                  color: theme.secondary,
                }}
              >
                Transaction Receipt
              </Text>

              <View style={{ gap: 12, marginBottom: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Plan:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>{transactionDetails.planTitle}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Phone Number:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>{transactionDetails.mobile_number}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Amount:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>₦{transactionDetails.amount}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Status:</Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: transactionDetails.status === "Success" ? theme.success : theme.error,
                    }}
                  >
                    {transactionDetails.status}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.textLight }}>Date:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>{new Date().toLocaleString()}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button text="Share" onPress={shareReceipt} variant="outline" fullWidth={true} />
                <Button
                  text="Close"
                  onPress={() => {
                    setShowReceiptModal(false)
                    setMessage("")
                    // Reset form
                    setValue("network", "")
                    setValue("plan", "")
                    setValue("mobile_number", "")
                    setSelectedNetwork("")
                    setSelectedPlanId("")
                    setSelectedPlanName("")
                    setAmountToPay(0)
                    setFilteredPlans([])
                  }}
                  fullWidth={true}
                />
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

export default DataScreen
