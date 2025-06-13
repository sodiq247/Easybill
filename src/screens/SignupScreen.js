"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import accountServices from "../services/auth.services"
import Footer from "../components/Footer"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"
import Icon from "react-native-vector-icons/MaterialIcons"
import { Checkbox } from "react-native-paper"

const SignupScreen = () => {
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isChecked, setIsChecked] = useState(false)
  const [message, setMessage] = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    let timer
    if (emailSent && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
        if (countdown === 1) setCanResend(true)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown, emailSent])

  const validateForm = () => {
    const newErrors = {}

    if (!firstname.trim()) newErrors.firstname = "First name is required"
    if (!lastname.trim()) newErrors.lastname = "Last name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email"
    if (!phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10,11}$/.test(phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords must match"
    }
    if (!isChecked) newErrors.terms = "You must accept the terms and conditions"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    const data = {
      firstname,
      lastname,
      email,
      phone: Number(phone),
      pin: "1234",
      role: "user",
      password,
    }

    try {
      const result = await accountServices.signup(data)
      if (result.message === "SUCCESSFUL") {
        await AsyncStorage.setItem("pendingActivation", email)
        setMessage("Successful! An activation link is sent to your email, please check")
        setEmailSent(true)
        setCountdown(60)
        setCanResend(false)
      } else {
        Alert.alert("Error", result.message || "Signup failed.")
      }
    } catch (error) {
      console.error("Signup error:", error)
      Alert.alert("Error", "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendEmail = async () => {
    if (!email) return
    setLoading(true)
    try {
      const response = await accountServices.resendOTP(email)
      if (response.status === true) {
        setMessage("Activation link resent successfully. Please check your email.")
        setCountdown(60)
        setCanResend(false)
      } else {
        setMessage(response.message || "Failed to resend email.")
      }
    } catch (error) {
      console.error("Resend error:", error)
      setMessage("An error occurred while resending. Try again.")
    }
    setLoading(false)
  }

  return (
    <View className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-5">
          <View className="max-w-md w-full m-auto flex-1">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
              className="flex-row items-center mb-4 mt-8 self-start"
            >
              <Icon name="arrow-back" size={20} color={theme.secondary} />
              <Text className="text-gray-600 ml-1">
                Go to{' '}
                <Text className="text-theme-primary font-semibold underline">Login</Text>
              </Text>
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-3xl font-bold text-center text-gray-800 mb-2">Sign Up</Text>
            <Text className="text-center text-gray-500 mb-3">
              Your gateway to quick and easy payments at amazing rates!
            </Text>

            {/* Message */}
            {message && (
              <View className="bg-blue-50 p-3 rounded-md mb-5 border border-blue-100">
                <Text className="text-blue-800 text-center">{message}</Text>
              </View>
            )}

            {/* Input Fields (scrollable) */}
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingBottom: 10, paddingTop: 5 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="mb-3"
            >
              <Input
                value={firstname}
                onChangeText={setFirstname}
                placeholder="Enter your first name"
                label="First Name"
                error={errors.firstname}
                className="mb-2"
              />
              <Input
                value={lastname}
                onChangeText={setLastname}
                placeholder="Enter your last name"
                label="Last Name"
                error={errors.lastname}
                className="mb-2"
              />
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email"
                keyboardType="email-address"
                error={errors.email}
                className="mb-2"
              />
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                label="Phone Number"
                keyboardType="phone-pad"
                error={errors.phone}
                className="mb-2"
              />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                label="Password"
                secureTextEntry={!showPassword}
                icon={showPassword ? "visibility-off" : "visibility"}
                onIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
                className="mb-2"
              />
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                label="Confirm Password"
                secureTextEntry={!showPassword}
                icon={showPassword ? "visibility-off" : "visibility"}
                onIconPress={() => setShowPassword(!showPassword)}
                error={errors.confirmPassword}
              />
            </ScrollView>

            {/* Terms */}
            <View className="flex-row items-start mb-3">
              <Checkbox
                status={isChecked ? "checked" : "unchecked"}
                onPress={() => setIsChecked(!isChecked)}
                color={theme.primary}
              />
              <Text className="flex-1 text-xs text-gray-600 ml-2">
                By checking this box, you agree to our{" "}
                <Text className="font-semibold">Terms and Conditions</Text> and{" "}
                <Text className="font-semibold">Privacy Policy</Text>.
              </Text>
            </View>
            {errors.terms && (
              <Text className="text-red-500 mb-4 text-sm">{errors.terms}</Text>
            )}

            {/* Submit */}
            <Button
              text="Create Account"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !isChecked}
              className="w-full"
            />

            {/* Resend */}
            {emailSent && (
              <View className="mt-4 items-center">
                <Text className="text-gray-500">
                  {canResend ? (
                    <TouchableOpacity onPress={resendEmail} disabled={loading}>
                      <Text className="text-primary font-semibold">
                        Resend Activation Email
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    `Resend available in ${countdown}s`
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Footer />
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignupScreen
