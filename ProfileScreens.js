import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { consciousness } from './Core/ConsciousnessEngine';
import { profileStore } from './Core/ProfileStore';

const Button = ({ title, onPress, secondary=false, disabled=false }) => (
  <TouchableOpacity style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
    <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
  </TouchableOpacity>
);

const Input = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} style={styles.input} placeholderTextColor="#667085" />
  </View>
);

export const ProfileCreationScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '', date: '1990-01-01', time: '12:00:00', timezoneOffset: '0', city: '', lat: '', lon: '',
  });
  const [calculating, setCalculating] = useState(false);
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const calculate = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || !/^\d{2}:\d{2}/.test(form.time)) {
      Alert.alert('Check birth data', 'Use YYYY-MM-DD for date and HH:MM or HH:MM:SS for time.');
      return;
    }
    if (!Number.isFinite(Number(form.lat)) || !Number.isFinite(Number(form.lon))) {
      Alert.alert('Location required', 'Enter numeric latitude and longitude for the birth place.');
      return;
    }
    setCalculating(true);
    try {
      const birthData = {
        name: form.name.trim() || 'Profile',
        date: form.date,
        time: form.time.length === 5 ? `${form.time}:00` : form.time,
        timezoneOffset: Number(form.timezoneOffset || 0),
        city: form.city,
        lat: Number(form.lat),
        lon: Number(form.lon),
      };
      const profile = await consciousness.calculateProfile(birthData);
      const saved = await profileStore.save(profile, birthData.name);
      navigation.replace('Profile', { profile: saved });
    } catch (error) {
      Alert.alert('Calculation error', error.message || String(error));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>LOCAL CHART ENGINE</Text>
      <Text style={styles.title}>Create a resonance profile</Text>
      <Text style={styles.subtitle}>One birth record drives the Human Design, astrology, field, resonance, and Lab layers.</Text>
      <Input label="Name" value={form.name} onChangeText={v=>set('name',v)} placeholder="Profile name" />
      <Input label="Birth date" value={form.date} onChangeText={v=>set('date',v)} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <Input label="Birth time" value={form.time} onChangeText={v=>set('time',v)} placeholder="HH:MM:SS" autoCapitalize="none" />
      <Input label="UTC offset at birth" value={form.timezoneOffset} onChangeText={v=>set('timezoneOffset',v)} placeholder="-8, -7, 0, +1..." keyboardType="numbers-and-punctuation" />
      <Input label="Birth city (label only)" value={form.city} onChangeText={v=>set('city',v)} placeholder="City" />
      <Input label="Latitude" value={form.lat} onChangeText={v=>set('lat',v)} placeholder="37.7749" keyboardType="numbers-and-punctuation" />
      <Input label="Longitude" value={form.lon} onChangeText={v=>set('lon',v)} placeholder="-122.4194" keyboardType="numbers-and-punctuation" />
      <Button title={calculating ? 'Calculating…' : 'Calculate + Save Profile'} onPress={calculate} disabled={calculating} />
      {calculating && <ActivityIndicator style={{marginTop:16}} color="#8df0d0" />}
      <Text style={styles.note}>Calculations stay on-device. The current engine uses a local low-precision ephemeris for offline exploration; the UI labels that limitation instead of presenting it as Swiss Ephemeris precision.</Text>
    </ScrollView>
  );
};

export const ProfileScreen = ({ route, navigation }) => {
  const [profile, setProfile] = useState(route.params?.profile || null);
  useEffect(() => { if (!profile) profileStore.getCurrent().then(setProfile); }, []);
  if (!profile) return <Empty navigation={navigation} />;
  const hd = profile.humanDesign;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>RESONANCE IDENTITY</Text>
      <Text style={styles.title}>{profile.name}</Text>
      <View style={styles.heroCard}>
        <Text style={styles.heroType}>{hd.type}</Text>
        <Text style={styles.heroMeta}>{hd.profile} • {hd.authority} Authority</Text>
        <Text style={styles.heroMeta}>{hd.definition.type}</Text>
        <Text style={styles.heroMeta}>Coherence {(profile.coherence*100).toFixed(0)}% • Dominant field {profile.dominant?.field}</Text>
      </View>
      <Button title="Human Design BodyGraph Data" onPress={()=>navigation.navigate('HumanDesign',{profile})} />
      <Button title="Astrology Triad" secondary onPress={()=>navigation.navigate('Astrology',{profile})} />
      <Button title="Cynthia Field Lab" secondary onPress={()=>navigation.navigate('Lab',{profile})} />
      <Button title="Resonance Matches" secondary onPress={()=>navigation.navigate('Matches',{profile})} />
      <Button title="Create / Add Another Profile" secondary onPress={()=>navigation.navigate('CreateProfile')} />
      <Text style={styles.sectionTitle}>Field layer</Text>
      {Object.values(profile.fields).map(field => (
        <View style={styles.rowCard} key={field.field}>
          <View><Text style={styles.rowTitle}>{field.field}</Text><Text style={styles.rowSub}>{field.method} • {field.sourcePlanet}</Text></View>
          <Text style={styles.value}>Gate {field.primary.gate}.{field.primary.line}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export const MatchingScreen = ({ route, navigation }) => {
  const [current, setCurrent] = useState(route.params?.profile || null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async()=>{
      const base = current || await profileStore.getCurrent();
      setCurrent(base);
      const all = await profileStore.list();
      if (base) {
        setMatches(all.filter(p=>p.id!==base.id).map(profile=>({profile,...consciousness.calculateResonance(base,profile)})).sort((a,b)=>b.overall-a.overall));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#8df0d0" /></View>;
  if (!current) return <Empty navigation={navigation} />;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>LOCAL RESONANCE NETWORK</Text>
      <Text style={styles.title}>Matches for {current.name}</Text>
      <Text style={styles.subtitle}>Profiles saved on this device are compared through field waveforms, shared gates, and electromagnetic channel completions.</Text>
      {!matches.length && <View style={styles.heroCard}><Text style={styles.heroMeta}>Add another profile to calculate a real match. Sample/random people are no longer generated.</Text></View>}
      {matches.map(match=>(
        <View style={styles.matchCard} key={match.profile.id}>
          <View style={styles.matchHead}><Text style={styles.rowTitle}>{match.profile.name}</Text><Text style={styles.matchScore}>{(match.overall*100).toFixed(0)}%</Text></View>
          <Text style={styles.rowSub}>{match.compatibility}</Text>
          <Text style={styles.bodyText}>Shared gates: {match.sharedGates.length ? match.sharedGates.join(', ') : 'none'}</Text>
          <Text style={styles.bodyText}>Electromagnetic channels: {match.electromagneticChannels.length ? match.electromagneticChannels.join(', ') : 'none'}</Text>
          <Text style={styles.bodyText}>Strongest field: {match.fields[0]?.field} {(match.fields[0]?.resonance*100).toFixed(0)}%</Text>
          <Button title="Open Profile" secondary onPress={()=>navigation.navigate('Profile',{profile:match.profile})} />
        </View>
      ))}
    </ScrollView>
  );
};

const Empty = ({ navigation }) => <View style={styles.center}><Text style={styles.title}>No profile yet</Text><Button title="Create Profile" onPress={()=>navigation.navigate('CreateProfile')} /></View>;

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#07100f'}, content:{padding:20,paddingBottom:48}, center:{flex:1,backgroundColor:'#07100f',justifyContent:'center',padding:24},
  kicker:{color:'#8df0d0',fontSize:11,fontWeight:'800',letterSpacing:2,marginBottom:8}, title:{color:'#f5fbfa',fontSize:28,fontWeight:'800',marginBottom:8}, subtitle:{color:'#9db1ad',fontSize:14,lineHeight:21,marginBottom:22},
  inputGroup:{marginBottom:14}, label:{color:'#cce4df',fontSize:13,fontWeight:'700',marginBottom:7}, input:{backgroundColor:'#0d1b19',borderColor:'#1f3b36',borderWidth:1,borderRadius:12,color:'#fff',paddingHorizontal:14,paddingVertical:13,fontSize:15},
  button:{backgroundColor:'#8df0d0',borderRadius:13,paddingVertical:14,paddingHorizontal:16,alignItems:'center',marginTop:10}, buttonSecondary:{backgroundColor:'#10211e',borderWidth:1,borderColor:'#2b4b45'}, buttonDisabled:{opacity:.45}, buttonText:{color:'#07100f',fontWeight:'800',fontSize:15}, buttonTextSecondary:{color:'#d8f7ee'},
  note:{color:'#738783',fontSize:12,lineHeight:18,marginTop:18}, heroCard:{backgroundColor:'#0d1b19',borderColor:'#28433e',borderWidth:1,borderRadius:18,padding:18,marginVertical:14}, heroType:{color:'#8df0d0',fontSize:22,fontWeight:'800'}, heroMeta:{color:'#b8cbc7',fontSize:14,lineHeight:22,marginTop:4},
  sectionTitle:{color:'#f5fbfa',fontSize:18,fontWeight:'800',marginTop:26,marginBottom:10}, rowCard:{backgroundColor:'#0b1715',borderColor:'#17302c',borderWidth:1,borderRadius:13,padding:14,marginBottom:9,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, rowTitle:{color:'#eff9f7',fontSize:16,fontWeight:'800'}, rowSub:{color:'#829a95',fontSize:12,marginTop:3}, value:{color:'#8df0d0',fontWeight:'800'},
  matchCard:{backgroundColor:'#0d1b19',borderRadius:16,borderWidth:1,borderColor:'#1f3b36',padding:16,marginBottom:14}, matchHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, matchScore:{fontSize:23,color:'#8df0d0',fontWeight:'900'}, bodyText:{color:'#b0c4bf',fontSize:13,lineHeight:19,marginTop:8},
});