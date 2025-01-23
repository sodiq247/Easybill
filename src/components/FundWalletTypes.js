import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PaywithPaystack from "./PaywithPaystac";

const FundWalletTypes = () => {
  const [activeTab, setActiveTab] = useState("gtbank");

  const bankDetails = {
    gtbank: {
      accountNumber: "0160157649",
      accountName: "Supreme Data Concept",
      bankName: "GTBank",
    },
    opay: {
      accountNumber: "8105082299",
      accountName: "Supreme Data Concept",
      bankName: "Opay",
    },
    palmpay: {
      accountNumber: "1234567890",
      accountName: "Supreme Data Concept",
      bankName: "Palmpay",
    },
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-lg my-4">
      <View className="flex-row justify-between mb-4">
        {Object.keys(bankDetails).map((key) => (
          <TouchableOpacity
            key={key}
            className={`py-2 px-4 rounded-full ${
              activeTab === key ? "bg-green-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab(key)}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === key ? "text-white" : "text-gray-700"
              }`}
            >
              {bankDetails[key].bankName}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          className={`py-2 px-4 rounded-full ${
            activeTab === "paystack" ? "bg-blue-500" : "bg-gray-200"
          }`}
          onPress={() => setActiveTab("paystack")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "paystack" ? "text-white" : "text-gray-700"
            }`}
          >
            Paystack
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        {activeTab === "paystack" ? (
          <PaywithPaystack />
        ) : (
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-lg font-semibold text-gray-800">
              Bank Name: {bankDetails[activeTab].bankName}
            </Text>
            <Text className="text-sm text-gray-700">
              Account Number: {bankDetails[activeTab].accountNumber}
            </Text>
            <Text className="text-sm text-gray-700">
              Account Name: {bankDetails[activeTab].accountName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FundWalletTypes;
