import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { EyeIcon, EyeSlashIcon } from "lucide-react-native";
import accountServices from "../services/auth.services";

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
      console.log("result", result)

      if (result.body.loggedIn) {
        await saveToken(result.body.access_token);

        try {
          const walletResult = await accountServices.walletBalance();
          const walletDetails = {
            balance: walletResult.Wallet?.amount || 0,
            name: walletResult.Profile?.firstname || "",
            lastname: walletResult.Profile?.lastname || "",
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
        console.error("Error", result.message || "Login failed.");
        Alert.alert("Error", result.message || "Login failed.");
      }
    } catch (error) {
      console.log("Error", "Login failed. Please try again.", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#14172A] p-5 justify-center items-center">
      <View className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold  text-4xl text-[#14172A] text-center leading-[65.26px]"
        >
          Login
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Welcome back! Please enter your details to continue.
        </Text>

        <TextInput
          style={{ fontFamily: "Lufga" }}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View className="relative mt-4">
          <TextInput
            style={{ fontFamily: "Lufga" }}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full bg-[#14172A] text-white p-3 rounded-lg mt-6 flex items-center justify-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Login</Text>
          )}
        </TouchableOpacity>

        <View className="flex flex-col justify-between mt-4 font-spaceGrotesk">
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text className="font-semibold text--[#14172A] underline">
              Forgot Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text className="text-[#14172A]">
              Don’t have an account?{" "}
              <Text className="font-semibold text--[#14172A] underline">
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-white text-xs mt-6">
        © Copyright *Company* 2025. All Rights Reserved.
      </Text>
    </View>
  );
};

export default LoginScreen;
