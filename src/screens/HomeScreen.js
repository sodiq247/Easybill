import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import vasServices from "../services/vasServices";
import FundWalletTypes from "../components/FundWalletTypes";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import accountServices from "../services/auth.services";

const HomeScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigation = useNavigation();

  

  const fetchTransactions = async () => {
    try {
      const response = await vasServices.getTransaction();
      if (response.status === 1) {
        setTransactions(response.data.slice(0, 10));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = async () => {
    setRefreshing(true);
    await fetchWalletDetails();
    await fetchTransactions();
    setRefreshing(false);
  };
  
  // Reusable function to fetch wallet details
  const fetchWalletDetails = async () => {
    try {
      const walletResult = await accountServices.walletBalance();
      // console.log("Wallet Result:", walletResult);
      const walletDetails = {
        balance: walletResult.Wallet?.amount || 0,
        name: walletResult.Profile?.firstname || "",
        lastName: walletResult.Profile?.lastname || "",
      };
      setWallet(walletDetails); // Set the fetched wallet details
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };
  useEffect(() => {
    loadData();
    // Fetch wallet balance whenever the page is reloaded
    fetchWalletDetails();
  }, []);
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 h-screen bg-red-100 mt-[40px]">
      {/* Sidebar */}
      {/* <StatusBar translucent/> */}
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} logout={handleLogout} />

      {/* Header */}
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={loadData} logout={handleLogout} />

      <View className="p-6">
        <Text className=" text-2xl font-semibold text-center">
          Hi, {wallet.name} {wallet.lastName}
        </Text>
        <Text className=" text-lg text-center mb-4">
          Balance: ₦{wallet.balance}
        </Text>

        <FundWalletTypes />

        {/* Transactions List with Pull-to-Refresh */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="p-4 bg-[#1F233B] rounded-lg mb-2">
              <Text className=" font-bold">
                {item.transaction_ref} - ₦{item.amount}
              </Text>
              <Text className="text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text className={`font-bold ${item.status === 1 ? "text-green-400" : "text-red-400"}`}>
                {item.status === 1 ? "Success" : "Failed"}
              </Text>
            </View>
          )}
          ListHeaderComponent={
            <Text className="text-lg font-bold  mb-2">Recent Transactions</Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
