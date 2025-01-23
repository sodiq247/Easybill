import React from 'react';
import { Text, TouchableOpacity, ScrollView, View } from 'react-native';

const services = [
  { id: 1, label: 'Electricity' },
  { id: 2, label: 'Water' },
  { id: 3, label: 'Internet' },
  { id: 4, label: 'Gas' },
  // Add more services as required
];

const ServiceSelector = ({ selectedService, setSelectedService }) => {
  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-center mb-4">Select Service</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-4">
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              className={`px-6 py-2 rounded-full border-2 ${
                selectedService?.id === service.id
                  ? 'bg-green-500 border-green-500'
                  : 'bg-gray-200 border-gray-300'
              }`}
              onPress={() => handleSelectService(service)}
            >
              <Text
                className={`${
                  selectedService?.id === service.id
                    ? 'text-white'
                    : 'text-gray-800'
                } text-sm`}
              >
                {service.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {selectedService && (
        <Text className="mt-4 text-center text-green-500 text-lg">
          Selected Service: {selectedService.label}
        </Text>
      )}
    </View>
  );
};

export default ServiceSelector;
