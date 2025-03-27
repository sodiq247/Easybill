import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icons from MaterialIcons
import accountServices from "../services/auth.services";
import Footer from "../components/Footer";

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
          // console.log("walletResult", walletResult)
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
    <ImageBackground
      source={require("../../assets/login-bg.png")}
      className="flex-1 p-5 pb-0 justify-between items-center"
    >
      <View className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md mt-[48%]">
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold text-4xl text-[#14172A] text-center leading-[65.26px]"
        >
          Login
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Welcome back! Please enter your details to continue.
        </Text>

        <TextInput
          style={{ fontFamily: "Lufga" }}
          className="p-3 w-full border border-gray-300 rounded-lg bg-white shadow-md"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View className="relative mt-4">
          <View className="px-3 w-full flex-row items-center border border-gray-300 rounded-lg bg-white shadow-md">
            <TextInput
              className="flex-1 bg-white"
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className=""
              onPress={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <Icon name="visibility-off" size={24} color="#14172A" />
              ) : (
                <Icon name="visibility" size={24} color="#14172A" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          className="w-full bg-[#14172A] text-white p-3 rounded-lg mt-6 flex items-center justify-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{ fontFamily: "SpaceGrotesk" }}
              className="text-white font-semibold"
            >
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex flex-col justify-between mt-4 font-spaceGrotesk">
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
          >
            <Text
              style={{ fontFamily: "SpaceGrotesk" }}
              className="font-semibold text--[#14172A] underline"
            >
              Forgot Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text className="text-[#14172A]">
              Don’t have an account?{" "}
              <Text
                style={{ fontFamily: "SpaceGrotesk" }}
                className="font-semibold text--[#14172A] underline"
              >
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Footer />
    </ImageBackground>
  );
};

export default LoginScreen;
