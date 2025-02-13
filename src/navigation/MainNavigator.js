import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import DataScreen from '../screens/DataScreen';
import AirtimeScreen from '../screens/AirtimeScreen';
import CableTvScreen from '../screens/CableTvScreen';
import ElectricityScreen from '../screens/ElectricityScreen';
import TransactionHistory from '../components/TransactionHistory';
// import { WalletProvider } from '../components/Wallet';
import { NavigationContainer } from '@react-navigation/native';
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    // <WalletProvider>
    <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Data" component={DataScreen} />
        <Stack.Screen name="Airtime" component={AirtimeScreen} />
        <Stack.Screen name="CableTv" component={CableTvScreen} />
        <Stack.Screen name="Electricity" component={ElectricityScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
        </Stack.Navigator>
    </NavigationContainer>
    // </WalletProvider>
  );
};

export default MainNavigator;
