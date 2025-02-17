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
import { useNavigation } from "@react-navigation/native";
// import loginImage from "../assets/images/login-Image.svg";
// import loginImagebg from "../assets/images/login-Image-bg.svg";
import loginFormbg from "../../assets/images/login-form-bg.svg";
// import BackIcon from "../../assets/images/back-icon.svg";
// import PersonalDetails from "../assets/images/personal-details.svg";
// import Security from "../assets/images/security.svg";
import accountServices from "../services/auth.services";
import CustomButton from "../components/CustomButton";

const SignupScreen = () => {
  const [step, setStep] = useState(1);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const validateStepOne = () => {
    return firstname && lastname && email && phone && pin;
  };

  const validateStepTwo = () => {
    return password && confirmPassword && password === confirmPassword;
  };

  const handleSubmit = async () => {
    if (!validateStepTwo()) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const role = "user";
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
      if (result.data?.message === "SUCCESSFUL") {
        Alert.alert("Success", "Signup successful!");
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        }, 500);
      } else {
        setError(result.data?.message || "Signup failed.");
      }
    } catch (error) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{ backgroundImage: `url(${loginFormbg})` }}
      className="flex-1 bg-[#14172A] p-5 justify-center items-center"
    >
      <View 
      className="w-full mt-4 max-w-sm bg-white p-6 rounded-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          {/* <img src={BackIcon} alt="back-icon" /> */}
          <Text 
          className="w-full my-4 flex gap-1 text-gray-500 text-left">
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
          Your gateway to quick and easy payments at amazing rates! Enter
          your details and enjoy!
        </Text>
        
        {step === 1 && (
          <>
          <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold my-3 font-normal text-[20px] text-[#14172A] text-left leading-[19.58px]"
        >
          Personal Details
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
            <TextInput
            style={{ fontFamily: "Lufga" }}
              value={pin}
              onChangeText={setPin}
              placeholder="Transaction PIN"
              keyboardType="numeric"
              secureTextEntry
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
            
           />
            <CustomButton
              title="Next"
              onPress={() => setStep(2)}
              disabled={!validateStepOne()}
              style="bg-[#14172A] mt-4"
            />
          </>
        )}

        {step === 2 && (
          <>
          <Text
          style={{ fontFamily: "Lufga" }}
          className="font-semibold my-3 font-normal text-[20px] text-[#14172A] text-left leading-[19.58px]"
        >
          Security
        </Text>
            <TextInput
            style={{ fontFamily: "Lufga" }}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
            />
            <TextInput
            style={{ fontFamily: "Lufga" }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              className="p-3 mt-4 border border-gray-300 rounded-lg bg-white"
            />
            {error && <Text className="text-red-500 text-center">{error}</Text>}
            <View className="flex-row justify-between mt-4">
              <CustomButton
                title="Back"
                onPress={() => setStep(1)}
                style="w-[49%] border mr-2 border-2-[#14172A]  bg-[#14172A]   px-[25px] py-auto  rounded-[15px] flex items-center justify-center font-normal font-spaceGrotesk"
              />
              {loading ? (
                <ActivityIndicator size="large  " color="#3B82F6" />
              ) : (
                <CustomButton
                  title="Sign Up"
                  onPress={handleSubmit}
                  disabled={!validateStepTwo()}
                  style="w-[49%] bg-[#14172A] text-[#F8F8FF]  px-[25px] py-auto  rounded-[15px] flex items-center justify-center font-normal font-spaceGrotesk"
                />
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default SignupScreen;
