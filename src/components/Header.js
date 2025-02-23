import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { RefreshCcw, LogOut, Menu } from "lucide-react-native";

const Header = ({ toggleSidebar, reloadData, logout }) => {
  return (
    <View className="flex-row  items-center justify-between bg-[#14172A] p-5">
      
      <Text className="text-white text-3xl font-semibold">EasyPay</Text>
      <View className="flex-row gap-5">
        <TouchableOpacity onPress={reloadData}>
          <RefreshCcw size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <LogOut size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSidebar}>
        <Menu size={28} color="white" />
      </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
