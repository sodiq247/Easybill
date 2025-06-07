import React from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { useFonts } from 'expo-font'; // ✅ Correct import
import MainNavigator from "./src/navigation/MainNavigator";
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icon

const App = () => {
  const [fontsLoaded] = useFonts({  // ✅ Correct function
    Lufga: require('./assets/font/LufgaRegular.ttf'),
    SpaceGrotesk: require('./assets/font/Space-Grotesk.ttf'),
  });
  

  if (!fontsLoaded) {
    return null; // Return a loading state until the font loads
  }

  // WhatsApp number in international format (without +)
  const whatsappNumber = "+2348105082299"; // Replace with your WhatsApp number

  const handleWhatsAppClick = () => {
    const url = `whatsapp://send?phone=${whatsappNumber}`;
    Linking.openURL(url).catch((err) => console.error("Error opening WhatsApp: ", err));
  };

  return (
    <>
      <MainNavigator />
      
      {/* WhatsApp Icon */}
      <View style={{ position: 'absolute', bottom: 20, right: 20, display: 'none'  }}>
        <TouchableOpacity onPress={handleWhatsAppClick}>
          <Icon name="whatsapp" size={40} color="#25D366" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default App;
