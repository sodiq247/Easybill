import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import DataScreen from '../screens/DataScreen';
import AirtimeScreen from '../screens/AirtimeScreen';
import CableTvScreen from '../screens/CableTvScreen';
import ElectricityScreen from '../screens/ElectricityScreen';
import TransactionHistory from '../screens/TransactionHistory';
// import { WalletProvider } from '../components/Wallet';
import { NavigationContainer } from '@react-navigation/native';
import ActivationScreen from '../screens/ActivationScreen';
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    // <WalletProvider>
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='LoginScreen'>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="ActivationScreen" component={ActivationScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        <Stack.Screen name="JAMB" component={HomeScreen} />
        <Stack.Screen name="WAEC" component={HomeScreen} />
        <Stack.Screen name="Data" component={DataScreen} />
        <Stack.Screen name="Airtime" component={AirtimeScreen} />
        <Stack.Screen name="CableTv" component={CableTvScreen} />
        <Stack.Screen name="TV" component={CableTvScreen} />
        <Stack.Screen name="Electricity" component={ElectricityScreen} />
        <Stack.Screen name="History" component={TransactionHistory} />
        </Stack.Navigator>
    </NavigationContainer>
    // </WalletProvider>
  );
};

export default MainNavigator;
