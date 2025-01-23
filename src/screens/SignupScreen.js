import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import accountServices from "../services/auth.services";

const SignupScreen = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referral, setReferral] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    const role = "user";
    const data = {
      firstname,
      lastname,
      email,
      phone: Number(phone), // Convert phone to number
      pin,
      role,
      password
    };

    try {
      const result = await accountServices.signup(data);
      console.log("Signup result:", result);

      if (result.data?.message === "SUCCESSFUL") {
        Alert.alert("Success", "Signup successful!");
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        }, 500);
      } else {
        Alert.alert("Error", result.data?.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="px-4 py-6 bg-gray-100 flex-1"
      contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
    >
      <Text className="text-2xl font-bold mb-4 text-center">Signup</Text>
      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text className="text-blue-500 text-center mb-4">Go back to Login</Text>
      </TouchableOpacity>
      <TextInput
        value={firstname}
        onChangeText={setFirstname}
        placeholder="Enter Firstname"
        keyboardType="text"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={lastname}
        onChangeText={setLastname}
        placeholder="Enter Lastname"
        keyboardType="text"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter Phone Number"
        keyboardType="phone"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={referral}
        onChangeText={setReferral}
        placeholder="Enter Referral"
        keyboardType="email-address"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={pin}
        onChangeText={setPin}
        placeholder="Enter Pin"
        keyboardType="numeric"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
        secureTextEntry
        className="p-3 mb-5 border border-gray-300 rounded-lg bg-white"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton
          title="Signup"
          onPress={handleSubmit}
          style="bg-blue-500"
        />
      )}
    </ScrollView>
  );
};

export default SignupScreen;
