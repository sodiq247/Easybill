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
import Button from "../components/ui/Button";

const HomeScreen = () => {
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
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
      const response = await vasServices.getTransaction();
      const transactionData = response.data.data || [];

      // Sort transactions by date (newest first)
      const sortedTransactions = transactionData.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

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

  // Function to toggle balance visibility
  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  // Function to format balance display
  const formatBalance = (balance) => {
    if (!balanceVisible) {
      return "****";
    }
    return `₦${balance.toLocaleString()}`;
  };

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
    // {
    //   name: "Fund Wallet",
    //   icon: "account-balance-wallet",
    //   description: "Fund Your Wallet",
    //   iconColor: "#FD7C0E",
    // },
  ];

  // Professional promotions data
  const promotions = [
    {
      id: 1,
      title: "Get 5% Cashback",
      subtitle: "On all data purchases",
      description:
        "Purchase any data bundle and get 5% cashback instantly credited to your wallet",
      bgColor: "bg-[#45B7D1]", // Blue shade
      icon: "wifi",
      iconColor: "#45B7D1",
      badge: "LIMITED TIME",
      badgeColor: "bg-yellow-400",
      offer: "5% BACK",
    },
    {
      id: 2,
      title: "Free Airtime Bonus",
      subtitle: "Buy ₦1000, Get ₦100 Free",
      description:
        "Purchase airtime worth ₦1000 or more and get ₦100 bonus airtime instantly",
      bgColor: "bg-[#34A853]", // Green shade replacing gradient
      icon: "phone",
      iconColor: "#34A853",
      badge: "HOT DEAL",
      badgeColor: "bg-red-500",
      offer: "₦100 FREE",
    },
    {
      id: 3,
      title: "Electricity Bill Discount",
      subtitle: "Save 3% on all payments",
      description:
        "Pay your electricity bills through vaaPay and save 3% on every transaction",
      bgColor: "bg-[#A55EEA]", // Purple shade replacing gradient
      icon: "flash-on",
      iconColor: "bg-[#A55EEA]",
      badge: "ONGOING",
      badgeColor: "bg-theme-primary",
      offer: "3% OFF",
    },
    {
      id: 4,
      title: "TV Subscription Rewards",
      subtitle: "Earn points on every payment",
      description:
        "Pay for DSTV, GOTV subscriptions and earn reward points for future discounts",
      bgColor: "bg-[#4B0082]", // Indigo shade replacing gradient
      icon: "tv",
      iconColor: "bg-[#4B0082]",
      badge: "NEW",
      badgeColor: "bg-green-500",
      offer: "EARN POINTS",
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
    if (description?.toLowerCase().includes("wallet")) return "#FD7C0E";
    return "#95A5A6";
  };

  const formatAmount = (amount) => {
    const numAmount = Number.parseFloat(amount) || 0;
    return numAmount >= 0
      ? `+₦${numAmount.toLocaleString()}`
      : `-₦${Math.abs(numAmount).toLocaleString()}`;
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
    <View
      key={index}
      className="flex-row items-center bg-theme-primaryFaded rounded-2xl px-4 py-3 mb-1.5"
    >
      <View
        className="w-8 h-6 rounded-2xl items-center justify-center mr-4"
        style={{
          backgroundColor: `${getTransactionIconColor(item.description)}20`,
        }}
      >
        <Icon
          name={getTransactionIcon(item.description)}
          size={24}
          color={getTransactionIconColor(item.description)}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-theme-secondary mb-1">
          {item.description || "Transaction"}
        </Text>
        <Text className="text-xs text-theme-textFaded">
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <Text
        className={`text-base font-bold ${
          Number.parseFloat(item.amount) >= 0
            ? "text-theme-success"
            : "text-theme-error"
        }`}
      >
        {formatAmount(item.amount)}
      </Text>
    </View>
  );

  const renderPromotionCard = (promotion, index) => (
    <TouchableOpacity key={promotion.id} className="mr-4 w-72">
      <View
        className={`${promotion.bgColor} rounded-2xl p-3 relative overflow-hidden`}
      >
        {/* Badge */}
        <View
          className={`${promotion.badgeColor} px-3 py-1 rounded-full self-start mb-3`}
        >
          <Text className="text-xs font-bold text-white">
            {promotion.badge}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-row items-start justify-between ">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-bold text-white mb-1">
              {/* {promotion.title} */}
              Coming soon...
            </Text>
            <Text className="text-base text-white opacity-90 mb-2">
              {/* {promotion.subtitle} */}
              Coming soon...
            </Text>
            <Text className="hidden text-sm text-white opacity-80 leading-5 mb-3">
              {/* {promotion.description} */}
              Coming soon...
            </Text>

            {/* Offer Highlight */}
            <View className="hidden bg-white bg-opacity-20 rounded-lg px-3 py-2 self-start">
              <Text className="text-white font-bold text-sm">
                {/* {promotion.offer} */}
                Coming soon...
              </Text>
            </View>
          </View>

          {/* Icon */}
          <View className="bg-white bg-opacity-20 rounded-2xl p-3 hidden">
            <Icon name={promotion.icon} size={28} color={promotion.iconColor} />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity className=" bg-white bg-opacity-20 rounded-xl py-2 px-4 mt-4 self-start">
          <Text className={`text-${promotion.bgColor}  font-semibold text-sm`}>
            Learn More
          </Text>
        </TouchableOpacity>

        {/* Decorative Elements */}
        <View className="absolute -right-4 -top-4 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
        <View className="hidden absolute -right-8 -bottom-8 w-24 h-24 bg-white bg-opacity-5 rounded-full" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 py-8 bg-theme-background">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8FF" />
        {/* App Header with Logo */}
        <View className="flex-row items-center justify-between px-4 py-1 bg-theme-background">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-[10px] bg-theme-primary items-center justify-center mr-0.5">
              <Text className="text-white text-2xl font-bold">V</Text>
            </View>
            <Text className="text-xl font-bold text-theme-secondary">
              aaPay
            </Text>
          </View>

          {/* Notification Icon */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileSettings")}
              className="items-center justify-center"
            >
              <Text className=" text-base text-theme-textLight my-1 text-right">
                Hi, {wallet.lastName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-theme-primaryFaded items-center justify-center">
              <Icon name="notifications-none" size={20} color="#FD7C0E" />
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("ProfileSettings")}
              className="w-10 h-10 rounded-full bg-theme-primaryFaded items-center justify-center"
            >
              <Icon name="person" size={20} color="#FD7C0E" />
            </TouchableOpacity> */}
          </View>
        </View>
        <View className="flex-1 px-4">
          {/* Balance Card */}
          <View className="bg-theme-secondary rounded-2xl px-6 py-4 mb-4 mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-2">
                  Wallet Balance
                </Text>
                <TouchableOpacity onPress={toggleBalanceVisibility}>
                  <Icon
                    name={balanceVisible ? "visibility" : "visibility-off"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text className="text-theme-primary text-sm font-semibold">
                  Transaction History
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-white text-2xl font-bold">
                {formatBalance(wallet.balance)}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFundWalletModal(true)}
                className="bg-theme-primary rounded-2xl px-5 py-2"
              >
                <Text className="text-white font-semibold text-sm">
                  + Add Money
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment List */}
          <View className="mb-2">
             {/* <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-theme-secondary">Services</Text>
              <TouchableOpacity>
                <Text className="text-theme-primary font-medium">See all</Text>
              </TouchableOpacity>
            </View> */}
            <View className="flex-row flex-wrap">
              {/* Main Services */}
              {mainServices.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  className="w-1/4 items-center mb-4"
                  onPress={() => {
                    if (service.name === "Fund Wallet") {
                      setShowFundWalletModal(true);
                    } else {
                      navigation.navigate(service.name);
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
                  <Text className="text-sm font-medium text-theme-textLight">
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
                    isPaymentListExpanded
                      ? "bg-theme-primaryFaded"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    name={isPaymentListExpanded ? "close" : "apps"}
                    size={28}
                    color={isPaymentListExpanded ? "#FD7C0E" : "#64748B"}
                  />
                </View>
                <Text
                  className={`text-sm font-medium ${
                    isPaymentListExpanded
                      ? "text-theme-primary"
                      : "text-theme-textLight"
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
                          setShowFundWalletModal(true);
                        } else {
                          navigation.navigate(service.name);
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
                      <Text className="text-sm font-medium text-theme-textLight">
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
            {/* <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-theme-secondary">Promotions</Text>
              <TouchableOpacity>
                <Text className="text-theme-primary font-medium">See all</Text>
              </TouchableOpacity>
            </View> */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2 "
            >
              {promotions.map((promotion, index) =>
                renderPromotionCard(promotion, index)
              )}
            </ScrollView>
          </View>

          {/* Transactions Section - Only this part is scrollable */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-lg font-bold text-theme-secondary">
                Recent Transactions
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text className="text-theme-primary font-medium">See all</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Transaction List */}
            <ScrollView
              className="flex-1"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#FD7C0E"]}
                  tintColor="#FD7C0E"
                />
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
                <View className="bg-theme-primaryFaded rounded-2xl p-6 items-center">
                  <Icon name="receipt-long" size={48} color="#FD7C0E" />
                  <Text className="text-theme-textLight mt-2">
                    No transactions yet
                  </Text>
                </View>
              )}
              {/* Add padding at the bottom to ensure content is visible above footer */}
              <View className="h-8" />
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
              <Button
                style={{ marginTop: 20 }}
                text="Cancel"
                variant="outline"
                onPress={() => setShowFundWalletModal(false)}
                fullWidth
              />
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
        {/* <Footer /> */}
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
