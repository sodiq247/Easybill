"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "react-native-vector-icons/MaterialIcons";
import accountServices from "../services/auth.services";
import vasServices from "../services/vasServices";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const navigation = useNavigation();

  // Date filter states
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const filters = [
    "All",
    "Data",
    "Airtime",
    "Electricity",
    "TV",
    "Education",
    "Wallet",
  ];

  // Predefined date ranges
  const dateRanges = [
    { key: "all", label: "All Time", days: null },
    { key: "today", label: "Today", days: 0 },
    { key: "yesterday", label: "Yesterday", days: 1 },
    { key: "week", label: "Last 7 Days", days: 7 },
    { key: "month", label: "Last 30 Days", days: 30 },
    { key: "3months", label: "Last 3 Months", days: 90 },
  ];

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
      setLoading(true);
      const response = await vasServices.getTransaction();
      const transactionData = response.data.data || [];

      // Sort transactions by date (newest first)
      const sortedTransactions = transactionData.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
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
    Promise.all([fetchWalletDetails(), fetchTransactions()]).finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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

  // Check if a transaction falls within the selected date range
  const isTransactionInDateRange = (transaction, range) => {
    if (range.days === null) return true; // All time

    const transactionDate = new Date(transaction.createdAt);
    const now = new Date();

    if (range.days === 0) {
      // Today
      return (
        transactionDate.getDate() === now.getDate() &&
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    }

    if (range.days === 1) {
      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        transactionDate.getDate() === yesterday.getDate() &&
        transactionDate.getMonth() === yesterday.getMonth() &&
        transactionDate.getFullYear() === yesterday.getFullYear()
      );
    }

    // Last N days
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - range.days);
    return transactionDate >= cutoffDate;
  };

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.transaction_ref
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== "All") {
      filtered = filtered.filter((transaction) => {
        const desc = transaction.description?.toLowerCase() || "";
        switch (selectedFilter) {
          case "Data":
            return desc.includes("data");
          case "Airtime":
            return desc.includes("airtime");
          case "Electricity":
            return desc.includes("electricity");
          case "TV":
            return desc.includes("dstv") || desc.includes("tv");
          case "Education":
            return desc.includes("jamb") || desc.includes("waec");
          case "Wallet":
            return desc.includes("wallet");
          default:
            return true;
        }
      });
    }

    // Apply date filter
    if (dateFilterActive && selectedDateRange !== "all") {
      const range = dateRanges.find((r) => r.key === selectedDateRange);
      if (range) {
        filtered = filtered.filter((transaction) =>
          isTransactionInDateRange(transaction, range)
        );
      }
    }

    setFilteredTransactions(filtered);
  }, [
    transactions,
    searchQuery,
    selectedFilter,
    dateFilterActive,
    selectedDateRange,
  ]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const applyDateFilter = (rangeKey) => {
    setSelectedDateRange(rangeKey);
    setDateFilterActive(rangeKey !== "all");
    setShowDateFilterModal(false);
  };

  const clearDateFilter = () => {
    setSelectedDateRange("all");
    setDateFilterActive(false);
    setShowDateFilterModal(false);
  };

  const getSelectedDateRangeLabel = () => {
    const range = dateRanges.find((r) => r.key === selectedDateRange);
    return range ? range.label : "All Time";
  };

  const renderTransactionItem = ({ item, index }) => (
    <View className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 mx-4">
      <View
        className="w-8 h-8 rounded-2xl items-center justify-center mr-4"
        style={{
          backgroundColor: `${getTransactionIconColor(item.description)}20`,
        }}
      >
        <Icon
          name={getTransactionIcon(item.description)}
          size={12}
          color={getTransactionIconColor(item.description)}
        />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-gray-900 mb-1">
          {item.description || "Transaction"}
        </Text>
        {/* <Text className="text-[12px] text-gray-500 mb-1">
          Transaction ID: {item.transaction_ref || "N/A"}
        </Text> */}
        <Text className="text-xs text-gray-400">
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-bold mb-1 ${
            Number.parseFloat(item.amount) >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {formatAmount(item.amount)}
        </Text>
        <View
          className={`px-2 py-1 rounded-full ${
            item.status === 1 ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              item.status === 1 ? "text-green-800" : "text-red-800"
            }`}
          >
            {item.status === 1 ? "Success" : "Failed"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
       
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-500 mt-4">Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Header
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          reloadData={onRefresh}
          logout={handleLogout}
        />
        <View className="flex-1 justify-center items-center px-4">
          <Icon name="error-outline" size={64} color="#EF4444" />
          <Text className="text-red-600 text-center mt-4 text-lg font-medium">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-pink-500 rounded-2xl px-6 py-3 mt-4"
            onPress={onRefresh}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {/* Balance Display */}
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <Text className="text-center text-lg font-semibold text-gray-900">
          Hi, {wallet.name} {wallet.lastName}
        </Text>
        <Text className="text-center text-2xl font-bold text-gray-900 mt-1">
          Balance: ₦{wallet.balance.toLocaleString()}
        </Text>
      </View>
      
      {/* Filter Options */}
      <View className="px-4 pb-2 mt-3 gap-3">
        <View className="flex-row justify-between items-center mb-2">
          {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-2 py-0 w-[60%]">
          <Icon name="search" size={24} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="clear" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
      </View>

          {/* Date Filter Button */}
          <TouchableOpacity
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              dateFilterActive ? "bg-blue-100" : "bg-gray-100"
            }`}
            onPress={() => setShowDateFilterModal(true)}
          >
            <Icon
              name="date-range"
              size={18}
              color={dateFilterActive ? "#3B82F6" : "#6B7280"}
            />
            <Text
              className={`ml-1 ${
                dateFilterActive ? "text-blue-600 font-medium" : "text-gray-600"
              }`}
            >
              {getSelectedDateRangeLabel()}
            </Text>
            {dateFilterActive && (
              <TouchableOpacity
                className="ml-1 p-1"
                onPress={clearDateFilter}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={14} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row space-x-3">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`px-4 py-2 rounded-full ${
                  selectedFilter === filter ? "bg-pink-500" : "bg-gray-100"
                }`}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  className={`font-medium ${
                    selectedFilter === filter ? "text-white" : "text-gray-600"
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transaction List */}
      <View className="flex-1">
        <View className="px-4 pb-2 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">
            Transaction History ({filteredTransactions.length})
          </Text>
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) =>
            item.transaction_ref || index.toString()
          }
          renderItem={renderTransactionItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Icon name="receipt-long" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No transactions found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2 px-8">
                {searchQuery || selectedFilter !== "All" || dateFilterActive
                  ? "Try adjusting your filters"
                  : "Your transactions will appear here"}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateFilterModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Filter by Date
              </Text>
              <TouchableOpacity onPress={() => setShowDateFilterModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Date Range Options */}
            <ScrollView className="max-h-80">
              {dateRanges.map((range) => (
                <TouchableOpacity
                  key={range.key}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                    selectedDateRange === range.key
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50"
                  }`}
                  onPress={() => applyDateFilter(range.key)}
                >
                  <Text
                    className={`text-base font-medium ${
                      selectedDateRange === range.key
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {range.label}
                  </Text>
                  {selectedDateRange === range.key && (
                    <Icon name="check" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row space-x-4 mt-6">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-xl py-3"
                onPress={() => setShowDateFilterModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3"
                onPress={clearDateFilter}
              >
                <Text className="text-white font-semibold text-center">
                  Clear Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
                {/* Header */}
      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={onRefresh}
        logout={handleLogout}
      />
      <Footer />
    </SafeAreaView>
  );
};

export default TransactionHistory;
