import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { theme } from "../../utils/theme"

const Button = ({
  onPress,
  text,
  variant = "primary", // primary, secondary, outline, success, warning, error
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  // Choose button background color directly from tailwind config
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return theme.primary
      case "secondary":
        return theme.secondary
      case "success":
        return theme.success
      case "warning":
        return theme.warning
      case "error":
        return theme.error
      case "outline":
        return "transparent"
      default:
        return theme.primary
    }
  }

  // Choose text color from tailwind config
  const getTextColor = () => {
    if (variant === "outline") return theme.primary
    return theme.white
  }

  // Choose border style using tailwind config colors
  const getBorderStyle = () => {
    if (variant === "outline") {
      return { borderWidth: 2, borderColor: theme.primary }
    }
    return {}
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: getBackgroundColor(),
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        ...getBorderStyle(),
      }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && <Icon name={icon} size={20} color={getTextColor()} style={{ marginRight: text ? 8 : 0 }} />}
          {text && (
            <Text
              style={{
                color: getTextColor(),
                fontSize: 16,
                fontWeight: "600",
                fontFamily: "SpaceGrotesk",
              }}
            >
              {text}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

export default Button
