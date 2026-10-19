import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { profileStore } from './Core/ProfileStore';
import { lab, LAB_EXPERIMENTS } from './Core/LabEngine';
import { journeyJournal } from './Core/JourneyJournal';
import { makeCultivationBridge } from './Core/CultivationBridge';
import {
  activeGoal, explainRecommendation, pendingRecommendation, rankExperiments
} from './Core/AdaptiveLabPlanner';

const Action = ({ label, onPress, secondary = false, disabled = false }) => (
  <TouchableOpacity disabled={disabled} onPress={onPress}
    style={[styles.action, secondary && styles.secondary, disabled && styles.disabled]}>
    <Text style={[styles.actionText, secondary && styles.secondaryText]}>{label}</Text>
  </TouchableOpacity>
);

export default function AdaptivePathScreen({ navigation, route }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [events, setEvents] = useState([]);
  const [observations, setObservations] = useState([]);
  const [goalText, setGoalText] = useState('');
  const [hdLens, setHdLens] = useState(false);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const p = route.params?.profile || await profileStore.getCurrent();
      setProfile(p);
      if (p) {
        const [history, logged] = await Promise.all([
          journeyJournal.list(p.id), lab.observations(null, p.id)
        ]);
        setEvents(history);
        setObservations(logged);
        const latest = activeGoal(history, p.id);
        if (latest) {
          setGoalText(latest.payload.text);
          setHdLens(latest.payload.useHumanDesign === true);
        }
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, route.params?.profile?.id]);

  const currentGoal = profile && activeGoal(events, profile.id);
  const pending = profile && currentGoal
    ? pendingRecommendation(events, profile.id, currentGoal.id) : null;
  const ranked = useMemo(() => rankExperiments({
    profile,
    goal: currentGoal?.payload?.text,
    experiments: LAB_EXPERIMENTS,
    observations, events,
    useHumanDesign: currentGoal?.payload?.useHumanDesign === true
  }), [profile, currentGoal, observations, events]);
  const chosen = pending && LAB_EXPERIMENTS.find(e => e.id === pending.payload.experimentId);
  const reviews = events.filter(e => e.type === 'review' && e.payload?.rating !== 'not-tried');
  const goalDirty = String(goalText).trim() !== (currentGoal?.payload?.text || '') ||
    hdLens !== (currentGoal?.payload?.useHumanDesign === true);

  const run = async fn => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      const msg = err?.message || String(err);
      setError(msg);
      Alert.alert('Could not save', msg);
    } finally {
      setBusy(false);
    }
  };

  const saveGoal = () => run(async () => {
    const text = goalText.trim();
    if (text.length < 5) throw new Error('Write a specific goal to investigate.');
    if (text.length > 500) throw new Error('Please keep your goal under 500 characters.');
    await journeyJournal.append(profile.id, 'goal', {
      text, useHumanDesign: hdLens
    });
    setNotes('');
  });

  const chooseNext = () => run(async () => {
    const best = ranked[0];
    if (!currentGoal || !best) throw new Error('Save your goal first.');
    // Delegate the lifecycle to the existing SynthAi Computer CultivationEngine.
    const cycle = await makeCultivationBridge(profile.id, events).beginAndAct({
      goal: currentGoal.payload.text,
      experiment: best.experiment,
      evidence: {
        observationIds: observations.map(o => o.id),
        actualReviews: events.filter(e => e.type === 'review' &&
          e.payload?.rating !== 'not-tried').length
      }
    });
    await journeyJournal.append(profile.id, 'recommendation', {
      cycleId: cycle.cycleId,
      goalEventId: currentGoal.id,
      experimentId: best.experiment.id,
      catalogSource: 'Core/LabEngine.js',
      evidence: best.evidence,
      scoreAtSelection: best.score,
      explanation: explainRecommendation(best),
      useHumanDesign: currentGoal.payload.useHumanDesign === true
    });
  });

  const review = rating => run(async () => {
    if (!pending) throw new Error('There is no selected experiment to review.');
    if (notes.length > 2000) throw new Error('Notes must be under 2,000 characters.');
    if (pending.payload.cycleId) {
      await makeCultivationBridge(profile.id, events).integrate({
        cycleId: pending.payload.cycleId,
        experimentId: pending.payload.experimentId,
        rating,
        notes: notes.trim(),
        observationIds: observations
          .filter(o => o.experimentId === pending.payload.experimentId)
          .map(o => o.id)
      });
    }
    await journeyJournal.append(profile.id, 'review', {
      cycleId: pending.payload.cycleId || null,
      goalEventId: currentGoal.id,
      recommendationEventId: pending.id,
      experimentId: pending.payload.experimentId,
      rating, notes: notes.trim()
    });
    setNotes('');
  });

  if (busy && !profile) return <View style={styles.center}>
    <ActivityIndicator color="#8df0d0"/><Text style={styles.meta}>Reading the local learning record…</Text>
  </View>;

  if (!profile) return <View style={styles.center}>
    <Text style={styles.title}>Create a profile first</Text>
    <Action label="Create Profile" onPress={() => navigation.navigate('CreateProfile')}/>
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>;

  return <ScrollView style={styles.container} contentContainerStyle={styles.content}
    keyboardShouldPersistTaps="handled">
    <Text style={styles.kicker}>RESONANCE · EVIDENCE-LED LEARNING</Text>
    <Text style={styles.title}>My adaptive path</Text>
    <Text style={styles.meta}>Learning as {profile.name}. Recommendations use your goal, real Lab
      activity and your own feedback—never invented success scores.</Text>

    <Text style={styles.section}>What do you want to work toward?</Text>
    <TextInput value={goalText} onChangeText={setGoalText}
      placeholder="Write a goal in your own words"
      placeholderTextColor="#70847f" multiline maxLength={500}
      style={styles.input}/>
    <View style={styles.toggleRow}>
      <View style={{flex:1}}>
        <Text style={styles.label}>Include Human Design as a lens</Text>
        <Text style={styles.meta}>Interpretive context, not a personality prediction or proof.</Text>
      </View>
      <Switch value={hdLens} onValueChange={setHdLens}
        trackColor={{true:'#548f7d',false:'#293e39'}} thumbColor="#8df0d0"/>
    </View>
    <Action label={currentGoal ? 'Save Updated Goal' : 'Save Goal'}
      disabled={busy || !goalDirty || goalText.trim().length < 5}
      onPress={saveGoal}/>

    {currentGoal && <View style={styles.card}>
      <Text style={styles.caption}>CURRENT INVESTIGATION</Text>
      <Text style={styles.cardTitle}>{currentGoal.payload.text}</Text>
      <Text style={styles.meta}>Your original SynthAi Cultivation Engine now
        records each investigation from observation through action and outcome.
        Experiment candidates currently come from your existing Lab catalog;
        the full state-space planning runtime is still separate.</Text>
      {!pending ? <Action label="Choose Next Experiment" disabled={busy} onPress={chooseNext}/>
        : <View>
          <Text style={styles.section}>Chosen by your feedback history</Text>
          <Text style={styles.cardTitle}>{chosen?.title || 'Experiment unavailable'}</Text>
          <Text style={styles.meta}>{pending.payload.explanation}</Text>
          {chosen && <Action label="Open This Experiment in the Lab"
            onPress={() => navigation.navigate('Lab', {
              profile, experimentId: chosen.id
            })}/>}
          <Text style={styles.section}>What actually happened?</Text>
          <TextInput value={notes} onChangeText={setNotes}
            placeholder="Optional observation after trying it"
            placeholderTextColor="#70847f" multiline maxLength={2000}
            style={styles.input}/>
          <Action label="This helped" onPress={() => review('helped')} disabled={busy}/>
          <Action label="This didn't help" secondary onPress={() => review('not-helpful')} disabled={busy}/>
          <Action label="I didn't try it" secondary onPress={() => review('not-tried')} disabled={busy}/>
        </View>}
    </View>}

    <Text style={styles.section}>What Synthia has observed</Text>
    <View style={styles.statRow}>
      <View style={styles.stat}><Text style={styles.statBig}>{observations.length}</Text>
        <Text style={styles.meta}>Lab observations</Text></View>
      <View style={styles.stat}><Text style={styles.statBig}>{reviews.length}</Text>
        <Text style={styles.meta}>Experiment reviews</Text></View>
    </View>
    {!!reviews.length && <Text style={styles.meta}>
      {reviews.filter(r=>r.payload?.rating==='helped').length} helpful,
      {' '}{reviews.filter(r=>r.payload?.rating==='not-helpful').length} unhelpful.
      The next selection updates from these observations.
    </Text>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Text style={styles.disclaimer}>
      Pilot scope: local profiles and append-only memory. Manual friend updates
      are available in Community, but not real-time synchronization.
      Honcho and the SocialCircle neural models are not connected.
      A recommendation is a hypothesis until real outcomes support it.
    </Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#07100f'},
  center:{flex:1,backgroundColor:'#07100f',justifyContent:'center',padding:24},
  content:{padding:20,paddingBottom:52},
  kicker:{color:'#8df0d0',fontSize:11,fontWeight:'900',letterSpacing:1.7,marginBottom:8},
  title:{color:'#f5fbfa',fontSize:29,fontWeight:'900',marginBottom:9},
  section:{color:'#eef7f5',fontSize:17,fontWeight:'900',marginTop:20,marginBottom:10},
  meta:{color:'#a1b8b1',fontSize:13,lineHeight:20,marginTop:5},
  label:{color:'#e6f4ef',fontSize:14,fontWeight:'800'},
  input:{backgroundColor:'#10221e',color:'#fff',borderRadius:12,
    borderWidth:1,borderColor:'#2b4941',minHeight:90,
    textAlignVertical:'top',padding:14,marginTop:7},
  toggleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:16},
  action:{padding:14,backgroundColor:'#8df0d0',borderRadius:13,alignItems:'center',marginTop:10},
  secondary:{backgroundColor:'#122b25',borderColor:'#335a4f',borderWidth:1},
  actionText:{color:'#061411',fontWeight:'900',fontSize:14},
  secondaryText:{color:'#e8f8f4'},
  disabled:{opacity:0.4},
  card:{borderWidth:1,borderColor:'#31534a',backgroundColor:'#0c1c18',
    borderRadius:16,padding:17,marginTop:20},
  cardTitle:{color:'#eafcf6',fontSize:18,fontWeight:'900',lineHeight:26,marginTop:6},
  caption:{color:'#8df0d0',fontSize:10,fontWeight:'900',letterSpacing:1.5},
  statRow:{flexDirection:'row',gap:12},
  stat:{flex:1,padding:16,borderRadius:14,backgroundColor:'#10221e'},
  statBig:{fontSize:26,color:'#8df0d0',fontWeight:'900'},
  disclaimer:{color:'#91aba3',fontSize:12,lineHeight:19,marginTop:24},
  error:{color:'#ffb6ac',fontSize:13,lineHeight:19,marginTop:14}
});
