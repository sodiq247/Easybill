import { View, StyleSheet } from "react-native"
import { theme } from "../utils/theme"

const AppBackground = ({ children, style }) => {
  return <View style={[styles.background, style]}>{children}</View>
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.background, // Using our theme background color
  },
})

export default AppBackground
