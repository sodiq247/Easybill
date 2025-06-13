"use client"

import { useState } from "react"
import { View, TextInput, Text, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { theme } from "../../utils/theme"

const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  onIconPress,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  // Choose border color based on state using tailwind config colors
  const getBorderColor = () => {
    if (error) return theme.error
    if (isFocused) return theme.primary
    return theme.border
  }

  // Choose icon color using tailwind config colors
  const getIconColor = () => {
    if (error) return theme.error
    if (isFocused) return theme.primary
    return theme.text
  }

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.text,
            marginBottom: 6,
            marginLeft: 16,
            fontFamily: "Lufga",
          }}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: getBorderColor(),
          borderRadius: 8,
          backgroundColor: disabled ? theme.gray[100] : theme.white,
          paddingHorizontal: 12,
        }}
      >
        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.gray[400]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.text,
            fontFamily: "Lufga",
          }}
        />

        {/* Icon */}
        {icon && (
          <TouchableOpacity onPress={onIconPress} disabled={!onIconPress}>
            <Icon name={icon} size={24} color={getIconColor()} />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: theme.error,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}

export default Input
