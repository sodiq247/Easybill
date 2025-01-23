import React, { useRef } from 'react';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import { View, TouchableOpacity, Text } from 'react-native';

function PaywithPaystack () {
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>();

  return (
    <View style={{ flex: 1 }}>
      <Paystack
        paystackKey="your-public-key-here"
        billingEmail="paystackwebview@something.com"
        amount={'25000.00'}
        onCancel={(e) => {
          console.log('Payment Cancelled', e);
        }}
        onSuccess={(res) => {
          console.log('Payment Successful', res);
        }}
        ref={paystackWebViewRef}
      />

      <TouchableOpacity onPress={() => paystackWebViewRef.current.startTransaction()}>
        <Text>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default PaywithPaystack;
