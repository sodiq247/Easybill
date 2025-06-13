"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Footer from "../components/Footer"
import Button from "../components/ui/Button"
import { theme } from "../utils/theme"
import Icon from "react-native-vector-icons/MaterialIcons"

const ActivationScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { email } = route.params || {}
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResendActive, setIsResendActive] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      // Try to get email from AsyncStorage if not passed as param
      AsyncStorage.getItem("pendingActivation").then((storedEmail) => {
        if (!storedEmail) {
          Alert.alert("Error", "No email found for activation. Please sign up again.", [
            { text: "OK", onPress: () => navigation.replace("SignupScreen") },
          ])
        }
      })
    }

    // Start countdown timer
    startCountdown()
  }, [])

  const startCountdown = () => {
    setTimeLeft(60)
    setIsResendActive(false)

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setIsResendActive(true)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return

    const newCode = [...verificationCode]
    newCode[index] = text

    setVerificationCode(newCode)

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerify = async () => {
    const code = verificationCode.join("")

    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit verification code")
      return
    }

    setLoading(true)

    try {
      // Simulate API call for verification
      // In a real app, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful verification
      await AsyncStorage.removeItem("pendingActivation")

      Alert.alert("Success", "Your account has been activated successfully!", [
        { text: "Login Now", onPress: () => navigation.replace("LoginScreen") },
      ])
    } catch (error) {
      console.error("Verification error:", error)
      Alert.alert("Error", "Failed to verify your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isResendActive) return

    setResendLoading(true)

    try {
      // Simulate API call for resending code
      // In a real app, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("Success", "A new verification code has been sent to your email")
      startCountdown()
    } catch (error) {
      console.error("Resend code error:", error)
      Alert.alert("Error", "Failed to resend verification code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
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
              {/* Success Icon */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: theme.primaryFaded,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon name="email" size={40} color={theme.primary} />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "600",
                  color: theme.secondary,
                  textAlign: "center",
                  marginBottom: 8,
                  fontFamily: "Lufga",
                }}
              >
                Verify Your Email
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textLight,
                  textAlign: "center",
                  marginBottom: 32,
                  fontFamily: "Lufga",
                }}
              >
                We've sent a 6-digit verification code to{"\n"}
                <Text style={{ fontWeight: "600", color: theme.secondary }}>{email}</Text>
              </Text>

              {/* Verification Code Input */}
              <View style={styles.codeContainer}>
                {verificationCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      {
                        borderColor: digit ? theme.primary : theme.border,
                        backgroundColor: digit ? theme.primaryFaded : theme.white,
                      },
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Resend Code */}
              <View style={{ alignItems: "center", marginTop: 24, marginBottom: 32 }}>
                <Text style={{ color: theme.textLight, marginBottom: 8 }}>Didn't receive the code?</Text>

                {isResendActive ? (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={resendLoading}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: "600" }}>
                      {resendLoading ? "Sending..." : "Resend Code"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: theme.textLight }}>
                    Resend code in <Text style={{ fontWeight: "600", color: theme.secondary }}>{timeLeft}s</Text>
                  </Text>
                )}
              </View>

              {/* Verify Button */}
              <Button
                text="Verify Email"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || verificationCode.join("").length !== 6}
                fullWidth={true}
              />

              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => navigation.navigate("LoginScreen")}
                style={{ alignSelf: "center", marginTop: 24 }}
              >
                <Text style={{ color: theme.secondary }}>
                  Back to{" "}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
  },
})

export default ActivationScreen
