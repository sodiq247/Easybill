"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
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
import CustomButton from "../components/CustomButton"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import accountServices from "../services/auth.services"
import vasServices from "../services/vasServices"

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
  const [dataplan, setDataPlan] = useState([]) // Initialize as an array
  const [filteredPlans, setFilteredPlans] = useState([]) // Store filtered plans
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
    // Fetch wallet balance whenever the page is reloaded
    fetchWalletDetails()
  }, [])

  // Reusable function to fetch wallet details
  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance()
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastname: walletResult.Profile?.lastname || "",
      }
      setWallet(walletDetails) // Set the fetched wallet details
    } catch (error) {
      console.error("Error fetching wallet details:", error)
      setMessage("Failed to load wallet details. Please try again.")
    }
  }

  const fetchDataPlan = async (network) => {
    try {
      setLoading(true)
      const data = { serviceID: network } // Request payload
      const response = await vasServices.allDataPlans(data) // API call
      // console.log("Data Plan Response:", response);
      // console.log("Data Plan Response:", response.variations);

      // Validate response
      if (!response.variations || !Array.isArray(response.variations)) {
        throw new Error("Invalid data format received from API")
      }

      // Set state with the API data
      setDataPlan(response.variations) // Update state with full data
      setFilteredPlans(response.variations) // Update filtered data state
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

    // Find the selected plan from filteredPlans
    const selectedPlan = filteredPlans.find((plan) => plan.variation_code === variationCode)

    if (selectedPlan) {
      // Set the plan name to selectedPlanName
      setSelectedPlanName(selectedPlan.name)
      // Set the calculated amount
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

    // Set transaction details for confirmation modal
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

    // Generate request_id in format YYYYMMDDHHmmss
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

      // Show receipt modal
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

  return (
    <SafeAreaView className="flex-1 h-screen bg-gray-100">
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} logout={handleLogout} />
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} logout={handleLogout} />

      <ScrollView
        className="p-6 bg-gray-100 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-2xl font-bold text-center text-[#1F233B] mb-4">Buy Data</Text>
        <Text className="text-lg text-center text-gray-600 mb-2">Balance: ₦{wallet.balance}</Text>
        <Text className="text-lg text-center text-gray-600 mb-6">
          Welcome, {wallet.name} {wallet.lastname}
        </Text>

        {message ? (
          <View className="p-4 mb-4 bg-orange-200 rounded-lg">
            <Text className="text-white text-center">{message}</Text>
          </View>
        ) : null}

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Text className="mb-2 text-gray-700">Network</Text>
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
                <Picker.Item label="Select Network" value="" />
                <Picker.Item label="MTN" value="mtn-data" />
                <Picker.Item label="GLO" value="glo-data" />
                <Picker.Item label="Airtel" value="airtel-data" />
                <Picker.Item label="9mobile" value="etisalat-data" />
                <Picker.Item label="Smile" value="smile-direct" />
                <Picker.Item label="Spectranet" value="spectranet" />
              </Picker>
            )}
          />
        </View>

        {selectedNetwork && (
          <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
            <Text className="mb-2 text-gray-700">Plan</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#1F233B" />
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

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Text className="mb-2 text-gray-700">Phone Number</Text>
          <Controller
            control={control}
            name="mobile_number"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Enter Mobile Number"
                keyboardType="numeric"
                className="p-2 border-b border-gray-300"
              />
            )}
          />
        </View>

        <View className="p-4 mb-4 border border-gray-300 rounded-lg bg-white shadow-md">
          <Text className="mb-2 text-gray-700">Amount to Pay</Text>
          <Text className="text-center font-semibold text-lg">₦{amountToPay || "0.00"}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1F233B" />
        ) : (
          <CustomButton title="Buy Now" onPress={handleSubmit(onSubmit)} style="bg-[#1F233B]" />
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
            <View className="w-80 p-6 bg-white rounded-lg shadow-lg">
              <Text className="text-lg font-bold mb-4">Transaction Details</Text>
              <Text>
                You're about to buy {transactionDetails.planTitle} - ₦{amountToPay} to{" "}
                {transactionDetails.mobile_number}
              </Text>
              <TouchableOpacity
                className="mt-4 px-4 py-2 bg-[#1F233B] rounded-lg"
                onPress={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-center ml-2">Processing...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center">Proceed</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity className="mt-4 px-4 py-2 bg-gray-300 rounded-lg" onPress={() => setShowModal(false)}>
                <Text className="text-black text-center">Cancel</Text>
              </TouchableOpacity>
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
            <View className="w-80 p-6 bg-white rounded-lg shadow-lg">
              <Text className="text-lg font-bold mb-4 text-center">Transaction Receipt</Text>
              <View className="border-b border-gray-300 pb-2 mb-2">
                <Text className="text-gray-700">Plan:</Text>
                <Text className="font-semibold">{transactionDetails.planTitle}</Text>
              </View>
              <View className="border-b border-gray-300 pb-2 mb-2">
                <Text className="text-gray-700">Phone Number:</Text>
                <Text className="font-semibold">{transactionDetails.mobile_number}</Text>
              </View>
              <View className="border-b border-gray-300 pb-2 mb-2">
                <Text className="text-gray-700">Amount:</Text>
                <Text className="font-semibold">₦{transactionDetails.amount}</Text>
              </View>
              <View className="border-b border-gray-300 pb-2 mb-2">
                <Text className="text-gray-700">Status:</Text>
                <Text
                  className={`font-semibold ${transactionDetails.status === "Success" ? "text-green-600" : "text-red-600"}`}
                >
                  {transactionDetails.status}
                </Text>
              </View>
              <View className="border-b border-gray-300 pb-2 mb-2">
                <Text className="text-gray-700">Date:</Text>
                <Text className="font-semibold">{new Date().toLocaleString()}</Text>
              </View>

              <View className="flex-row justify-between mt-4">
                <TouchableOpacity className="px-4 py-2 bg-[#1F233B] rounded-lg flex-1 mr-2" onPress={shareReceipt}>
                  <Text className="text-white text-center">Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 bg-gray-300 rounded-lg flex-1 ml-2"
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
                >
                  <Text className="text-black text-center">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  )
}

export default DataScreen
