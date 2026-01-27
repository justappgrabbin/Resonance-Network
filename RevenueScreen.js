import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

/**
 * Revenue System - Subscriptions + Consultations
 * 
 * This is where you make money.
 * - Free tier: Basic profile only
 * - Premium: Full 9-field charts, resonance matching
 * - Professional: AI insights, priority matching, consultation credits
 */

const TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic profile',
      'View your primary field',
      'Limited matches per day (3)',
    ],
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    features: [
      'Full 9-field consciousness chart',
      'Unlimited resonance matching',
      'Field compatibility analysis',
      'Chart export & sharing',
      'Monthly insights report',
    ],
  },
  professional: {
    name: 'Professional',
    price: 29.99,
    features: [
      'Everything in Premium',
      'AI-powered consciousness coaching',
      'Priority in matching algorithm',
      '1 consultation credit/month ($150 value)',
      'Direct messaging with high matches',
      'Custom field analysis',
    ],
  },
};

export const RevenueScreen = ({ navigation }) => {
  const [selectedTier, setSelectedTier] = useState(null);

  const handleSubscribe = (tier) => {
    // TODO: Integrate with payment processor (Stripe, RevenueCat, etc.)
    Alert.alert(
      'Subscribe',
      `Subscribe to ${tier.name} for $${tier.price}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            console.log(`Processing subscription: ${tier.name}`);
            // Payment processing goes here
          },
        },
      ]
    );
  };

  const handleBookConsultation = () => {
    navigation.navigate('Consultation');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Unlock Your Full Consciousness Profile</Text>
      <Text style={styles.subtitle}>
        Choose the plan that resonates with your journey
      </Text>

      {Object.entries(TIERS).map(([key, tier]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.tierCard,
            selectedTier === key && styles.tierCardSelected,
          ]}
          onPress={() => setSelectedTier(key)}
        >
          <View style={styles.tierHeader}>
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierPrice}>
              {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
            </Text>
          </View>

          <View style={styles.features}>
            {tier.features.map((feature, i) => (
              <Text key={i} style={styles.feature}>
                ✓ {feature}
              </Text>
            ))}
          </View>

          {tier.price > 0 && (
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => handleSubscribe(tier)}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.consultationSection}>
        <Text style={styles.consultationTitle}>
          1-on-1 Consciousness Consultation
        </Text>
        <Text style={styles.consultationDesc}>
          Deep dive into your 9-field system with personalized guidance.
          Perfect for understanding complex field interactions and life transitions.
        </Text>
        <View style={styles.consultationPricing}>
          <Text style={styles.consultationPrice}>$150/hour</Text>
          <Text style={styles.consultationNote}>
            (Free with Professional tier)
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookConsultation}
        >
          <Text style={styles.bookButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All subscriptions include 7-day free trial
        </Text>
        <Text style={styles.footerText}>Cancel anytime, no questions asked</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  tierCard: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#222',
  },
  tierCardSelected: {
    borderColor: '#00ff88',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  tierPrice: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  features: {
    marginBottom: 15,
  },
  feature: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
    paddingLeft: 10,
  },
  subscribeButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consultationSection: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  consultationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  consultationDesc: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 15,
    lineHeight: 20,
  },
  consultationPricing: {
    marginBottom: 15,
  },
  consultationPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  consultationNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  bookButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});
