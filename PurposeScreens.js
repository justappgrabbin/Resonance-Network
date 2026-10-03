import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { profileStore } from './Core/ProfileStore';
import { purposeStore } from './Core/PurposeStore';
import {
  PURPOSE_QUESTIONS,
  buildPurposePathway,
  nextPurposeQuestion,
} from './Core/PurposeEngine';

export function EntryScreen({ navigation }) {
  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, purpose] = await Promise.all([
        profileStore.getCurrent(),
        purposeStore.get(),
      ]);
      if (!alive) return;

      if (purpose.completed && purpose.pathway && profile) {
        navigation.replace('Home');
      } else {
        navigation.replace('Purpose', { profile: profile || null });
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigation]);

  return (
    <View style={styles.entry}>
      <Text style={styles.entryBrand}>RESONANCE</Text>
      <ActivityIndicator color="#8df0d0" style={{ marginTop: 18 }} />
      <Text style={styles.entryText}>Finding your pathway…</Text>
    </View>
  );
}

export default function PurposeScreen({ navigation, route }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [purpose, setPurpose] = useState(null);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [savedProfile, savedPurpose] = await Promise.all([
      route.params?.profile ? Promise.resolve(route.params.profile) : profileStore.getCurrent(),
      purposeStore.get(),
    ]);
    setProfile(savedProfile || null);
    setPurpose(savedPurpose);
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, route.params?.profile]);

  const answers = purpose?.answers || {};
  const currentQuestion = useMemo(() => nextPurposeQuestion(answers), [answers]);
  const allAnswered = !currentQuestion;

  useEffect(() => {
    if (!purpose || purpose.completed || !allAnswered || !profile) return;

    let alive = true;
    (async () => {
      setSaving(true);
      await purposeStore.attachProfile(profile.id);
      const pathway = buildPurposePathway(profile, purpose.answers);
      const next = await purposeStore.complete(profile.id, pathway);
      if (alive) {
        setPurpose(next);
        setSaving(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [allAnswered, profile, purpose?.completed]);

  const send = async () => {
    const value = input.trim();
    if (!value || !currentQuestion || saving) return;

    setSaving(true);
    const next = await purposeStore.answer(currentQuestion.key, value);
    setPurpose(next);
    setInput('');
    setSaving(false);
  };

  const createProfile = () => {
    navigation.navigate('CreateProfile', {
      returnTo: 'Purpose',
      name: answers.name || '',
    });
  };

  if (!purpose) {
    return (
      <View style={styles.entry}>
        <ActivityIndicator color="#8df0d0" />
        <Text style={styles.entryText}>Opening Cynthia…</Text>
      </View>
    );
  }

  if (purpose.completed && purpose.pathway && profile) {
    const p = purpose.pathway;
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PURPOSE FULFILLMENT · CURRENT PATHWAY</Text>
        <Text style={styles.title}>{answers.name || profile.name}, here is where we start.</Text>
        <Text style={styles.body}>
          This is not a verdict about who you are. It is the next test Resonance chose from what you told Cynthia plus the same Human Design profile used everywhere else in the app.
        </Text>

        <View style={styles.pathwayCard}>
          <Text style={styles.stage}>{p.stage}</Text>
          <Text style={styles.pathwayHeadline}>{p.headline}</Text>

          <Label title="WHERE YOU ARE" value={p.currentState} />
          <Label title="WHERE YOU WANT TO GO" value={p.destination} />
          <Label title="FRICTION" value={p.friction} />

          <View style={styles.designCard}>
            <Text style={styles.designTitle}>Design lens</Text>
            <Text style={styles.designMeta}>
              {p.design?.type || profile.humanDesign?.type} · {p.design?.strategy || profile.humanDesign?.strategy}
            </Text>
            <Text style={styles.designMeta}>
              {p.design?.authority || profile.humanDesign?.authority} Authority · Profile {p.design?.profile || profile.humanDesign?.profile}
            </Text>
          </View>

          <Text style={styles.nextLabel}>NEXT MOVE</Text>
          <Text style={styles.nextMove}>{p.nextMove}</Text>
          <Text style={styles.check}>{p.decisionCheck}</Text>
        </View>

        <Text style={styles.returnLabel}>BRING REALITY BACK</Text>
        <Text style={styles.body}>{p.evidenceToBringBack}</Text>

        <TouchableOpacity style={styles.primary} onPress={() => navigation.replace('Home')}>
          <Text style={styles.primaryText}>Enter Resonance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Cynthia')}>
          <Text style={styles.secondaryText}>Open resident Cynthia</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent}>
        <Text style={styles.eyebrow}>FIRST CONTACT</Text>
        <Text style={styles.title}>Cynthia is building your pathway with you.</Text>
        <Text style={styles.body}>
          This conversation writes local state. It is not a decorative chatbot. Your answers become part of the pathway Resonance carries forward.
        </Text>

        {PURPOSE_QUESTIONS.map(q => {
          const answer = answers[q.key];
          if (!answer) return null;
          return (
            <View key={q.key}>
              <Bubble speaker="Cynthia" text={q.prompt} />
              <Bubble user speaker={answers.name || 'You'} text={answer} />
              {q.key === 'name' ? (
                <Bubble
                  speaker="Cynthia"
                  text="Nice to meet you. I’m writing this down locally. When we calculate your design, we do it once and the same profile feeds the rest of Resonance."
                />
              ) : null}
            </View>
          );
        })}

        {currentQuestion ? (
          <Bubble speaker="Cynthia" text={currentQuestion.prompt} />
        ) : null}

        {allAnswered && !profile ? (
          <View style={styles.profilePrompt}>
            <Text style={styles.profileTitle}>Now I need your design.</Text>
            <Text style={styles.profileBody}>
              The questions tell Resonance where you believe you are. Your one local Human Design + astrology calculation gives the system the design layer. We reuse that calculation everywhere; Purpose does not invent another one.
            </Text>
            <TouchableOpacity style={styles.primary} onPress={createProfile}>
              <Text style={styles.primaryText}>Calculate my design once</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {allAnswered && profile && saving ? (
          <View style={styles.thinking}>
            <ActivityIndicator color="#8df0d0" />
            <Text style={styles.thinkingText}>Cynthia is combining your answers with your existing design…</Text>
          </View>
        ) : null}
      </ScrollView>

      {currentQuestion ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="#60746f"
            multiline
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.send, (!input.trim() || saving) && styles.sendDisabled]}
            disabled={!input.trim() || saving}
            onPress={send}
          >
            <Text style={styles.sendText}>{saving ? '…' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function Bubble({ speaker, text, user = false }) {
  return (
    <View style={[styles.bubbleWrap, user && styles.bubbleWrapUser]}>
      <Text style={[styles.speaker, user && styles.speakerUser]}>{speaker}</Text>
      <View style={[styles.bubble, user && styles.userBubble]}>
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function Label({ title, value }) {
  return (
    <View style={styles.labelBlock}>
      <Text style={styles.labelTitle}>{title}</Text>
      <Text style={styles.labelValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: { flex: 1, backgroundColor: '#07100f', alignItems: 'center', justifyContent: 'center', padding: 28 },
  entryBrand: { color: '#8df0d0', fontWeight: '900', fontSize: 24, letterSpacing: 3 },
  entryText: { color: '#718782', marginTop: 12 },

  root: { flex: 1, backgroundColor: '#07100f' },
  content: { padding: 22, paddingBottom: 54 },
  chat: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 28 },
  eyebrow: { color: '#8df0d0', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  title: { color: '#f4fbf9', fontSize: 31, lineHeight: 37, fontWeight: '900', marginTop: 8 },
  body: { color: '#98ada8', fontSize: 14, lineHeight: 22, marginTop: 10 },

  bubbleWrap: { marginTop: 18, maxWidth: '88%' },
  bubbleWrapUser: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  speaker: { color: '#8df0d0', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  speakerUser: { color: '#899f99' },
  bubble: { backgroundColor: '#0d1b19', borderColor: '#28443e', borderWidth: 1, borderRadius: 17, borderTopLeftRadius: 5, padding: 14 },
  userBubble: { backgroundColor: '#172522', borderColor: '#315047', borderTopLeftRadius: 17, borderTopRightRadius: 5 },
  bubbleText: { color: '#e5f2ef', fontSize: 15, lineHeight: 22 },

  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#17302c', backgroundColor: '#091412', padding: 12 },
  input: { flex: 1, minHeight: 48, maxHeight: 132, backgroundColor: '#0d1b19', borderWidth: 1, borderColor: '#28443e', borderRadius: 15, color: '#f4fbf9', paddingHorizontal: 14, paddingVertical: 12 },
  send: { backgroundColor: '#8df0d0', borderRadius: 14, minHeight: 48, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.35 },
  sendText: { color: '#07100f', fontWeight: '900' },

  profilePrompt: { marginTop: 22, backgroundColor: '#0d1b19', borderWidth: 1, borderColor: '#28443e', borderRadius: 18, padding: 17 },
  profileTitle: { color: '#f4fbf9', fontSize: 20, fontWeight: '900' },
  profileBody: { color: '#8ea49f', fontSize: 13, lineHeight: 20, marginTop: 7 },
  primary: { backgroundColor: '#8df0d0', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 15 },
  primaryText: { color: '#07100f', fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: '#2c4c45', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 11 },
  secondaryText: { color: '#8df0d0', fontWeight: '900' },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 22 },
  thinkingText: { color: '#8ea49f', flex: 1 },

  pathwayCard: { backgroundColor: '#0d1b19', borderColor: '#31564d', borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 20 },
  stage: { color: '#8df0d0', fontWeight: '900', fontSize: 11, letterSpacing: 2 },
  pathwayHeadline: { color: '#f4fbf9', fontSize: 21, lineHeight: 28, fontWeight: '900', marginTop: 8 },
  labelBlock: { marginTop: 18 },
  labelTitle: { color: '#6f8b84', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  labelValue: { color: '#dcebe7', fontSize: 14, lineHeight: 21, marginTop: 4 },
  designCard: { backgroundColor: '#091412', borderWidth: 1, borderColor: '#213c36', borderRadius: 14, padding: 13, marginTop: 18 },
  designTitle: { color: '#8df0d0', fontWeight: '900' },
  designMeta: { color: '#9fb4af', fontSize: 12, lineHeight: 18, marginTop: 3 },
  nextLabel: { color: '#8df0d0', fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginTop: 22 },
  nextMove: { color: '#f4fbf9', fontSize: 17, lineHeight: 25, fontWeight: '800', marginTop: 6 },
  check: { color: '#9eb3ae', fontSize: 13, lineHeight: 20, marginTop: 12 },
  returnLabel: { color: '#8df0d0', fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginTop: 22 },
});
