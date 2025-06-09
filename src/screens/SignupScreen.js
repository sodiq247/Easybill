"use client"

import { useState } from "react"
import { View, Text, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import accountServices from "../services/auth.services"
import Footer from "../components/Footer"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"
// Remove this import
// import AppBackground from "../components/AppBackground"

const SignupScreen = () => {
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigation = useNavigation()

  const validateInput = () => {
    const newErrors = {}

    if (!firstname.trim()) newErrors.firstname = "First name is required"
    if (!lastname.trim()) newErrors.lastname = "Last name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    if (!phone.trim()) newErrors.phone = "Phone number is required"
    if (!password) newErrors.password = "Password is required"
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateInput()) {
      Alert.alert("Error", "Please fix the errors and try again")
      return
    }

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
        Alert.alert("Success", result.body, [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] })
            },
          },
        ])
      } else {
        Alert.alert("Error", result.message || "Signup failed.")
      }
    } catch (error) {
      Alert.alert("Error", "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Remove this import
    // import AppBackground from "../components/AppBackground"

    // In the return statement, replace:
    // <AppBackground>
    //   <View style={{ flex: 1, backgroundColor: "transparent" }}>

    // With:
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
            <View
              style={{
                maxWidth: 400,
                alignSelf: "center",
                width: "100%",
                backgroundColor: theme.white,
                padding: 24,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => navigation.navigate("LoginScreen")}
                style={{ alignSelf: "flex-start", marginBottom: 16 }}
              >
                <Text style={{ color: theme.secondary }}>
                  Go to{" "}
                  <Text
                    style={{
                      color: theme.primary,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                      fontFamily: "SpaceGrotesk",
                    }}
                  >
                    Login
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Title */}
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "600",
                  color: theme.secondary,
                  textAlign: "center",
                  marginBottom: 8,
                  fontFamily: "Lufga",
                }}
              >
                Sign Up
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textLight,
                  textAlign: "left",
                  marginBottom: 24,
                  fontFamily: "Lufga",
                }}
              >
                Your gateway to quick and easy payments at amazing rates! Enter your details and enjoy!
              </Text>

              {/* Form Fields */}
              <Input
                value={firstname}
                onChangeText={setFirstname}
                placeholder="Enter your first name"
                label="First Name"
                error={errors.firstname}
              />

              <Input
                value={lastname}
                onChangeText={setLastname}
                placeholder="Enter your last name"
                label="Last Name"
                error={errors.lastname}
              />

              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email"
                keyboardType="email-address"
                error={errors.email}
              />

              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                label="Phone Number"
                keyboardType="numeric"
                error={errors.phone}
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
              />

              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                label="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                icon={showConfirmPassword ? "visibility-off" : "visibility"}
                onIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirmPassword}
              />

              {/* Sign Up Button */}
              <Button text="Sign Up" onPress={handleSubmit} loading={loading} disabled={loading} fullWidth={true} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </View>
    </View>
    // And at the end, replace:
    //   </View>
    // </AppBackground>

    // With:
  )
}

export default SignupScreen
