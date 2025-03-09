import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Phone, Database, Tv, LogOut, Zap, Home, X } from "lucide-react-native";

const Sidebar = ({ isVisible, toggleSidebar, logout }) => {
  const navigation = useNavigation();

  if (!isVisible) return null;

  const services = [
    { name: "Home", icon: <Home size={24} color="white" /> },
    { name: "Data", icon: <Database size={24} color="white" /> },
    { name: "Airtime", icon: <Phone size={24} color="white" /> },
    { name: "CableTv", icon: <Tv size={24} color="white" /> },
    { name: "Electricity", icon: <Zap size={24} color="white" /> },
  ];


  return (
    <View className="absolute z-10 left-0 top-0 bottom-0 w-64 bg-[#1F233B] p-6 shadow-lg">
      <TouchableOpacity onPress={toggleSidebar} className="mb-6 self-end">
        <X size={28} color="white" />
      </TouchableOpacity>
      <Text className="text-white mt-[20px] text-2xl font-semibold mb-7">
        Menu
      </Text>
      {services.map((service) => (
        <TouchableOpacity
          key={service.name}
          className="flex-row items-center gap-3 bg-[#14172A] p-4 rounded-lg mb-5"
          onPress={() => {
            navigation.navigate(service.name);
            toggleSidebar();
          }}
        >
          {service.icon}
          <Text className="text-white text-lg font-medium">{service.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={logout} className=" flex-row gap-3 mt-[100px] bg-[#14172A] p-4 rounded-lg">
        <LogOut size={28} color="white"  />
        <Text className="text-white font-semibold text-[18px]">LogOut</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sidebar;
