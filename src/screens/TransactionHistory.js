import React, { useState, useEffect, useCallback } from "react"; 
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import FundWalletTypes from "../components/FundWalletTypes";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import accountServices from "../services/auth.serv";
import vasServices from "../services/vasServi"; // Assuming vasServices is already set up

const HomeScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
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

  const fetchTransactions = async () => {
    try {
      const response = await vasServices.getTransaction();
      setTransactions(response.data.data || []);
      // console.log( "fetchTransactions", response.data.data)
    } catch (err) {
      setError("An error occurred while fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    fetchTransactions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails();
    fetchTransactions(); // Fetch data again
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    await fetchWalletDetails();
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // const filteredTransactions = transactions
    // .filter((transaction) =>
    //   filterDate
    //     ? new Date(transaction.createdAt).toLocaleDateString() === filterDate
    //     : true
    // )
    // .slice(0, 10); // Limit to the last 10 transactions

  const renderItem = ({ item, index }) => {
    return (
      <View className="p-3 mb-2 bg-white rounded-lg shadow-md">
        <Text className="font-bold mb-1">
          {index + 1}. {item.transaction_ref || "N/A"}
        </Text>
        <Text>
          Description: {item.description || "No description available"}
        </Text>
        <Text>Amount: ₦{item.amount || "0"}</Text>
        <Text>
          Date:{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Unknown"}
        </Text>
        <Text>Status: {item.status === 1 ? "Success" : "Failed"}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-600 text-center mt-5">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 flex-col gap-1 bg-gray-100 pt-0">
      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(false)}
        logout={handleLogout}
      />

      {/* Header */}
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={loadData}
        logout={handleLogout}
      />

      <View className="p-6">
        {/* <ScrollView
                className="p-6 bg-red-100 flex-1"
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              ></ScrollView> */}
        <Text className="text-xl font-semibold text-center">
          Hi, {wallet.name} {wallet.lastName}
        </Text>
        <Text className="text-lg text-center">
          Balance: ₦{wallet.balance}
        </Text>

        {/* <FundWalletTypes /> */}

        {/* Use FlatList to handle scrolling and list rendering */}
        <Text className="text-lg font-bold text-center mb-2">Recent Transactions</Text>
        <FlatList
        className="mb-5 h-[70%]"
          data={transactions}
          keyExtractor={(item, index) =>
            item.transaction_ref || index.toString()
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-5">No transactions found</Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
        />
        
      <Footer />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
