import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { profileStore } from './Core/ProfileStore';
import { trajectoryStore } from './Core/TrajectoryStore';
import { relationship } from './Core/RelationshipEngine';
import { timing } from './Core/TimingEngine';
import { capabilityRegistry } from './Core/CapabilityRegistry';

const STELLAR_WEB = 'https://bewitched-frivolous-opengroup--dfffrud.replit.app';

const Button = ({ title, onPress, secondary=false, disabled=false }) => (
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.disabled]}>
    <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
  </TouchableOpacity>
);

const Card = ({ children }) => <View style={styles.card}>{children}</View>;
const Section = ({ children }) => <Text style={styles.section}>{children}</Text>;
const Kicker = ({ children }) => <Text style={styles.kicker}>{children}</Text>;
const EmptyProfile = ({ navigation }) => (
  <View style={styles.loading}>
    <Text style={styles.title}>No local profile yet</Text>
    <Button title="Create Profile" onPress={()=>navigation.navigate('CreateProfile')} />
  </View>
);

export function StellarScreen({ route, navigation }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  useEffect(()=>{ if (!profile) profileStore.getCurrent().then(setProfile); },[]);
  if (!profile) return <EmptyProfile navigation={navigation} />;

  const hd = profile.humanDesign;
  const tropical = profile.astrology.tropical;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Kicker>STELLAR PROXIMOLOGY · LOCAL FACE</Kicker>
      <Text style={styles.title}>Meet Stellar inside Resonance</Text>
      <Text style={styles.subtitle}>Stellar is a capability of the sovereign computer. This screen reads the same local profile as Human Design, astrology, Cynthia, relationship, and timing. The hosted site is optional.</Text>
      <Card>
        <Text style={styles.cardTitle}>{profile.name}</Text>
        <Text style={styles.bigValue}>{hd.type}</Text>
        <Text style={styles.meta}>{hd.profile} • {hd.authority} Authority • {hd.definition.type}</Text>
        <Text style={styles.meta}>Tropical Sun {formatPoint(tropical.positions.find(p=>p.planet==='Sun'))}</Text>
        <Text style={styles.meta}>True Node {formatPoint(tropical.northNode)}</Text>
        <Text style={styles.meta}>Dominant field {profile.dominant?.field || '—'} • coherence {Math.round((profile.coherence || 0)*100)}%</Text>
      </Card>
      <Section>Stellar capabilities</Section>
      <Button title="Relationship + Composite" onPress={()=>navigation.navigate('Relationship',{profile})} />
      <Button title="Timing + Transits" secondary onPress={()=>navigation.navigate('Timing',{profile})} />
      <Button title="Profile Portability" secondary onPress={()=>navigation.navigate('Portability')} />
      <Button title="Capability Registry" secondary onPress={()=>navigation.navigate('Capabilities')} />
      <Section>Optional public doorway</Section>
      <Card>
        <Text style={styles.cardTitle}>Hosted Stellar</Text>
        <Text style={styles.meta}>Opening the hosted site does not move ownership of this profile. Local Resonance remains the source of truth.</Text>
        <Button title="Open Hosted Stellar" secondary onPress={()=>Linking.openURL(STELLAR_WEB)} />
      </Card>
    </ScrollView>
  );
}

export function CynthiaScreen({ route, navigation }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [note, setNote] = useState('');
  const [events, setEvents] = useState([]);

  const refresh = async () => {
    const current = profile || await profileStore.getCurrent();
    setProfile(current);
    setEvents(await trajectoryStore.list(20));
  };
  useEffect(()=>{ refresh(); },[]);

  if (!profile) return <EmptyProfile navigation={navigation} />;
  const checkpoint = buildCheckpoint(profile);
  const save = async () => {
    if (!note.trim()) return;
    await trajectoryStore.append('cynthia.note', { profileId: profile.id, profileName: profile.name, text: note.trim() });
    setNote('');
    setEvents(await trajectoryStore.list(20));
    Alert.alert('Saved locally', 'Cynthia added this observation to the append-only trajectory state.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Kicker>CYNTHIA · PERSONAL COGNITION</Kicker>
      <Text style={styles.title}>A local continuity surface</Text>
      <Text style={styles.subtitle}>Cynthia uses the current calculated profile plus local trajectory events. This mobile surface does not require a hosted model to preserve observations or resume context.</Text>
      <Card>
        <Text style={styles.cardTitle}>Current checkpoint</Text>
        {checkpoint.map((line)=><Text key={line} style={styles.checkpoint}>• {line}</Text>)}
      </Card>
      <Section>Teach / record</Section>
      <TextInput
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="What should Cynthia carry forward from this moment?"
        placeholderTextColor="#627a74"
        style={styles.notes}
      />
      <Button title="Land Observation" onPress={save} disabled={!note.trim()} />
      <Button title="Open Cynthia Field Lab" secondary onPress={()=>navigation.navigate('Lab',{profile})} />
      <Section>Recent trajectory</Section>
      {!events.length && <Text style={styles.meta}>No trajectory events yet.</Text>}
      {events.map((event)=><View key={event.id} style={styles.row}><View style={{flex:1}}><Text style={styles.rowTitle}>{event.type}</Text><Text style={styles.rowSub}>{event.createdAt}</Text>{event.payload?.text ? <Text style={styles.rowText}>{event.payload.text}</Text> : null}</View></View>)}
    </ScrollView>
  );
}

export function RelationshipScreen({ route, navigation }) {
  const [current, setCurrent] = useState(route.params?.profile || null);
  const [profiles, setProfiles] = useState([]);
  const [otherId, setOtherId] = useState(null);

  useEffect(()=>{ (async()=>{
    const base = current || await profileStore.getCurrent();
    const all = await profileStore.list();
    setCurrent(base); setProfiles(all);
    const firstOther = all.find(p=>p.id!==base?.id);
    setOtherId(firstOther?.id || null);
  })(); },[]);

  if (!current) return <EmptyProfile navigation={navigation} />;
  const other = profiles.find(p=>p.id===otherId) || null;
  const result = other ? relationship.compare(current, other) : null;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Kicker>RELATIONSHIP · DONOR DELTA MODEL</Kicker>
      <Text style={styles.title}>{current.name} + {other?.name || 'another profile'}</Text>
      <Text style={styles.subtitle}>The comparison follows the recovered Biverse relationship semantics: exact shared/left-only/right-only deltas across summary facets, defined centers, channels, and gates. Composite mechanics are the deterministic union of both active gate sets.</Text>
      {profiles.filter(p=>p.id!==current.id).map(p=><TouchableOpacity key={p.id} style={[styles.choice,otherId===p.id&&styles.choiceActive]} onPress={()=>setOtherId(p.id)}><Text style={[styles.choiceText,otherId===p.id&&styles.choiceTextActive]}>{p.name}</Text></TouchableOpacity>)}
      {!other && <Card><Text style={styles.meta}>Add a second saved profile to calculate a relationship/composite. No sample person is generated.</Text><Button title="Add Profile" onPress={()=>navigation.navigate('CreateProfile')} /></Card>}
      {result && <>
        <Section>Summary facets</Section>
        {result.summaryFacets.map(f=><View key={f.key} style={styles.row}><View><Text style={styles.rowTitle}>{f.key}</Text><Text style={styles.rowSub}>{String(f.left)} ↔ {String(f.right)}</Text></View><Text style={f.same?styles.on:styles.off}>{f.same?'SAME':'DIFFERENT'}</Text></View>)}
        <Section>Gate delta</Section>
        <Delta label="Shared" value={result.gates.shared} />
        <Delta label={`${current.name} only`} value={result.gates.leftOnly} />
        <Delta label={`${other.name} only`} value={result.gates.rightOnly} />
        <Section>Composite</Section>
        <Card><Text style={styles.meta}>Defined centers</Text><Text style={styles.rowText}>{result.composite.definedCenters.join(' • ') || 'none'}</Text><Text style={[styles.meta,{marginTop:10}]}>Completed channels</Text><Text style={styles.rowText}>{result.composite.channels.map(c=>`${c.a}-${c.b}`).join(' • ') || 'none'}</Text></Card>
      </>}
    </ScrollView>
  );
}

export function TimingScreen({ route, navigation }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculate = async () => {
    setLoading(true);
    const current = profile || await profileStore.getCurrent();
    setProfile(current);
    if (current) setResult(await timing.analyze(current, new Date(), 'current'));
    setLoading(false);
  };
  useEffect(()=>{ calculate(); },[]);

  if (!profile && !loading) return <EmptyProfile navigation={navigation} />;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Kicker>TIMING · CURRENT TRANSIT</Kicker>
      <Text style={styles.title}>{profile?.name || 'Transit analysis'}</Text>
      <Text style={styles.subtitle}>The timing comparison follows the donor timing model: shared, natal-only, and transit-only centers/channels/gates. Transit-only defined centers are surfaced as pressure on natal openness; shared defined centers are anchors.</Text>
      <Button title={loading?'Calculating…':'Refresh Current Transit'} onPress={calculate} disabled={loading} />
      {loading && <ActivityIndicator color="#8df0d0" style={{marginTop:20}} />}
      {result && <>
        <Card><Text style={styles.cardTitle}>{result.transitDateTimeUtc}</Text><Text style={styles.meta}>Calculated locally at the natal location using the same Human Design + geonatal engine.</Text></Card>
        <Section>Pressure / anchors</Section>
        <Delta label="Transit-only centers" value={result.pressuredOpenCenters} />
        <Delta label="Shared defined centers" value={result.anchoredDefinedCenters} />
        <Section>Gate movement</Section>
        <Delta label="Shared gates" value={result.gates.shared} />
        <Delta label="Natal only" value={result.gates.natalOnly} />
        <Delta label="Transit only" value={result.gates.transitOnly} />
      </>}
    </ScrollView>
  );
}

export function PortabilityScreen({ navigation }) {
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState('');

  const buildExport = async () => {
    const bundle = await profileStore.exportBundle();
    const json = JSON.stringify(bundle, null, 2);
    setPayload(json);
    setStatus(`${bundle.profiles.length} profile(s) ready to export.`);
    return json;
  };
  const share = async () => {
    const json = payload || await buildExport();
    await Share.share({ title:'Resonance Network Profile Bundle', message:json });
  };
  const importBundle = async () => {
    try {
      const count = await profileStore.importBundle(payload);
      setStatus(`Imported ${count} profile(s).`);
      Alert.alert('Import complete', `${count} profile(s) are now in the local ProfileStore.`);
    } catch (error) {
      Alert.alert('Import failed', error.message || String(error));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Kicker>PORTABLE · USER-OWNED</Kicker>
      <Text style={styles.title}>Move the profile without moving the owner</Text>
      <Text style={styles.subtitle}>This versioned JSON bundle contains the local calculated profiles and current-profile pointer. It can be shared out of the app and pasted back into another Resonance installation.</Text>
      <Button title="Build Export Bundle" onPress={buildExport} />
      <Button title="Share Bundle" secondary onPress={share} />
      {!!status && <Text style={styles.status}>{status}</Text>}
      <Section>Export / import payload</Section>
      <TextInput
        multiline
        value={payload}
        onChangeText={setPayload}
        placeholder="Build an export above, or paste a Resonance profile bundle here to import."
        placeholderTextColor="#627a74"
        style={[styles.notes,{minHeight:260,fontFamily:'monospace'}]}
      />
      <Button title="Import Pasted Bundle" onPress={importBundle} disabled={!payload.trim()} />
      <Button title="Back to Computer" secondary onPress={()=>navigation.navigate('Home')} />
    </ScrollView>
  );
}

export function CapabilitiesScreen({ navigation }) {
  const capabilities = useMemo(()=>capabilityRegistry.list(),[]);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Kicker>CAPABILITY / PLUGIN REGISTRY</Kicker>
      <Text style={styles.title}>What this computer can execute</Text>
      <Text style={styles.subtitle}>Built-ins remain local. Stellar web and ChatGPT MCP are adapters. The mesh entry records the donor-runtime bridge explicitly instead of pretending the Node/SQLite runtime has already been ported to React Native.</Text>
      {capabilities.map(cap=><TouchableOpacity key={cap.id} disabled={!cap.route} onPress={()=>cap.route&&navigation.navigate(cap.route)} style={styles.capability}>
        <View style={{flex:1}}><Text style={styles.rowTitle}>{cap.name}</Text><Text style={styles.rowSub}>{cap.owner} • {cap.execution}</Text></View>
        <Text style={cap.status==='active'?styles.on:styles.off}>{cap.status.toUpperCase()}</Text>
      </TouchableOpacity>)}
    </ScrollView>
  );
}

function Delta({ label, value }) {
  const text = Array.isArray(value) && value.length ? value.join(' • ') : 'none';
  return <View style={styles.row}><View style={{flex:1}}><Text style={styles.rowTitle}>{label}</Text><Text style={styles.rowText}>{text}</Text></View></View>;
}

function formatPoint(point) {
  return point ? `${point.sign} ${Number(point.degree).toFixed(2)}°` : '—';
}

function buildCheckpoint(profile) {
  const hd=profile.humanDesign;
  const sun=profile.astrology?.tropical?.positions?.find(p=>p.planet==='Sun');
  return [
    `${profile.name}: ${hd.type}, ${hd.profile}, ${hd.authority} Authority.`,
    `${hd.definition.type}; ${Object.values(hd.centers).filter(c=>c.defined).length} defined centers.`,
    `Tropical Sun ${formatPoint(sun)}; incarnation gates ${hd.incarnationCross?.label}.`,
    `Dominant field ${profile.dominant?.field || '—'} at ${Math.round((profile.dominant?.energy || 0)*100)}% field energy.`,
    'Profile state is local and portable; trajectory additions are append-only events.',
  ];
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#07100f'},content:{padding:20,paddingBottom:60},loading:{flex:1,backgroundColor:'#07100f',justifyContent:'center',padding:24},
  kicker:{color:'#8df0d0',fontSize:10,fontWeight:'900',letterSpacing:2,marginBottom:8},title:{color:'#f5fbfa',fontSize:28,fontWeight:'900',lineHeight:34,marginBottom:8},subtitle:{color:'#95aaa5',fontSize:14,lineHeight:21,marginBottom:18},
  section:{color:'#f1faf8',fontSize:18,fontWeight:'900',marginTop:24,marginBottom:10},card:{backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#28443e',borderRadius:17,padding:16,marginBottom:12},cardTitle:{color:'#eef9f7',fontSize:16,fontWeight:'900'},bigValue:{color:'#8df0d0',fontSize:24,fontWeight:'900',marginTop:8},meta:{color:'#91a8a2',fontSize:12,lineHeight:19,marginTop:5},
  button:{backgroundColor:'#8df0d0',borderRadius:13,paddingVertical:14,paddingHorizontal:16,alignItems:'center',marginTop:10},buttonSecondary:{backgroundColor:'#10211e',borderWidth:1,borderColor:'#2b4b45'},buttonText:{color:'#07100f',fontWeight:'900'},buttonSecondaryText:{color:'#d8f7ee'},disabled:{opacity:.4},
  notes:{minHeight:120,textAlignVertical:'top',backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#1f3b36',borderRadius:13,color:'#fff',padding:13},checkpoint:{color:'#c5d9d4',fontSize:13,lineHeight:20,marginTop:6},
  row:{backgroundColor:'#0b1715',borderWidth:1,borderColor:'#17302c',borderRadius:13,padding:13,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},rowTitle:{color:'#e8f6f3',fontSize:14,fontWeight:'800'},rowSub:{color:'#809792',fontSize:11,marginTop:3},rowText:{color:'#b7cbc6',fontSize:12,lineHeight:18,marginTop:5},
  on:{color:'#8df0d0',fontWeight:'900',fontSize:10},off:{color:'#829792',fontWeight:'800',fontSize:10},
  choice:{borderWidth:1,borderColor:'#28453f',borderRadius:99,paddingVertical:10,paddingHorizontal:14,marginBottom:8},choiceActive:{backgroundColor:'#8df0d0'},choiceText:{color:'#a4b8b3',fontWeight:'800'},choiceTextActive:{color:'#07100f'},
  status:{color:'#8df0d0',marginTop:12,fontWeight:'800'},capability:{backgroundColor:'#0b1715',borderWidth:1,borderColor:'#17302c',borderRadius:13,padding:14,marginBottom:9,flexDirection:'row',alignItems:'center'},
});
