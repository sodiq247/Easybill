import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import vasServices from "../services/vasServices";
import FundWalletTypes from "../components/FundWalletTypes";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const HomeScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigation = useNavigation();

  const fetchWalletDetails = async () => {
    try {
      const storedWallet = await AsyncStorage.getItem("walletDetails");
      if (storedWallet) {
        setWallet(JSON.parse(storedWallet));
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

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

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} toggleSidebar={() => setSidebarVisible(false)} />

      {/* Header */}
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={loadData} logout={handleLogout} />

      <View className="p-6">
        <Text className=" text-2xl font-semibold text-center">
           {wallet.name} {wallet.lastname}
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
    </View>
  );
};

export default HomeScreen;
