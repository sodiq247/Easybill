"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import FundWalletTypes from "../components/FundWalletTypes";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "react-native-vector-icons/MaterialIcons";
import accountServices from "../services/auth.services";
import vasServices from "../services/vasServices";

const HomeScreen = () => {
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const navigation = useNavigation();
  const [isPaymentListExpanded, setIsPaymentListExpanded] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance();
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastName: walletResult.Profile?.lastname || "",
      };
      setWallet(walletDetails);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

   const fetchTransactions = async () => {
    try {
      const response = await vasServices.getTransaction()
      const transactionData = response.data.data || []

      // Sort transactions by date (newest first)
      const sortedTransactions = transactionData.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })

      setTransactions(sortedTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  useEffect(() => {
    fetchWalletDetails();
    fetchTransactions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchWalletDetails(), fetchTransactions()]).finally(() => {
      setRefreshing(false);
    });
  }, []);

  const mainServices = [
    {
      name: "Airtime",
      icon: "phone",
      description: "Purchase airtime easily.",
      iconColor: "#FF6B6B",
    },
    {
      name: "Data",
      icon: "wifi",
      description: "Buy affordable data plans.",
      iconColor: "#4ECDC4",
    },
    {
      name: "Electricity",
      icon: "flash-on",
      description: "Pay electricity bills.",
      iconColor: "#45B7D1",
    },
  ];

  const additionalServices = [
    {
      name: "TV",
      icon: "tv",
      description: "Pay for TV subscriptions.",
      iconColor: "#9B59B6",
    },
    {
      name: "JAMB",
      icon: "school",
      description: "Purchase JAMB pins.",
      iconColor: "#F39C12",
    },
    {
      name: "WAEC",
      icon: "assignment",
      description: "Buy WAEC scratch cards.",
      iconColor: "#E74C3C",
    },
    {
      name: "Fund Wallet",
      icon: "account-balance-wallet",
      description: "Fund Your Wallet",
      iconColor: "#4ECDC4",
    },
  ];

  const getTransactionIcon = (description) => {
    if (description?.toLowerCase().includes("data")) return "wifi";
    if (description?.toLowerCase().includes("airtime")) return "phone";
    if (description?.toLowerCase().includes("electricity")) return "flash-on";
    if (description?.toLowerCase().includes("dstv")) return "tv";
    if (description?.toLowerCase().includes("jamb")) return "school";
    if (description?.toLowerCase().includes("waec")) return "assignment";
    if (description?.toLowerCase().includes("wallet"))
      return "account-balance-wallet";
    return "receipt";
  };

  const getTransactionIconColor = (description) => {
    if (description?.toLowerCase().includes("data")) return "#4ECDC4";
    if (description?.toLowerCase().includes("airtime")) return "#FF6B6B";
    if (description?.toLowerCase().includes("electricity")) return "#45B7D1";
    if (description?.toLowerCase().includes("dstv")) return "#9B59B6";
    if (description?.toLowerCase().includes("jamb")) return "#F39C12";
    if (description?.toLowerCase().includes("waec")) return "#E74C3C";
    if (description?.toLowerCase().includes("wallet")) return "#27AE60";
    return "#95A5A6";
  };

  const formatAmount = (amount) => {
    const numAmount = Number.parseFloat(amount) || 0;
    return numAmount >= 0
      ? `+₦${numAmount.toLocaleString()}`
      : `-₦${Math.abs(numAmount).toLocaleString()}`;
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTransactionItem = (item, index) => (
      <View key={index} className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-1.5">
        <View
          className="w-8 h-8 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: `${getTransactionIconColor(item.description)}20` }}
        >
          <Icon name={getTransactionIcon(item.description)} size={24} color={getTransactionIconColor(item.description)} />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-gray-900 mb-1">{item.description || "Transaction"}</Text>
          {/* <Text className="text-sm text-gray-500">Transaction ID: {item.transaction_ref || "N/A"}</Text> */}
        <Text className="text-xs text-gray-400">
          {formatDateTime(item.createdAt)}
        </Text>
        </View>
        <Text
          className={`text-base font-bold ${Number.parseFloat(item.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {formatAmount(item.amount)}
        </Text>
      </View>
    )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Fixed Content */}
      <View className="flex-1 px-4">
        {/* Balance Card */}
        <View className="bg-gray-900 rounded-3xl p-6 mb-6 mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-sm mb-1">Your Balance</Text>
              <Text className="text-white text-2xl font-bold">
                ₦{wallet.balance.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowFundWalletModal(true)}>
              <View className="bg-white rounded-2xl p-3">
                <Icon name="account-balance-wallet" size={24} color="#1F2937" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment List */}
        <View className="mb-2">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Payment List
          </Text>
          <View className="flex-row flex-wrap">
            {/* Main Services */}
            {mainServices.map((service, index) => (
              <TouchableOpacity
                key={index}
                className="w-1/4 items-center mb-4"
                onPress={() => {
                  if (service.name === "Fund Wallet") {
                    setShowFundWalletModal(true); // Open the modal for Fund Wallet
                  } else {
                    navigation.navigate(service.name); // Navigate to other services
                  }
                }}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: `${service.iconColor}20` }}
                >
                  <Icon
                    name={service.icon}
                    size={28}
                    color={service.iconColor}
                  />
                </View>
                <Text className="text-sm font-medium text-gray-700">
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}

            {/* More/Collapse Button */}
            <TouchableOpacity
              className="w-1/4 items-center mb-4"
              onPress={() => setIsPaymentListExpanded(!isPaymentListExpanded)}
            >
              <View
                className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
                  isPaymentListExpanded ? "bg-pink-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  name={isPaymentListExpanded ? "close" : "apps"}
                  size={28}
                  color={isPaymentListExpanded ? "#EC4899" : "#64748B"}
                />
              </View>
              <Text
                className={`text-sm font-medium ${
                  isPaymentListExpanded ? "text-pink-500" : "text-gray-700"
                }`}
              >
                {isPaymentListExpanded ? "Collapse" : "More"}
              </Text>
            </TouchableOpacity>

            {/* Additional Services (shown when expanded) */}
            {isPaymentListExpanded && (
              <>
                {additionalServices.map((service, index) => (
                  <TouchableOpacity
                    key={index}
                    className="w-1/4 items-center mb-4"
                    onPress={() => {
                      if (service.name === "Fund Wallet") {
                        setShowFundWalletModal(true); // Open the modal for Fund Wallet
                      } else {
                        navigation.navigate(service.name); // Navigate to other services
                      }
                    }}
                  >
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${service.iconColor}20` }}
                    >
                      <Icon
                        name={service.icon}
                        size={28}
                        color={service.iconColor}
                      />
                    </View>
                    <Text className="text-sm font-medium text-gray-700">
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>

        {/* Promotions Section */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Promotions</Text>
            <TouchableOpacity>
              <Text className="text-pink-500 font-medium">See all</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-gray-100 rounded-2xl h-32 items-center justify-center">
            <Text className="text-gray-500">No promotions available</Text>
          </View>
        </View>

        {/* Transactions Section - Only this part is scrollable */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("History")}
            >
              <Text className="text-pink-500 font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Transaction List */}
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {transactions.length > 0 ? (
              <View>
                {transactions
                  .slice(0, 5)
                  .map((item, index) => renderTransactionItem(item, index))}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-6 items-center">
                <Icon name="receipt-long" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">No transactions yet</Text>
              </View>
            )}
            {/* Add padding at the bottom to ensure content is visible above footer */}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>

      {/* Fund Wallet Modal */}
      <Modal
        visible={showFundWalletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFundWalletModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl p-6 w-4/5 max-w-sm">
            <FundWalletTypes />
            <TouchableOpacity
              className="bg-gray-200 rounded-2xl py-4 mt-4"
              onPress={() => setShowFundWalletModal(false)}
            >
              <Text className="text-gray-700 font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={fetchWalletDetails}
        logout={async () => {
          await AsyncStorage.clear();
          navigation.replace("LoginScreen");
        }}
      />
      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;
