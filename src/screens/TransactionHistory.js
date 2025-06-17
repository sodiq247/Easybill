"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Icon from "react-native-vector-icons/MaterialIcons"
import accountServices from "../services/auth.services"
import vasServices from "../services/vasServices"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" })
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")
  const navigation = useNavigation()

  // Date filter states
  const [showDateFilterModal, setShowDateFilterModal] = useState(false)
  const [dateFilterActive, setDateFilterActive] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState("all")

  const filters = ["All", "Data", "Airtime", "Electricity", "TV", "Education", "Wallet"]

  // Predefined date ranges
  const dateRanges = [
    { key: "all", label: "All Time", days: null },
    { key: "today", label: "Today", days: 0 },
    { key: "yesterday", label: "Yesterday", days: 1 },
    { key: "week", label: "Last 7 Days", days: 7 },
    { key: "month", label: "Last 30 Days", days: 30 },
    { key: "3months", label: "Last 3 Months", days: 90 },
  ]

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

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await vasServices.getTransaction()
      const transactionData = response.data.data || []

      // Sort transactions by date (newest first)
      const sortedTransactions = transactionData.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })

      setTransactions(sortedTransactions)
      setFilteredTransactions(sortedTransactions)
    } catch (err) {
      setError("An error occurred while fetching transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletDetails()
    fetchTransactions()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([fetchWalletDetails(), fetchTransactions()]).finally(() => {
      setRefreshing(false)
    })
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear()
      navigation.replace("LoginScreen")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const getTransactionIcon = (description) => {
    if (description?.toLowerCase().includes("data")) return "wifi"
    if (description?.toLowerCase().includes("airtime")) return "phone"
    if (description?.toLowerCase().includes("electricity")) return "flash-on"
    if (description?.toLowerCase().includes("dstv")) return "tv"
    if (description?.toLowerCase().includes("jamb")) return "school"
    if (description?.toLowerCase().includes("waec")) return "assignment"
    if (description?.toLowerCase().includes("wallet")) return "account-balance-wallet"
    return "receipt"
  }

  const getTransactionIconColor = (description) => {
    if (description?.toLowerCase().includes("data")) return theme.accent
    if (description?.toLowerCase().includes("airtime")) return "#FF6B6B"
    if (description?.toLowerCase().includes("electricity")) return "#45B7D1"
    if (description?.toLowerCase().includes("dstv")) return "#9B59B6"
    if (description?.toLowerCase().includes("jamb")) return theme.warning
    if (description?.toLowerCase().includes("waec")) return theme.error
    if (description?.toLowerCase().includes("wallet")) return theme.success
    return "#95A5A6"
  }

  const formatAmount = (amount) => {
    const numAmount = Number.parseFloat(amount) || 0
    return numAmount >= 0 ? `+₦${numAmount.toLocaleString()}` : `-₦${Math.abs(numAmount).toLocaleString()}`
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if a transaction falls within the selected date range
  const isTransactionInDateRange = (transaction, range) => {
    if (range.days === null) return true // All time

    const transactionDate = new Date(transaction.createdAt)
    const now = new Date()

    if (range.days === 0) {
      // Today
      return (
        transactionDate.getDate() === now.getDate() &&
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      )
    }

    if (range.days === 1) {
      // Yesterday
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return (
        transactionDate.getDate() === yesterday.getDate() &&
        transactionDate.getMonth() === yesterday.getMonth() &&
        transactionDate.getFullYear() === yesterday.getFullYear()
      )
    }

    // Last N days
    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - range.days)
    return transactionDate >= cutoffDate
  }

  const filterTransactions = useCallback(() => {
    let filtered = transactions

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedFilter !== "All") {
      filtered = filtered.filter((transaction) => {
        const desc = transaction.description?.toLowerCase() || ""
        switch (selectedFilter) {
          case "Data":
            return desc.includes("data")
          case "Airtime":
            return desc.includes("airtime")
          case "Electricity":
            return desc.includes("electricity")
          case "TV":
            return desc.includes("dstv") || desc.includes("tv")
          case "Education":
            return desc.includes("jamb") || desc.includes("waec")
          case "Wallet":
            return desc.includes("wallet")
          default:
            return true
        }
      })
    }

    // Apply date filter
    if (dateFilterActive && selectedDateRange !== "all") {
      const range = dateRanges.find((r) => r.key === selectedDateRange)
      if (range) {
        filtered = filtered.filter((transaction) => isTransactionInDateRange(transaction, range))
      }
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchQuery, selectedFilter, dateFilterActive, selectedDateRange])

  useEffect(() => {
    filterTransactions()
  }, [filterTransactions])

  const applyDateFilter = (rangeKey) => {
    setSelectedDateRange(rangeKey)
    setDateFilterActive(rangeKey !== "all")
    setShowDateFilterModal(false)
  }

  const clearDateFilter = () => {
    setSelectedDateRange("all")
    setDateFilterActive(false)
    setShowDateFilterModal(false)
  }

  const getSelectedDateRangeLabel = () => {
    const range = dateRanges.find((r) => r.key === selectedDateRange)
    return range ? range.label : "All Time"
  }

  const renderTransactionItem = ({ item, index }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.primaryFaded,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
          backgroundColor: `${getTransactionIconColor(item.description)}20`,
        }}
      >
        <Icon name={getTransactionIcon(item.description)} size={16} color={getTransactionIconColor(item.description)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: theme.secondary, marginBottom: 4 }}>
          {item.description || "Transaction"}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textFaded }}>{formatDateTime(item.createdAt)}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: Number.parseFloat(item.amount) >= 0 ? theme.success : theme.error,
            marginBottom: 4,
          }}
        >
          {formatAmount(item.amount)}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: item.status === 1 ? `${theme.success}20` : `${theme.error}20`,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: item.status === 1 ? theme.success : theme.error,
            }}
          >
            {item.status === 1 ? "Success" : "Failed"}
          </Text>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textLight, marginTop: 16 }}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} logout={handleLogout} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
          <Icon name="error-outline" size={64} color={theme.error} />
          <Text style={{ color: theme.error, textAlign: "center", marginTop: 16, fontSize: 18, fontWeight: "500" }}>
            {error}
          </Text>
          <Button text="Try Again" onPress={onRefresh} variant="primary" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

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
          Transaction History
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

      {/* Filter Options */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, marginTop: 2, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          {/* Search Bar */}
          <View style={{ flex: 2, width: "80%", marginRight: 12, marginTop: 12, paddingTop: 12  }}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search ..."
              icon="search"
              iconPosition="left"
            />
          </View>

          {/* Date Filter Button */}
          <Button
            text={getSelectedDateRangeLabel()}
            variant={dateFilterActive ? "primary" : "outline"}
            onPress={() => setShowDateFilterModal(true)}
            icon="date-range"
          />
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {filters.map((filter) => (
              <Button
                key={filter}
                text={filter}
                variant={selectedFilter === filter ? "primary" : "outline"}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transaction List */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary }}>
            Transaction History ({filteredTransactions.length})
          </Text>
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) => item.transaction_ref || index.toString()}
          renderItem={renderTransactionItem}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48 }}>
              <Icon name="receipt-long" size={64} color={theme.textFaded} />
              <Text style={{ color: theme.textLight, fontSize: 18, fontWeight: "500", marginTop: 16 }}>
                No transactions found
              </Text>
              <Text
                style={{
                  color: theme.textFaded,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                  paddingHorizontal: 32,
                }}
              >
                {searchQuery || selectedFilter !== "All" || dateFilterActive
                  ? "Try adjusting your filters"
                  : "Your transactions will appear here"}
              </Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: theme.white,
              borderRadius: 24,
              padding: 24,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: theme.secondary }}>Filter by Date</Text>
              <Button text="✕" variant="ghost" onPress={() => setShowDateFilterModal(false)} />
            </View>

            {/* Date Range Options */}
            <ScrollView style={{ maxHeight: 320 }}>
              {dateRanges.map((range) => (
                <Button
                  key={range.key}
                  text={range.label}
                  variant={selectedDateRange === range.key ? "primary" : "ghost"}
                  onPress={() => applyDateFilter(range.key)}
                  fullWidth={true}
                  icon={selectedDateRange === range.key ? "check" : undefined}
                />
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
              <Button text="Cancel" variant="outline" onPress={() => setShowDateFilterModal(false)} fullWidth={true} />
              <Button text="Clear Filter" variant="error" onPress={clearDateFilter} fullWidth={true} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <Header toggleSidebar={() => setSidebarVisible(!sidebarVisible)} reloadData={onRefresh} logout={handleLogout} />
      {/* <Footer /> */}
    </SafeAreaView>
  )
}

export default TransactionHistory
