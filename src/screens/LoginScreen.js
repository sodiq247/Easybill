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
import accountServices from "../services/auth.services";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      await AsyncStorage.setItem("walletDetails", JSON.stringify(walletDetails));
    } catch (e) {
      console.error("Error saving wallet details:", e);
    }
  };

  const handleSubmit = async () => {
    Alert.alert(" fields are filled");
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    
    setLoading(true);
    const data = { username: email, password };
    
    Alert.alert("trying to submit");
    try {
      const result = await accountServices.login(data);
        console.log("login result", result)
      if (result.body.loggedIn === true) {
        await saveToken(result.body.access_token);

        // Fetch wallet details
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
        // Alert.alert("Error", result.data?.message || "Login failed.");
        console.error("Error", result.data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error);
    } finally { 
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Login
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginTop: 20,
          borderRadius: 5,
        }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginTop: 20,
          borderRadius: 5,
        }}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "#3B82F6",
          padding: 15,
          marginTop: 20,
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
