import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { residentAgentClient } from './Core/ResidentAgentClient';

export default function AgentContactScreen({ navigation }) {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const next = await residentAgentClient.probe();
    setStatus(next);
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = navigation?.addListener?.('focus', refresh);
    return unsubscribe;
  }, [navigation, refresh]);

  const open = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (!supported) return;
    await Linking.openURL(url);
  };

  const online = Boolean(status?.online);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>YOUR RESIDENT ISOHUMAN</Text>
      <Text style={styles.title}>Cynthia</Text>
      <Text style={styles.body}>
        Resonance does not create another Cynthia here. This screen contacts the
        same local resident that is already living in the Synthia organism.
      </Text>

      <View style={styles.presence}>
        <View style={[styles.dot, online ? styles.onlineDot : styles.offlineDot]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.presenceTitle}>
            {checking ? 'Checking resident…' : online ? 'Resident online' : 'Resident not running'}
          </Text>
          <Text style={styles.presenceMeta}>
            {online
              ? 'Text and Peek open the live resident on this device.'
              : 'Start the local Synthia residence, then check again. Resonance will not fabricate a fallback agent.'}
          </Text>
        </View>
        {checking ? <ActivityIndicator color="#8df0d0" /> : null}
      </View>

      <Action
        title="Text"
        caption="Talk to the Cynthia who is actually living in the organism."
        enabled={online}
        onPress={() => open(residentAgentClient.textUrl())}
      />
      <Action
        title="Peek"
        caption="Open her current living-world view without creating a second session."
        enabled={online}
        onPress={() => open(residentAgentClient.peekUrl())}
      />

      <View style={styles.row}>
        <Action
          compact
          title="Voice Call"
          caption="Media bridge not wired yet."
          enabled={false}
        />
        <Action
          compact
          title="Video Call"
          caption="Media bridge not wired yet."
          enabled={false}
        />
      </View>

      <TouchableOpacity style={styles.secondary} onPress={refresh}>
        <Text style={styles.secondaryText}>Check resident again</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Rule for this branch: if the resident is unavailable, Resonance says so.
        It does not substitute canned replies, a cloud chatbot, or a duplicate agent.
      </Text>
    </ScrollView>
  );
}

function Action({ title, caption, enabled = true, onPress, compact = false }) {
  return (
    <TouchableOpacity
      disabled={!enabled}
      onPress={onPress}
      style={[
        styles.action,
        compact && styles.compact,
        !enabled && styles.disabled,
      ]}
    >
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionCaption}>{caption}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07100f' },
  content: { padding: 22, paddingBottom: 48 },
  eyebrow: { color: '#8df0d0', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  title: { color: '#f4fbf9', fontSize: 38, fontWeight: '900', marginTop: 8 },
  body: { color: '#98ada8', fontSize: 15, lineHeight: 23, marginTop: 8 },
  presence: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0d1b19', borderWidth: 1, borderColor: '#28443e', borderRadius: 18, padding: 16, marginTop: 22 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  onlineDot: { backgroundColor: '#8df0d0' },
  offlineDot: { backgroundColor: '#786f70' },
  presenceTitle: { color: '#e9f8f4', fontSize: 16, fontWeight: '900' },
  presenceMeta: { color: '#76908a', marginTop: 3, lineHeight: 18 },
  action: { backgroundColor: '#0b1715', borderWidth: 1, borderColor: '#1e3732', borderRadius: 16, padding: 17, marginTop: 12, minHeight: 92, justifyContent: 'center' },
  compact: { flex: 1, minHeight: 106 },
  disabled: { opacity: 0.45 },
  actionTitle: { color: '#e9f8f4', fontSize: 18, fontWeight: '900' },
  actionCaption: { color: '#76908a', fontSize: 12, lineHeight: 17, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  secondary: { borderWidth: 1, borderColor: '#28443e', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 18 },
  secondaryText: { color: '#8df0d0', fontWeight: '900' },
  note: { color: '#667f79', fontSize: 11, lineHeight: 17, marginTop: 18 },
});
