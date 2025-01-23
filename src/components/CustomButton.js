import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CustomButton = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} className={`p-4 rounded-lg ${style}`}>
    <Text className="text-white text-center text-lg font-semibold">{title}</Text>
  </TouchableOpacity>
);

export default CustomButton;
