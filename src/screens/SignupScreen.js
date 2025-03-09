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
// import loginImage from "../assets/images/login-Image.svg";
// import loginImagebg from "../assets/images/login-Image-bg.svg";
// import loginFormbg from "../../assets/images/login-form-bg.svg";
// import BackIcon from "../../assets/images/back-icon.svg";
// import PersonalDetails from "../assets/images/personal-details.svg";
// import Security from "../assets/images/security.svg";
import accountServices from "../services/auth.services";
// import CustomButton from "../components/CustomButton";
import { Eye, EyeOff } from "lucide-react-native"; // Correct import

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
      Alert.alert("Error", "Fill all field and make sure Passwords match");
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
      console.log("result", result);
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
      source={require("../../assets/icon.png")}
      className="flex-1 p-5 justify-center items-center"
    >
      <View className="w-full mt-4 max-w-sm bg-white p-6 rounded-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          {/* <img src={BackIcon} alt="back-icon" /> */}
          <Image 
      source={require("../../assets/icon.png")}
      className="flex-1 p-5 justify-center items-center w-5 h-5"/>
          <Text className="w-full my-4 flex gap-1 text-gray-500 text-left">
            Back to{" "}
            <Text className="underline ml-1 text-[#14172A] font-semibold">
              Login
            </Text>
          </Text>
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold  text-4xl text-[#14172A] text-center leading-[65.26px]"
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
                <EyeOff size={20} color="#14172A" />
              ) : (
                <Eye size={20} color="#14172A" />
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
                <EyeOff size={20} color="#14172A" />
              ) : (
                <Eye size={20} color="#14172A" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* <View className="flex-row justify-between mt-4">
              <CustomButton
                title="Back"
                onPress={() => setStep(1)}
                style="w-[49%] border mr-2 border-2-[#14172A]  bg-[#14172A]   px-[25px] py-auto  rounded-[15px] flex items-center justify-center font-normal font-spaceGrotesk"
              />
              {loading ? (
                <ActivityIndicator size="large " color="#3B82F6" />
              ) : (
                <CustomButton
                  title="Sign Up"
                  onPress={handleSubmit}
                  disabled={!validateInput()}
                  style="w-[49%] bg-[#14172A] text-[#F8F8FF]  px-[25px] py-auto  rounded-[15px] flex items-center justify-center font-normal font-spaceGrotesk"
                />
              )}
            </View> */}

        <TouchableOpacity
          className="w-full bg-[#14172A] text-white p-3 rounded-lg mt-6 flex items-center justify-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">SignUp</Text>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SignupScreen;
