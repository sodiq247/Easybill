import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
// Importing icons from react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons'; // You can change to any icon set you like

const Sidebar = ({ isVisible, toggleSidebar, logout }) => {
  const navigation = useNavigation();

  if (!isVisible) return null;

  const services = [
    { name: "Home", icon: <Icon name="home" size={24} color="white" /> },
    { name: "Data", icon: <Icon name="storage" size={24} color="white" /> },
    { name: "Airtime", icon: <Icon name="phone" size={24} color="white" /> },
    { name: "CableTv", icon: <Icon name="tv" size={24} color="white" /> },
    { name: "Electricity", icon: <Icon name="flash-on" size={24} color="white" /> },
    { name: "History", icon: <Icon name="history" size={24} color="white" /> },
  ];

  return (
    <View style={{ position: 'absolute', zIndex: 10, left: 0, top: 0, bottom: 0, width: 250, backgroundColor: '#14172A', paddingTop: 0, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1 }}>
      <TouchableOpacity onPress={toggleSidebar} style={{ marginBottom: 24, marginTop: 0, alignSelf: 'flex-end' }}>
        <Icon name="close" size={28} color="white" />
      </TouchableOpacity>
      <Text style={{ color: 'white', marginTop: 20, fontSize: 24, fontWeight: '600', marginBottom: 28 }}>
        Menu
      </Text>
      {services.map((service) => (
        <TouchableOpacity
          key={service.name}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1F233B', padding: 16, borderRadius: 8, marginBottom: 20
          }}
          onPress={() => {
            navigation.navigate(service.name);
            toggleSidebar();
          }}
        >
          {service.icon}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>{service.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', gap: 12, marginTop: 60, backgroundColor: '#1F233B', padding: 16, borderRadius: 8 }}>
        <Icon name="logout" size={28} color="white" />
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>LogOut</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sidebar;
