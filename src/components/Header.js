import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icons from MaterialIcons

const Header = ({ toggleSidebar, reloadData, logout }) => {
  return (
    <View style={{ flexDirection: 'row', zIndex: 5,  alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#14172A', paddingTop: 40, padding: 16 }}>
      
      <Text style={{ fontFamily: 'Lufga', color: 'white', fontSize: 24, fontWeight: '600' }}>EasyBill</Text>
      
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {/* Refresh icon */}
        <TouchableOpacity onPress={reloadData}>
          <Icon name="refresh" size={28} color="white" />
        </TouchableOpacity>
        
        {/* Logout icon */}
        <TouchableOpacity onPress={logout}>
          <Icon name="exit-to-app" size={28} color="white" />
        </TouchableOpacity>
        
        {/* Menu icon */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
