"use client";

import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import accountServices from "../services/auth.services";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { theme } from "../utils/theme";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem("access_token", token);
    } catch (e) {
      console.error("Error saving token:", e);
    }
  };

  const saveWalletDetails = async (walletDetails) => {
    try {
      await AsyncStorage.setItem(
        "walletDetails",
        JSON.stringify(walletDetails)
      );
    } catch (e) {
      console.error("Error saving wallet details:", e);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    const data = { username: email, password };

    try {
      const result = await accountServices.login(data);

      if (result.body.loggedIn) {
        await saveToken(result.body.access_token);

        try {
          const walletResult = await accountServices.walletBalance();
          const walletDetails = {
            balance: walletResult.Wallet?.amount || 0,
            name: walletResult.Profile?.firstname || "",
            lastname: walletResult.Profile?.lastname || "",
            email: walletResult.Profile?.email || "",
          };
          await saveWalletDetails(walletDetails);

          Alert.alert("Success", "Login successful!");
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          }, 500);
        } catch (walletError) {
          console.error("Error fetching wallet balance:", walletError);
        }
      } else {
        console.error("Error", result.data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="max-w-md w-full self-center">
            {/* Logo Section */}
            <View className="items-center justify-center mb-10">
              <View className="w-20 h-20 rounded-xl bg-theme-primary items-center justify-center shadow-md shadow-theme-primary/40 mb-4">
                <Text className="text-white text-4xl font-bold">V</Text>
              </View>
              <Text className="text-3xl font-bold text-theme-secondary">aaPay</Text>
            </View>

            {/* Welcome Section */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-theme-secondary text-center mb-2">
                Welcome Back!
              </Text>
              <Text className="text-theme-textLight text-center text-base">
                Kindly login to have access to your account
              </Text>
            </View>

            {/* Form Section */}
            <View className="space-y-5">
              {/* Email Input */}
              <View>
                <Text className="text-theme-secondary text-sm font-medium mb-2">
                  Email or Phone Number
                </Text>
                <View className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3">
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email or phone number"
                    keyboardType="email-address"
                    className="text-theme-secondary text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-theme-secondary text-sm font-medium mb-2">
                  Password
                </Text>
                <View className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 flex-row items-center">
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    className="text-theme-secondary text-base flex-1"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text className="text-theme-primary font-medium">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPasswordScreen")}
                className="self-end"
              >
                <Text className="text-theme-primary text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-theme-primary rounded-xl py-4 items-center justify-center shadow-md shadow-theme-primary/30"
              >
                {loading ? (
                  <Text className="text-white font-semibold text-base">Loading...</Text>
                ) : (
                  <Text className="text-white font-semibold text-base">Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Section */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-theme-textLight text-sm">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignupScreen")}
                className="ml-1"
              >
                <Text className="text-theme-primary font-semibold text-sm">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;