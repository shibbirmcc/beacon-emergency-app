/**
 * Main App Component
 * Entry point for the Beacon Emergency React Native app
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>🚨 Beacon Emergency App</Text>
          <Text style={styles.subtitle}>React Native Version</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Phase 1 Complete</Text>
            <Text style={styles.sectionText}>
              ✅ Project structure created{'\n'}
              ✅ TypeScript interfaces defined{'\n'}
              ✅ Service layer architecture{'\n'}
              ✅ Core dependencies configured{'\n'}
              ✅ Development environment ready
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠️ Next Steps</Text>
            <Text style={styles.sectionText}>
              • Install React Native dependencies{'\n'}
              • Set up Android/iOS project files{'\n'}
              • Configure native modules{'\n'}
              • Implement UI components{'\n'}
              • Integrate Couchbase Lite
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏗️ Architecture</Text>
            <Text style={styles.sectionText}>
              • Offline-first with Couchbase Lite{'\n'}
              • P2P mesh networking{'\n'}
              • Sync Gateway replication{'\n'}
              • Cross-platform TypeScript{'\n'}
              • Redux state management
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
});

export default App;
