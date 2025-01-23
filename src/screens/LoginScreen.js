import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import accountServices from '../services/auth.services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigation = useNavigation();

  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (e) {
      console.error('Error saving token:', e);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    const data = { username: email, password };

    try {
      const result = await accountServices.login(data);
      console.log('Login result:', result);
      
      if (result.body.loggedIn === true ) {
        await saveToken(result.body.access_token);

        Alert.alert('Success', 'Login successful!');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }, 500);
      } else {
        Alert.alert('Error', result.data?.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const result = await accountServices.requestPasswordReset({ username: resetEmail });
      console.log('requestPasswordReset result', result);

      if (result.code === 200 || result.data?.message === 'Email sent') {
        Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
        setShowReset(false);
      } else {
        Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="px-4 py-6 bg-gray-100 flex-1" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <Text className="text-2xl font-bold mb-4 text-center">Login</Text>
      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text className="text-blue-500 text-center mb-4">Go to Signup</Text>
      </TouchableOpacity>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
        secureTextEntry
        className="p-3 mb-5 border border-gray-300 rounded-lg bg-white"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <CustomButton title="Login" onPress={handleSubmit} style="bg-blue-500" />
      )}

      <TouchableOpacity onPress={() => setShowReset(!showReset)}>
        <Text className="text-blue-500 text-center mt-4">Forgot Password?</Text>
      </TouchableOpacity>
      
      {showReset && (
        <View className="mt-4">
          <TextInput
            value={resetEmail}
            onChangeText={setResetEmail}
            placeholder="Enter your email to reset password"
            keyboardType="email-address"
            autoCapitalize="none"
            className="p-3 mb-3 border border-gray-300 rounded-lg bg-white"
          />
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <CustomButton title="Reset Password" onPress={forgotPassword} style="bg-green-500" />
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default LoginScreen;
