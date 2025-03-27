import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/Footer";
import accountServices from "../services/auth.services";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    const data = { username: email };

    try {
      const result = await accountServices.requestPasswordReset(data);
      if (result.code === 200) {
        setMessage("Password reset email sent. Please check your inbox.");
        setTimeout(() => {
          navigation.replace("LoginScreen");
          window.location.reload();
        }, 2000);
      } else {
        setMessage("Failed to send password reset email. Please try again.");
      }
    } catch (error) {
      setMessage("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
          source={require("../../assets/login-bg.png")}
    className="flex-1 flex-col  bg-[#14172A] p-5 pb-0 justify-between items-center">
      <View className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md mt-[50%]">
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold  text-3xl text-[#14172A] text-center leading-[65.26px]"
        >
          Forgot Password
        </Text>
        <Text className="text-gray-600 text-center mb-6">
        A link will be sent to you’re email to help reset your password.
        </Text>

        <TextInput
          style={{ fontFamily: "Lufga" }}
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

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
            className="text-white font-semibold">Send Link</Text>
          )}
        </TouchableOpacity>

        <View className="flex flex-col justify-between mt-4 font-spaceGrotesk">
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                   {/* <img src={BackIcon} alt="back-icon" /> */}
                   <Text className="w-full my-4 flex gap-1 text-gray-500 text-left">
                     Go to{" "}
                     <Text 
                     style={{ fontFamily: "SpaceGrotesk" }}
                     className="underline ml-1 text-[#14172A] font-semibold">
                       Login
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
