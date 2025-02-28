import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import vasServices from "../services/vasServices";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await vasServices.getTransaction();
        console.log("trans response", response); // Inspect the full response for any issues
        if (response.status === 1) {
          setTransactions(response.data); // Store the transaction data if response is successful
        } else {
          setError(response.msg || "Failed to retrieve transaction history"); // Handle failure
        }
      } catch (err) {
        setError("An error occurred while fetching transactions"); // Generic error handling
      } finally {
        setLoading(false); // Set loading to false after the API call finishes
      }
    };

    fetchTransactionHistory();
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    filterDate ? new Date(transaction.createdAt).toLocaleDateString() === filterDate : true
  ).slice(0, 10); // Filter and limit the result to the last 10 transactions

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{index + 1}. {item.transaction_ref}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Amount: ₦{item.amount} {item.currency}</Text>
      <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
      <Text>Status: {item.status === 1 ? "Success" : "Failed"}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#3B82F6" />; // Display loading indicator while fetching data
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>; // Display error message
  }

  return (
    <View style={styles.listContainer}>
      <TextInput
        placeholder="Filter by Date (YYYY-MM-DD)"
        value={filterDate}
        onChangeText={setFilterDate} // Update filterDate when the user types
        style={styles.filterInput}
      />
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#F3F4F6",
    flex: 1
  },
  itemContainer: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  filterInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff"
  },
});

export default TransactionHistory;
