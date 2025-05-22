import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import FundWalletTypes from "../components/FundWalletTypes";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Icon from "react-native-vector-icons/MaterialIcons";
import accountServices from "../services/auth.services";
import Footer from "../components/Footer";

const HomeScreen = () => {
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const navigation = useNavigation();

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

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails();
    setRefreshing(false);
  }, []);

  const services = [
    {
      name: "Data",
      icon: "storage",
      description: "Buy affordable data plans.",
    },
    { name: "Airtime", icon: "phone", description: "Purchase airtime easily." },
    {
      name: "CableTv",
      icon: "tv",
      description: "Renew your Cable TV subscription.",
    },
    {
      name: "Electricity",
      icon: "flash-on",
      description: "Pay electricity bills.",
    },
    {
      name: "History",
      icon: "history",
      description: "View your transaction logs.",
    },
    {
      name: "Fund Wallet",
      icon: "account-balance-wallet",
      description: "Add money to your wallet.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(false)}
        logout={async () => {
          await AsyncStorage.clear();
          navigation.replace("LoginScreen");
        }}
      />

      {/* Header */}
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={fetchWalletDetails}
        logout={async () => {
          await AsyncStorage.clear();
          navigation.replace("LoginScreen");
        }}
      />

      {/* Main Content */}
      <ScrollView
        className="p-4 bg-gray-100 flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Overview */}
        <View className="bg-[#1F233B] rounded-xl p-6 mb-6 shadow-md">
          <Text className="text-xl font-bold text-white">
            Hi, {wallet.name} {wallet.lastName}
          </Text>
          <Text className="text-lg text-white mt-2">
            Balance: ₦{wallet.balance.toLocaleString()}
          </Text>
        </View>

        {/* Service Cards */}
        <View className="flex flex-wrap flex-row justify-between">
          {services.map((service) => (
            <TouchableOpacity
              key={service.name}
              className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-lg"
              onPress={() => {
                if (service.name === "Fund Wallet") {
                  setShowFundWalletModal(true); // Open the modal for Fund Wallet
                } else {
                  navigation.navigate(service.name); // Navigate to other services
                }
              }}
            >
              <View className="flex flex-row gap-1">
                <Icon
                  name={service.icon}
                  size={28}
                  color="#1F233B"
                  className="mb-2"
                />
                <Text className="text-lg font-bold text-gray-800">
                  {service.name}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 mt-1">
                {service.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Fund Wallet Modal */}
      <Modal
        visible={showFundWalletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFundWalletModal(false)}
      >
        {/* Transparent Background */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Modal Content */}
          <View className="bg-white rounded-xl p-6 w-4/5 shadow-lg">
            <FundWalletTypes />
            <TouchableOpacity
              className="bg-gray-300 rounded-lg py-2 w-[90%] mx-[5%] mt-0"
              onPress={() => setShowFundWalletModal(false)}
            >
              <Text className="text-black font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Footer />
    </SafeAreaView>
  );
};

export default HomeScreen;
