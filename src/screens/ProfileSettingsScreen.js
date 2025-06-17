"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import accountServices from "../services/auth.services";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { theme } from "../utils/theme";
// Remove this import
// import AppBackground from "../components/AppBackground"

const ProfileSettingsScreen = () => {
  const [userProfile, setUserProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [editableProfile, setEditableProfile] = useState({
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const walletResult = await accountServices.walletBalance();
      const profile = walletResult.Profile || {};

      const userInfo = {
        firstname: profile.firstname || "",
        lastname: profile.lastname || "",
        email: profile.email || "",
        phone: profile.phone || "",
      };

      setUserProfile(userInfo);
      setEditableProfile({
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        phone: userInfo.phone,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editableProfile.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!editableProfile.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (!editableProfile.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,11}$/.test(editableProfile.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the stored user profile
      setUserProfile({
        ...userProfile,
        ...editableProfile,
      });

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditableProfile({
      firstname: userProfile.firstname,
      lastname: userProfile.lastname,
      phone: userProfile.phone,
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  const profileMenuItems = [
    {
      icon: "security",
      title: "Security",
      subtitle: "Change password, enable 2FA",
      onPress: () =>
        Alert.alert("Coming Soon", "Security settings will be available soon"),
    },
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage your notification preferences",
      onPress: () =>
        Alert.alert(
          "Coming Soon",
          "Notification settings will be available soon"
        ),
    },
    {
      icon: "help-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () =>
        Alert.alert("Coming Soon", "Help & Support will be available soon"),
    },
    {
      icon: "privacy-tip",
      title: "Privacy Policy",
      subtitle: "Read our privacy policy",
      onPress: () =>
        Alert.alert("Coming Soon", "Privacy Policy will be available soon"),
    },
    {
      icon: "description",
      title: "Terms & Conditions",
      subtitle: "Read our terms and conditions",
      onPress: () =>
        Alert.alert("Coming Soon", "Terms & Conditions will be available soon"),
    },
  ];

  if (loading) {
    return (
      // In the return statement, replace:
      // <AppBackground>
      //   <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={theme.background}
          />
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.textLight, marginTop: 16 }}>
              Loading profile...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    // In the return statement, replace:
    // <AppBackground>
    //   <SafeAreaView style={{ flex: 1 }}>
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: theme.white,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.secondary} />
          </TouchableOpacity>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: theme.secondary }}
          >
            Profile Settings
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          >
            <Text style={{ color: theme.primary, fontWeight: "600" }}>
              {isEditing ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View
            style={{
              backgroundColor: theme.white,
              paddingHorizontal: 16,
              paddingVertical: 24,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.primaryFaded,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="person" size={40} color={theme.primary} />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: theme.secondary,
                marginBottom: 4,
              }}
            >
              {userProfile.firstname} {userProfile.lastname}
            </Text>
            <Text style={{ fontSize: 16, color: theme.textLight }}>
              {userProfile.email}
            </Text>
          </View>

          {/* Profile Information */}
          <View
            style={{
              backgroundColor: theme.white,
              marginHorizontal: 16,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.secondary,
                marginBottom: 16,
              }}
            >
              Personal Information
            </Text>

            <Input
              value={
                isEditing ? editableProfile.firstname : userProfile.firstname
              }
              onChangeText={(text) =>
                setEditableProfile({ ...editableProfile, firstname: text })
              }
              label="First Name"
              placeholder="Enter your first name"
              disabled={!isEditing}
              error={errors.firstname}
            />

            <Input
              value={
                isEditing ? editableProfile.lastname : userProfile.lastname
              }
              onChangeText={(text) =>
                setEditableProfile({ ...editableProfile, lastname: text })
              }
              label="Last Name"
              placeholder="Enter your last name"
              disabled={!isEditing}
              error={errors.lastname}
            />

            <Input
              value={userProfile.email}
              label="Email Address"
              placeholder="Email address"
              disabled={true}
              icon="lock"
              iconPosition="right"
            />

            <Input
              value={isEditing ? editableProfile.phone : userProfile.phone}
              onChangeText={(text) =>
                setEditableProfile({ ...editableProfile, phone: text })
              }
              label="Phone Number"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              disabled={!isEditing}
              error={errors.phone}
            />

            {isEditing && (
              <View style={{ marginTop: 16 }}>
                <Button
                  text="Save Changes"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  fullWidth={true}
                />
              </View>
            )}
          </View>

          {/* Menu Items */}
          <View
            style={{
              backgroundColor: theme.white,
              marginHorizontal: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.secondary,
                padding: 16,
                paddingBottom: 8,
              }}
            >
              Settings
            </Text>

            {profileMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth:
                    index < profileMenuItems.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primaryFaded,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Icon name={item.icon} size={20} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.secondary,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.textLight }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.textFaded} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
            <Button
              text="Logout"
              variant="error"
              icon="logout"
              onPress={handleLogout}
              fullWidth={true}
            />
          </View>
        </ScrollView>
        <Header />
        {/* <Footer /> */}
      </SafeAreaView>
    </View>
  );
};

export default ProfileSettingsScreen;
