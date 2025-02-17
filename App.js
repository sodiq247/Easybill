import React from "react";
import "./App.css";
import { useFonts } from 'expo-font'; // ✅ Correct import
import MainNavigator from "./src/navigation/MainNavigator";

const App = () => {
  const [fontsLoaded] = useFonts({  // ✅ Correct function
    Lufga: require('./assets/font/LufgaRegular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Return a loading state until the font loads
  }

  return <MainNavigator />;
};

export default App;
