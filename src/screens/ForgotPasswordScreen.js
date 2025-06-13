"use client"

import { useState } from "react"
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Footer from "../components/Footer"
import accountServices from "../services/auth.services"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { theme } from "../utils/theme"
// Remove this import
// import AppBackground from "../components/AppBackground"

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigation = useNavigation()

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.")
      return
    }

    setLoading(true)
    const data = { username: email }

    try {
      const result = await accountServices.requestPasswordReset(data)
      if (result.code === 200) {
        setMessage("Password reset email sent. Please check your inbox.")
        setTimeout(() => {
          navigation.replace("LoginScreen")
        }, 2000)
      } else {
        setMessage("Failed to send password reset email. Please try again.")
      }
    } catch (error) {
      setMessage("Failed to send password reset email. Please try again.")
    } finally {
      setLoading(false)
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
               
              }}
            >
              {/* Title */}
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "600",
                  color: theme.secondary,
                  textAlign: "center",
                  marginBottom: 8,
                  fontFamily: "Lufga",
                }}
              >
                Forgot Password
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textLight,
                  textAlign: "center",
                  marginBottom: 32,
                }}
              >
                A link will be sent to your email to help reset your password.
              </Text>

              {/* Email Input */}
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                label="Email Address"
                keyboardType="email-address"
              />

              {/* Message Display */}
              {message ? (
                <View
                  style={{
                    backgroundColor: message.includes("sent") ? theme.primaryFaded : "#FEE2E2",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: message.includes("sent") ? theme.success : theme.error,
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    {message}
                  </Text>
                </View>
              ) : null}

              {/* Send Link Button */}
              <Button text="Send Link" onPress={handleSubmit} loading={loading} disabled={loading} fullWidth={true} />

              {/* Back to Login */}
              <View style={{ marginTop: 24, alignItems: "center" }}>
                <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
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
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </View>
    </View>
  )
}

export default ForgotPasswordScreen
