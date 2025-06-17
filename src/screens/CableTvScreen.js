"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import vasServices from "../services/vasServices";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import accountServices from "../services/auth.services";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { theme } from "../utils/theme";

const CableTvScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTvType, setSelectedTvType] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [tvplan, setTvPlan] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, name: "", lastname: "" });
  const [iucName, setIucName] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchWalletDetails();
    fetchTvPlan();
  }, []);

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

  const fetchTvPlan = async () => {
    try {
      const tvPlanResult = await vasServices.getAllTvPlan();
      setTvPlan(tvPlanResult.data || []);
    } catch (error) {
      console.error("Error fetching TV plans:", error.message);
    }
  };

  const handleTvTypeChange = (value) => {
    setSelectedTvType(value);
    setSelectedPlanId("");
    setAmountToPay(0);

    const filtered = (tvplan || []).filter((plan) => plan.type === value);
    setFilteredPlans(filtered);
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = filteredPlans.find(
      (plan) => plan.plan_id === Number.parseInt(planId)
    );
    if (selectedPlan) {
      setSelectedPlanId(planId);
      setAmountToPay(Number.parseFloat(selectedPlan.amount) + 80); // Add processing fee
      setPlanTitle(selectedPlan.title);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetails().finally(() => setRefreshing(false));
  }, []);

  const mapCablenameToNumber = (cablename) => {
    switch (cablename) {
      case "GOTV":
        return 1;
      case "DSTV":
        return 2;
      case "STARTIME":
        return 3;
      default:
        return null;
    }
  };

  const validateIUC = async () => {
    if (!selectedTvType || !selectedPlanId || !smartCardNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        cablename: selectedTvType,
        cableplan: selectedPlanId,
        smart_card_number: smartCardNumber,
      };
      const response = await vasServices.validateIUC(data);
      setIucName(response.data.name);
      setTransactionDetails({ ...data, name: response.data.name });
      setShowModal(true);
    } catch (error) {
      Alert.alert("Error", "Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);

    const mappedCablename = mapCablenameToNumber(transactionDetails.cablename);
    const dataToSubmit = {
      ...transactionDetails,
      cablename: mappedCablename,
    };

    if (wallet.balance < amountToPay) {
      Alert.alert("Error", "Insufficient balance.");
    } else {
      try {
        const response = await vasServices.cablesub(dataToSubmit);
        if (response && !response.data.error) {
          Alert.alert("Success", "Subscription successful.", [
            {
              text: "OK",
              onPress: () => {
                setShowModal(false);
                // Reset form
                setSelectedTvType("");
                setSelectedPlanId("");
                setSmartCardNumber("");
                setAmountToPay(0);
                setFilteredPlans([]);
                fetchWalletDetails();
              },
            },
          ]);
        } else {
          Alert.alert("Error", "Transaction unsuccessful");
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert("Error", "Transaction failed.");
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const tvProviderOptions = [
    { label: "Select Provider", value: "" },
    { label: "GOTV", value: "GOTV" },
    { label: "DSTV", value: "DSTV" },
    { label: "STARTIME", value: "STARTIME" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(false)}
        logout={handleLogout}
      />

      <ScrollView
        style={{ flex: 1, padding: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
      >
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
          Cable TV Subscription
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
          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              color: theme.textLight,
              marginBottom: 4,
            }}
          >
            Balance: ₦{wallet.balance.toLocaleString()}
          </Text>
        </View>

        {/* TV Provider Selection */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.text,
            marginBottom: 6,
            marginLeft: 16,
            fontFamily: "Lufga",
          }}
        >
          TV Provider
        </Text>
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: 16,
          }}
        >
          <Picker
            selectedValue={selectedTvType}
            onValueChange={handleTvTypeChange}
          >
            {tvProviderOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>

        {/* Plan Selection */}
        {selectedTvType && (
          <View
            style={{
              backgroundColor: theme.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.text,
                margin: 16,
                marginBottom: 8,
              }}
            >
              Plan
            </Text>
            <Picker
              selectedValue={selectedPlanId}
              onValueChange={handlePlanChange}
            >
              <Picker.Item label="Select Plan" value="" />
              {filteredPlans.map((plan) => (
                <Picker.Item
                  key={plan.plan_id}
                  label={`${plan.title} - ₦${plan.amount}`}
                  value={plan.plan_id}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* Smart Card Number Input */}
        <Input
          value={smartCardNumber}
          onChangeText={setSmartCardNumber}
          placeholder="Enter Smart Card / IUC Number"
          label="Smart Card / IUC Number"
          keyboardType="numeric"
        />

        {/* Amount to Pay Display */}
        {/* Amount to Pay Display */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.text,
            marginBottom: 6,
            marginLeft: 16,
            fontFamily: "Lufga",
          }}
        >
          Amount to pay
        </Text>
        <View
          style={{
            backgroundColor: theme.white,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 10,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: theme.secondary,
              textAlign: "end",
              marginLeft: 6,
            }}
          >
            ₦{amountToPay.toLocaleString() || "0.00"}
          </Text>
        </View>

        {/* Validate Button */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <Button text="Validate" onPress={validateIUC} fullWidth={true} />
        )}

        {/* Confirmation Modal */}
        <Modal
          transparent
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.white,
                borderRadius: 16,
                padding: 24,
                width: "85%",
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 16,
                  color: theme.secondary,
                }}
              >
                Transaction Details
              </Text>

              <View style={{ gap: 8, marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.textLight }}>TV Provider:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>
                    {selectedTvType}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.textLight }}>Plan:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>
                    {planTitle}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.textLight }}>IUC Name:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>
                    {iucName}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.textLight }}>IUC Number:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>
                    {smartCardNumber}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.textLight }}>Amount:</Text>
                  <Text style={{ fontWeight: "600", color: theme.text }}>
                    ₦{amountToPay.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <Button
                  text="Proceed"
                  onPress={handlePurchase}
                  loading={loading}
                  fullWidth={true}
                />
                <Button
                  text="Cancel"
                  variant="outline"
                  onPress={() => {
                    setShowModal(false);
                    // Reset form
                    setSelectedTvType("");
                    setSelectedPlanId("");
                    setSmartCardNumber("");
                    setAmountToPay(0);
                    setFilteredPlans([]);
                    fetchWalletDetails();
                  }}
                  fullWidth={true}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <Header
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        reloadData={onRefresh}
        logout={handleLogout}
      />
      {/* <Footer /> */}
    </SafeAreaView>
  );
};

export default CableTvScreen;
