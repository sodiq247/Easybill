import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons for visibility icons
import accountServices from "../services/auth.serv";
import Footer from "../components/Footer";

const SignupScreen = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const validateInput = () => {
    return (
      firstname &&
      lastname &&
      email &&
      phone &&
      password &&
      confirmPassword &&
      password === confirmPassword
    );
  };

  const handleSubmit = async () => {
    if (!validateInput()) {
      Alert.alert("Error", "Fill all fields and make sure passwords match");
      return;
    }

    setLoading(true);
    const role = "user";
    const pin = "1234";
    const data = {
      firstname,
      lastname,
      email,
      phone: Number(phone),
      pin,
      role,
      password,
    };

    try {
      const result = await accountServices.signup(data);
      // console.log("result", result);
      if (result.message === "SUCCESSFUL") {
        Alert.alert(result.body);
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        }, 500);
      } else {
        console.log(result.message || "Signup failed.");
        Alert.alert(result.message || "Signup failed.");
      }
    } catch (error) {
      console.log("Signup failed. Please try again.", setError);
      Alert.alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      // source={require("../../assets/icon.png")}
      className="flex-1 p-5 pt-0 pb-0 justify-between items-center"
    >
      <View className="w-full mt-[20%] max-w-sm bg-white p-6 rounded-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")} className="flex flex-row gap-1">
          {/* <Image 
            source={require("../../assets/arrow-right.png")}
            className="flex-1 p-5 justify-center items-center w-2 h-2"
          /> */}
          <Text className="w-full my-4 flex gap-1 text-gray-500 text-left">
            Go to{" "}
            <Text
            style={{ fontFamily: "SpaceGrotesk" }}
            className="underline ml-1 text-[#14172A] font-bold">
            Login
            </Text>
          </Text>
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold text-4xl text-[#14172A] text-center leading-[65.26px]"
        >
          SignUp
        </Text>
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold my-1 font-normal text-[12px] text-[#14172A] text-left leading-[19.58px]"
        >
          Your gateway to quick and easy payments at amazing rates! Enter your
          details and enjoy!
        </Text>

        <TextInput
          style={{ fontFamily: "Lufga" }}
          value={firstname}
          onChangeText={setFirstname}
          placeholder="First Name"
          className="w-full mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <TextInput
          style={{ fontFamily: "Lufga" }}
          value={lastname}
          onChangeText={setLastname}
          placeholder="Last Name"
          className="w-full mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <TextInput
          style={{ fontFamily: "Lufga" }}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          className="w-full mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        <TextInput
          style={{ fontFamily: "Lufga" }}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          keyboardType="numeric"
          className="w-full mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
        
        <View className="relative mt-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
            <TextInput
              style={{ fontFamily: "Lufga", flex: 1, padding: 12 }}
              className="p-3"
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="p-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Icon name="visibility-off" size={20} color="#14172A" />
              ) : (
                <Icon name="visibility" size={20} color="#14172A" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="relative mt-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
            <TextInput
              style={{ fontFamily: "Lufga", flex: 1, padding: 12 }}
              className="p-3"
              placeholder="Confirm Password"
              value={confirmPassword}
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              className="p-3"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <Icon name="visibility-off" size={20} color="#14172A" />
              ) : (
                <Icon name="visibility" size={20} color="#14172A" />
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
            className="text-white font-semibold">SignUp</Text>
          )}
        </TouchableOpacity>
      </View>
      <Footer />
    </ImageBackground>
  );
};

export default SignupScreen;
