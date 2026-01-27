import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { consciousness } from '../core/ConsciousnessEngine';

export const ProfileCreationScreen = ({ navigation }) => {
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [location, setLocation] = useState({
    lat: '',
    lon: '',
    city: '',
  });
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!location.lat || !location.lon) {
      Alert.alert('Location Required', 'Please enter your birth location coordinates');
      return;
    }

    setCalculating(true);

    try {
      const birthData = {
        date: birthDate.toISOString().split('T')[0],
        time: birthTime.toTimeString().split(' ')[0],
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
      };

      const profile = await consciousness.calculateProfile(birthData);
      
      // Save profile locally
      // TODO: Also sync to backend
      
      Alert.alert(
        'Profile Created!',
        `Your dominant field is ${profile.dominant.field}`,
        [
          {
            text: 'View Profile',
            onPress: () => navigation.navigate('Profile', { profile }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Calculation Error', error.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Your Consciousness Profile</Text>
      <Text style={styles.subtitle}>
        We'll calculate your 9-field resonance pattern
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Birth Date</Text>
        <DateTimePicker
          value={birthDate}
          mode="date"
          display="default"
          onChange={(event, date) => date && setBirthDate(date)}
          style={styles.picker}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Birth Time (as precise as possible)</Text>
        <DateTimePicker
          value={birthTime}
          mode="time"
          display="default"
          onChange={(event, time) => time && setBirthTime(time)}
          style={styles.picker}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Birth Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#666"
          value={location.city}
          onChangeText={(city) => setLocation({ ...location, city })}
        />
        <View style={styles.coordsRow}>
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Latitude"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={location.lat}
            onChangeText={(lat) => setLocation({ ...location, lat })}
          />
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Longitude"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={location.lon}
            onChangeText={(lon) => setLocation({ ...location, lon })}
          />
        </View>
        <Text style={styles.hint}>
          Don't know your coordinates? Search "{location.city || 'your city'} coordinates"
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, calculating && styles.buttonDisabled]}
        onPress={handleCalculate}
        disabled={calculating}
      >
        <Text style={styles.buttonText}>
          {calculating ? 'Calculating Fields...' : 'Calculate My Profile'}
        </Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoText}>
          • We calculate your unique 9-field consciousness pattern
        </Text>
        <Text style={styles.infoText}>
          • Each field uses a different astrological method (Sidereal, Tropical, Draconic)
        </Text>
        <Text style={styles.infoText}>
          • Your profile becomes searchable for resonance matches
        </Text>
        <Text style={styles.infoText}>
          • Upgrade to Premium to see full compatibility analysis
        </Text>
      </View>
    </ScrollView>
  );
};

export const MatchingScreen = ({ route }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = route.params || {};

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // TODO: Fetch other profiles from backend
      // For now, generate sample matches
      const sampleProfiles = await generateSampleProfiles(5);
      
      const calculatedMatches = [];
      for (const profile of sampleProfiles) {
        const resonance = consciousness.calculateResonance(userProfile, profile);
        calculatedMatches.push({
          profile,
          ...resonance,
        });
      }

      setMatches(calculatedMatches.sort((a, b) => b.overall - a.overall));
    } catch (error) {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Finding your resonance matches...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Resonance Matches</Text>
      <Text style={styles.subtitle}>
        Sorted by field compatibility
      </Text>

      {matches.map((match, i) => (
        <View key={i} style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>
              {match.profile.dominant.field} Dominant
            </Text>
            <Text style={styles.matchResonance}>
              {(match.overall * 100).toFixed(0)}% Match
            </Text>
          </View>
          
          <Text style={styles.matchCompatibility}>
            {match.compatibility}
          </Text>

          <View style={styles.resonantFields}>
            <Text style={styles.resonantFieldsTitle}>Resonant Fields:</Text>
            {match.fields.map((field, j) => (
              <Text key={j} style={styles.resonantField}>
                • {field.field} ({field.type})
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Full Profile</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

// Helper to generate sample profiles for testing
async function generateSampleProfiles(count) {
  const profiles = [];
  
  for (let i = 0; i < count; i++) {
    const birthData = {
      date: `199${i}-0${(i % 9) + 1}-15`,
      time: `${10 + i}:30:00`,
      lat: 40 + Math.random() * 10,
      lon: -120 + Math.random() * 10,
    };
    
    profiles.push(await consciousness.calculateProfile(birthData));
  }
  
  return profiles;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#00ff88',
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordInput: {
    flex: 1,
    marginRight: 10,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  picker: {
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoTitle: {
    fontSize: 18,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#00ff88',
  },
  matchCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  matchResonance: {
    fontSize: 20,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  matchCompatibility: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  resonantFields: {
    marginBottom: 15,
  },
  resonantFieldsTitle: {
    fontSize: 14,
    color: '#00ff88',
    marginBottom: 5,
  },
  resonantField: {
    fontSize: 12,
    color: '#bbb',
    marginLeft: 10,
  },
  viewButton: {
    backgroundColor: '#222',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
  },
});
