"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, RefreshControl, Modal, StatusBar } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import FundWalletTypes from "../components/FundWalletTypes"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Icon from "react-native-vector-icons/MaterialIcons"
import accountServices from "../services/auth.services"
import vasServices from "../services/vasServices"
import Button from "../components/ui/Button"
import { theme } from "../utils/theme"
// Remove this import
// import AppBackground from "../components/AppBackground"

const HomeScreen = () => {
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" })
  const [transactions, setTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [showFundWalletModal, setShowFundWalletModal] = useState(false)
  const navigation = useNavigation()
  const [isPaymentListExpanded, setIsPaymentListExpanded] = useState(false)

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
    fetchWalletDetails()
    fetchTransactions()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([fetchWalletDetails(), fetchTransactions()]).finally(() => {
      setRefreshing(false)
    })
  }, [])

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
      iconColor: theme.accent,
    },
    {
      name: "Electricity",
      icon: "flash-on",
      description: "Pay electricity bills.",
      iconColor: "#45B7D1",
    },
  ]

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
      iconColor: theme.warning,
    },
    {
      name: "WAEC",
      icon: "assignment",
      description: "Buy WAEC scratch cards.",
      iconColor: theme.error,
    },
    {
      name: "Fund Wallet",
      icon: "account-balance-wallet",
      description: "Fund Your Wallet",
      iconColor: theme.primary,
    },
  ]

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
    if (description?.toLowerCase().includes("wallet")) return theme.primary
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

  const renderTransactionItem = (item, index) => (
    <View key={index} className="flex-row items-center bg-theme-primaryFaded rounded-2xl p-4 mb-1.5">
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
        <Icon name={getTransactionIcon(item.description)} size={24} color={getTransactionIconColor(item.description)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme.secondary,
            marginBottom: 4,
          }}
        >
          {item.description || "Transaction"}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.textFaded,
          }}
        >
          {formatDateTime(item.createdAt)}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: Number.parseFloat(item.amount) >= 0 ? theme.success : theme.error,
        }}
      >
        {formatAmount(item.amount)}
      </Text>
    </View>
  )

  return (
    // In the return statement, replace:
    // <AppBackground>
    //   <SafeAreaView style={{ flex: 1 }}>
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

        {/* Fixed Content */}
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* Balance Card */}
          <View
            style={{
              backgroundColor: theme.secondary,
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              marginTop: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: theme.gray[400], fontSize: 14, marginBottom: 4 }}>Your Balance</Text>
                <Text style={{ color: theme.white, fontSize: 24, fontWeight: "700" }}>
                  ₦{wallet.balance.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: theme.primaryFaded,
                      borderRadius: 20,
                      padding: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Icon name="person" size={24} color={theme.primary} />
                  </View>
                  <Text style={{ color: theme.white, fontSize: 12, fontWeight: "500" }}>Hi, {wallet.lastName}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment List */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary, marginBottom: 16 }}>
              Payment List
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {/* Main Services */}
              {mainServices.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ width: "25%", alignItems: "center", marginBottom: 16 }}
                  onPress={() => {
                    if (service.name === "Fund Wallet") {
                      setShowFundWalletModal(true)
                    } else {
                      navigation.navigate(service.name)
                    }
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      backgroundColor: `${service.iconColor}20`,
                    }}
                  >
                    <Icon name={service.icon} size={28} color={service.iconColor} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textLight }}>{service.name}</Text>
                </TouchableOpacity>
              ))}

              {/* More/Collapse Button */}
              <TouchableOpacity
                style={{ width: "25%", alignItems: "center", marginBottom: 16 }}
                onPress={() => setIsPaymentListExpanded(!isPaymentListExpanded)}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    backgroundColor: isPaymentListExpanded ? theme.primaryFaded : theme.gray[100],
                  }}
                >
                  <Icon
                    name={isPaymentListExpanded ? "close" : "apps"}
                    size={28}
                    color={isPaymentListExpanded ? theme.primary : theme.gray[500]}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: isPaymentListExpanded ? theme.primary : theme.textLight,
                  }}
                >
                  {isPaymentListExpanded ? "Collapse" : "More"}
                </Text>
              </TouchableOpacity>

              {/* Additional Services */}
              {isPaymentListExpanded && (
                <>
                  {additionalServices.map((service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ width: "25%", alignItems: "center", marginBottom: 16 }}
                      onPress={() => {
                        if (service.name === "Fund Wallet") {
                          setShowFundWalletModal(true)
                        } else {
                          navigation.navigate(service.name)
                        }
                      }}
                    >
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8,
                          backgroundColor: `${service.iconColor}20`,
                        }}
                      >
                        <Icon name={service.icon} size={28} color={service.iconColor} />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textLight }}>{service.name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          </View>

          {/* Promotions Section */}
          <View style={{ marginBottom: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary }}>Promotions</Text>
              <TouchableOpacity>
                <Text style={{ color: theme.primary, fontWeight: "500" }}>See all</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: theme.primaryFaded,
                borderRadius: 16,
                height: 128,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.textLight }}>No promotions available</Text>
            </View>
          </View>

          {/* Transactions Section */}
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.secondary }}>Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={{ color: theme.primary, fontWeight: "500" }}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            >
              {transactions.length > 0 ? (
                <View>{transactions.slice(0, 5).map((item, index) => renderTransactionItem(item, index))}</View>
              ) : (
                <View
                  style={{
                    backgroundColor: theme.primaryFaded,
                    borderRadius: 16,
                    padding: 24,
                    alignItems: "center",
                  }}
                >
                  <Icon name="receipt-long" size={48} color={theme.primary} />
                  <Text style={{ color: theme.textLight, marginTop: 8 }}>No transactions yet</Text>
                </View>
              )}
              <View style={{ height: 40 }} />
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
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: theme.white,
                borderRadius: 24,
                padding: 24,
                width: "80%",
                maxWidth: 400,
              }}
            >
              <FundWalletTypes />
              <Button text="Cancel" variant="outline" onPress={() => setShowFundWalletModal(false)} fullWidth={true} />
            </View>
          </View>
        </Modal>

        <Header
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          reloadData={fetchWalletDetails}
          logout={async () => {
            await AsyncStorage.clear()
            navigation.replace("LoginScreen")
          }}
        />
        <Footer />
      </SafeAreaView>
    </View>
    // And at the end, replace:
    //   </SafeAreaView>
    // </AppBackground>

    // With:
    //   </SafeAreaView>
    // </View>
  )
}

export default HomeScreen
