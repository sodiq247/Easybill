# VaaPay

A React Native bill payment app using Expo, TailwindCSS, and Nativewind.

## Features
- Select services (airtime, data, electricity, cable TV)
- User-friendly input forms
- Mobile-first responsive design

## Project Structure
Refer to the [Final Folder Structure](#final-folder-structure).

## Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/your-repo/billpaymentapp.git
   cd billpaymentapp

## To Run
npx expo start

## To Build
eas build --platform android

## How to solve this error
Android Bundling failed 214ms index.js (1 module)
error: index.js: C:\Users\Interra\VaaPay\index.js: Use process(css).then(cb) to work with async plugins

## solution the the error
npm uninstall tailwindcss
npm install tailwindcss@3.3.2 --save-exact

