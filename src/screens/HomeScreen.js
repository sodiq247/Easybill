import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import vasServices from "../services/vasServices";
import FundWalletTypes from "../components/FundWalletTypes";

const HomeScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const navigation = useNavigation();

  useEffect(() => {
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
          setTransactions(response.data.slice(0, 10)); // Get the last 10 transactions
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchWalletDetails();
    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {wallet.name} {wallet.lastname}
      </Text>
      <Text style={styles.balanceText}>Balance: ₦{wallet.balance}</Text>
      <View className="flex-row gap-1 pr-2 my-2">
        {["Data", "Airtime", "CableTv", "Electricity"].map((service) => (
          <TouchableOpacity
            key={service}
            className="px-2 py-2 w-[25%] rounded-full border-2 bg-green-500 border-green-500"
            onPress={() => navigation.navigate(service)}
          >
            <Text className="text-white text-center">{service}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FundWalletTypes />
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionRef}>
              {item.transaction_ref} - ₦{item.amount}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.transactionStatus}>
              {item.status === 1 ? "Success" : "Failed"}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.headerText}>Recent Transactions</Text>
        }
      />
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigation.navigate("TransactionHistory")}
      >
        <Text style={styles.buttonText}>View All Transactions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F3F4F6", flex: 1 },
  welcomeText: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  balanceText: { fontSize: 18, textAlign: "center", marginBottom: 16 },
  headerText: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  transactionItem: { padding: 12, backgroundColor: "#FFFFFF", borderRadius: 8, marginBottom: 8 },
  transactionRef: { fontWeight: "bold" },
  transactionDate: { color: "#6B7280" },
  transactionStatus: { color: "#10B981" },
  viewAllButton: { marginTop: 16, backgroundColor: "#3B82F6", padding: 12, borderRadius: 8 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontWeight: "bold" },
});

export default HomeScreen;
