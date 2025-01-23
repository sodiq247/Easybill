import React, { createContext, useContext, useReducer, useEffect } from 'react';
import accountServices from '../services/auth.services'
import { Alert } from 'react-native'; // React Native alert for error handling

// Action types
const SET_BALANCE_AND_NAME = 'SET_BALANCE_AND_NAME';
const SET_ERROR = 'SET_ERROR';

// Reducer function
const walletReducer = (state, action) => {
  switch (action.type) {
    case SET_BALANCE_AND_NAME:
      return { 
        ...state, 
        balance: action.payload.balance, 
        name: action.payload.name, 
        lastname: action.payload.lastname 
      };
    case SET_ERROR:
      return { ...state, errorMessage: action.payload };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  balance: 0,
  name: '',
  lastname: '',
  errorMessage: '',
};

// Create a context
const WalletContext = createContext(initialState);

// Create a provider component
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const fetchWalletBalance = async () => {
    try {
      const result = await accountServices.walletBalance();
      const balance = result.Wallet.amount; // Adjust based on actual response
      const name = result.Profile.firstname;
      const lastname = result.Profile.lastname;
      console.log("wallet result", result)
      dispatch({ 
        type: SET_BALANCE_AND_NAME, 
        payload: { balance, name, lastname } 
      });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      dispatch({
        type: SET_ERROR,
        payload: 'Failed to fetch wallet balance. Please try again.',
      });
      Alert.alert('Error', 'Failed to fetch wallet balance. Please try again.');
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  return (
    <WalletContext.Provider value={{ state, dispatch, fetchWalletBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use Wallet context
export const useWallet = () => {
  return useContext(WalletContext);
};
