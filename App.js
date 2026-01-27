import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SystemBootstrap } from './core/SystemBootstrap';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

/**
 * RESONANCE NETWORK - Self-Evolving Mobile App
 * 
 * This app auto-scaffolds missing modules on boot.
 * Drop components into /modules and they auto-register.
 */

export default function App() {
  const [systemReady, setSystemReady] = useState(false);
  const [bootLog, setBootLog] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    bootstrapSystem();
  }, []);

  const bootstrapSystem = async () => {
    try {
      const bootstrap = new SystemBootstrap();
      
      bootstrap.on('log', (msg) => {
        setBootLog(prev => [...prev, msg]);
      });

      const discoveredModules = await bootstrap.init();
      setModules(discoveredModules);
      setSystemReady(true);
    } catch (error) {
      console.error('Bootstrap failed:', error);
      setBootLog(prev => [...prev, `ERROR: ${error.message}`]);
    }
  };

  if (!systemReady) {
    return (
      <View style={styles.bootScreen}>
        <Text style={styles.title}>⚛️ RESONANCE NETWORK</Text>
        <Text style={styles.subtitle}>Initializing Consciousness Fields...</Text>
        <ActivityIndicator size="large" color="#00ff88" style={styles.spinner} />
        <View style={styles.logContainer}>
          {bootLog.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#00ff88',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Chart" component={ChartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder screens - these will be auto-scaffolded
const HomeScreen = ({ navigation }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Resonance Network</Text>
    <Text style={styles.info}>Self-building system active</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Your Field Profile</Text>
  </View>
);

const MatchesScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Resonance Matches</Text>
  </View>
);

const ChartScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Consciousness Chart</Text>
  </View>
);

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 30,
  },
  logContainer: {
    width: '100%',
    maxHeight: 200,
  },
  logText: {
    fontSize: 10,
    color: '#00ff88',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#888',
  },
});
