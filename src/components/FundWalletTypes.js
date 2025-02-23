import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PaywithPaystack from "./PaywithPaystack";

const FundWalletTypes = () => {
  const [activeTab, setActiveTab] = useState("gtbank");

  const bankDetails = {
    gtbank: {
      accountNumber: "0160157649",
      accountName: "Supreme Data Concept",
      bankName: "GTBank",
    },
    // opay: {
    //   accountNumber: "8105082299",
    //   accountName: "Supreme Data Concept",
    //   bankName: "Opay",
    // },
    palmpay: {
      accountNumber: "1234567890",
      accountName: "Supreme Data Concept",
      bankName: "Palmpay",
    },
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <Text className="text-[#1F233B] text-lg font-semibold mb-4">
        Fund Your Wallet
      </Text>

      {/* Tab Navigation */}
      <View className="flex-row justify-between mb-4">
        {Object.keys(bankDetails).map((key) => (
          <TouchableOpacity
            key={key}
            className={`py-2 px-4 rounded-lg ${
              activeTab === key ? "bg-gray-600" : "bg-gray-200 "
            }`}
            onPress={() => setActiveTab(key)}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === key ? "text-white" : "text-white-300"
              }`}
            >
              {bankDetails[key].bankName}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Paystack Option */}
        <TouchableOpacity
          className={`py-2 px-4 rounded-lg ${
            activeTab === "paystack" ? "bg-gray-600" : "bg-gray-200"
          }`}
          onPress={() => setActiveTab("paystack")}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === "paystack" ? "text-white" : "text-white-300"
            }`}
          >
            Paystack
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bank Details or Paystack Component */}
      <View>
        {activeTab === "paystack" ? (
          <PaywithPaystack />
        ) : (
          <View className="bg-[#14172A] p-5 rounded-lg">
            <Text className="text-lg font-semibold text-white mb-2">
              {bankDetails[activeTab].bankName}
            </Text>
            <Text className="text-sm text-gray-400">
              Account Number:{" "}
              <Text className="text-white font-semibold">
                {bankDetails[activeTab].accountNumber}
              </Text>
            </Text>
            <Text className="text-sm text-gray-400">
              Account Name:{" "}
              <Text className="text-white font-semibold">
                {bankDetails[activeTab].accountName}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FundWalletTypes;
