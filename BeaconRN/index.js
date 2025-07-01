/**
 * Beacon Emergency App - React Native Entry Point
 * 
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// Register the main app component
AppRegistry.registerComponent(appName, () => App);
