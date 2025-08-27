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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View style={{ maxWidth: 400, alignSelf: "center", width: "100%" }}>
              {/* Title */}
              {/* <Text
                style={{
                  fontSize: 48,
                  fontWeight: "600",
                  color: theme.primary,
                  textAlign: "center",
                  marginBottom: 8,
                  fontFamily: "Lufga",
                }}
              >
                Login
              </Text> */}
              {/* App Header with Logo */}
              <View className="items-center justify-center mb-5">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 pt-1 rounded-[10px] bg-theme-primary items-center justify-center mr-0.5">
                    <Text className="text-white text-5xl font-bold">V</Text>
                  </View>
                  <Text className="text-2xl font-bold text-theme-secondary mt-3">
                    aaPay
                  </Text>
                </View>
              </View>
              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textLight,
                  textAlign: "center",
                  marginBottom: 40,
                }}
              >
                Welcome back! Please enter your details to continue.
              </Text>

              {/* Email Input */}
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email Address"
                keyboardType="email-address"
              />

              {/* Password Input */}
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                label="Password"
                secureTextEntry={!showPassword}
                icon={showPassword ? "visibility-off" : "visibility"}
                onIconPress={() => setShowPassword(!showPassword)}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPasswordScreen")}
                style={{ alignSelf: "flex-end", marginBottom: 24 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.secondary,
                    fontWeight: "600",
                    textDecorationLine: "underline",
                    fontFamily: "SpaceGrotesk",
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                text="Login"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                fullWidth={true}
              />

              {/* Sign Up Link */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <Text style={{ color: theme.secondary }}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SignupScreen")}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                      fontFamily: "SpaceGrotesk",
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </View>
    </View>
  );
};

export default LoginScreen;
