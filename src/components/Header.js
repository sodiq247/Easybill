"use client"

import React from "react"

import { useState } from "react"
import { View, Text, TouchableOpacity, Animated } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import { theme } from "../utils/theme"

const Header = ({ toggleSidebar, reloadData, logout }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [animation] = useState(new Animated.Value(0))
  const [currentScreen, setCurrentScreen] = useState("Home")
  const navigation = useNavigation()
  const route = useRoute()

  // Automatically update current screen when route changes
  useFocusEffect(
    React.useCallback(() => {
      setCurrentScreen(route.name)
    }, [route.name]),
  )

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start()

    setIsExpanded(!isExpanded)
  }

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 400],
  })

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  })

  const navigateToScreen = (screenName) => {
    // Close expanded menu when navigating
    if (isExpanded) {
      setIsExpanded(false)
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start()
    }

    // Navigate to the specified screen
    navigation.navigate(screenName)
  }

  const menuItems = [
    { icon: "settings", label: "Settings", onPress: () => navigateToScreen("ProfileSettings") },
    { icon: "help-outline", label: "Help Center", onPress: () => console.log("Help Center") },
    { icon: "lock-reset", label: "Reset Password", onPress: () => console.log("Reset Password") },
    { icon: "privacy-tip", label: "Privacy Policy", onPress: () => console.log("Privacy Policy") },
    { icon: "description", label: "Terms & Conditions", onPress: () => console.log("Terms & Conditions") },
    { icon: "logout", label: "Log Out", onPress: () => navigateToScreen("LoginScreen") },
  ]

  // Navigation items with screen name mapping
  const navigationItems = [
    {
      name: "Home",
      screenNames: ["Home", "HomeScreen"],
      icon: "home",
      onPress: () => navigateToScreen("Home"),
    },
    {
      name: "Services",
      screenNames: ["Airtime", "Data", "Electricity", "TV", "JAMB", "WAEC"],
      icon: "account-balance-wallet",
      onPress: () => navigateToScreen("Home"),
    },
    {
      name: "Profile",
      screenNames: ["ProfileSettings", "ProfileSettingsScreen", "History", "TransactionHistory"],
      icon: "person",
      onPress: () => navigateToScreen("ProfileSettings"),
    },
  ]

  const renderNavigationItem = (item) => {
    // Check if current screen matches any of the possible screen names
    const isActive = item.screenNames.includes(currentScreen)

    return (
      <TouchableOpacity
        key={item.name}
        onPress={item.onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isActive ? theme.primary : "transparent",
          borderRadius: 12,
          paddingHorizontal: isActive ? 16 : 12,
          paddingVertical: 10,
          minHeight: 44,
          justifyContent: isActive ? "flex-start" : "center",
          flex: isActive ? 1 : 0,
          maxWidth: isActive ? 120 : 44,
          marginHorizontal: 2,
        }}
      >
        <Icon name={item.icon} size={24} color={theme.white} />
        {isActive  && (
          <Text
            style={{
              color: theme.white,
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 10,
              textAlign: "left",
            }}
          >
            {item.name}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  // Add a fallback check to ensure the component renders properly
  const hasActiveItem = navigationItems.some((item) => item.screenNames.includes(currentScreen))

  return (
    <Animated.View
      style={{
        height: menuHeight,
        backgroundColor: theme.secondary,
        borderRadius: 15,
        marginHorizontal: 24,
        marginBottom: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: "hidden",
      }}
    >
      {/* Collapsed Menu - Bottom Navigation */}
      {!isExpanded && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 18,
            height: 80,
            gap: 8,
          }}
        >
          {/* Navigation Items */}
          {navigationItems.map(renderNavigationItem)}

          {/* Show current screen name if not in navigation items */}
          {!hasActiveItem && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.white,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                {currentScreen}
              </Text>
            </View>
          )}

          {/* Menu Toggle Button */}
          <TouchableOpacity
            onPress={toggleMenu}
            style={{
              padding: 10,
              justifyContent: "center",
              alignItems: "center",
              minWidth: 44,
            }}
          >
            <Icon name="menu" size={24} color={theme.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Expanded Menu */}
      {isExpanded && (
        <View style={{ flex: 1, paddingTop: 20 }}>
          {/* Arrow at top */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity onPress={toggleMenu}>
              <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                <Icon name="keyboard-arrow-down" size={24} color={theme.textFaded} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  borderBottomWidth: index < menuItems.length - 1 ? 0.5 : 0,
                  borderBottomColor: theme.borderDark,
                }}
              >
                <Icon name={item.icon} size={20} color={theme.textFaded} style={{ marginRight: 16 }} />
                <Text
                  style={{
                    color: theme.white,
                    fontSize: 16,
                    flex: 1,
                    fontWeight: "400",
                  }}
                >
                  {item.label}
                </Text>
                {item.label !== "Log Out" && <Icon name="chevron-right" size={20} color={theme.textFaded} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  )
}

export default Header
