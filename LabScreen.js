import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { profileStore } from './Core/ProfileStore';
import { lab, LAB_EXPERIMENTS } from './Core/LabEngine';

const FIELD_LINKS = { Mind:'Mind', Heart:'Heart', Body:'Body', Will:'Form', Soul:'Spirit', Shadow:'Shadow' };

const Stepper = ({ label, value, onChange }) => (
  <View style={styles.stepRow}>
    <Text style={styles.stepLabel}>{label}</Text>
    <View style={styles.stepControls}>
      <TouchableOpacity style={styles.stepButton} onPress={()=>onChange(Math.max(0,value-1))}><Text style={styles.stepText}>−</Text></TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity style={styles.stepButton} onPress={()=>onChange(Math.min(10,value+1))}><Text style={styles.stepText}>+</Text></TouchableOpacity>
    </View>
  </View>
);

export default function LabScreen({ route, navigation }) {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [selected, setSelected] = useState(LAB_EXPERIMENTS[0]);
  const [metrics, setMetrics] = useState({ joy:5, trust:5, clarity:5, energy:5, completion:5, synchronicity:5, volatility:5 });
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [transitState, setTransitState] = useState(null);

  const refresh = async (p) => {
    const current = p || profile || await profileStore.getCurrent();
    setProfile(current);
    if (current) {
      setTransitState(lab.getTransitState(current));
      setLogs(await lab.observations(null, current.id));
    }
  };

  useEffect(()=>{ refresh(route.params?.profile); },[]);
  const evaluation = useMemo(()=> profile && transitState ? lab.evaluate(selected, profile, transitState) : null,[selected,profile,transitState]);
  const summary = lab.summarize(logs.filter(l=>l.experimentId===selected.id));

  const save = async () => {
    if (!profile || !transitState) return;
    const record = await lab.logObservation({ experiment:selected, profile, metrics, notes, transitState });
    setLogs(prev=>[...prev,record]);
    setNotes('');
    Alert.alert('Observation saved', 'This entry is stored locally with the current transit snapshot.');
  };

  if(!profile) return <View style={styles.loading}><ActivityIndicator color="#8df0d0"/><Text style={styles.meta}>Create a profile to activate the Lab.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>CYNTHIA FIELD SCIENCE LAB</Text>
      <Text style={styles.title}>Live field laboratory</Text>
      <Text style={styles.subtitle}>The six Drive experiments are connected to the current profile, current local transit calculation, and a persistent observation log.</Text>

      <Text style={styles.section}>Field dashboard</Text>
      <View style={styles.fieldGrid}>
        {Object.entries(FIELD_LINKS).map(([label,key])=>{
          const field=profile.fields[key]; const pct=Math.round((field?.energy||0)*100);
          return <View style={styles.fieldCard} key={label}><Text style={styles.fieldName}>{label}</Text><Text style={styles.fieldPct}>{pct}%</Text><Text style={styles.fieldTiny}>{field ? `G${field.primary.gate}.${field.primary.line}` : '—'}</Text></View>;
        })}
      </View>

      <Text style={styles.section}>Experiments</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
        {LAB_EXPERIMENTS.map(exp=><TouchableOpacity key={exp.id} onPress={()=>setSelected(exp)} style={[styles.expChip,selected.id===exp.id&&styles.expChipActive]}><Text style={[styles.expChipText,selected.id===exp.id&&styles.expChipTextActive]}>{exp.field} · G{exp.gate}</Text></TouchableOpacity>)}
      </ScrollView>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{selected.title}</Text>
        <Text style={styles.heroText}>{selected.hypothesis}</Text>
        <View style={styles.statusRow}><Text style={styles.statusLabel}>NATAL GATE</Text><Text style={evaluation?.natalActive ? styles.statusOn : styles.statusOff}>{evaluation?.natalActive ? 'ACTIVE' : 'not active'}</Text></View>
        <View style={styles.statusRow}><Text style={styles.statusLabel}>{selected.planet.toUpperCase()} TRANSIT</Text><Text style={evaluation?.transitGateMatch ? styles.statusOn : styles.statusOff}>{evaluation?.transit ? `Gate ${evaluation.transit.gate}.${evaluation.transit.line}` : '—'}</Text></View>
        <View style={styles.statusRow}><Text style={styles.statusLabel}>WINDOW</Text><Text style={evaluation?.status==='active-window' ? styles.statusOn : styles.statusOff}>{evaluation?.status?.replace(/-/g,' ')}</Text></View>
      </View>

      <Text style={styles.section}>Observation</Text>
      <Stepper label="Joy" value={metrics.joy} onChange={v=>setMetrics(m=>({...m,joy:v}))}/>
      <Stepper label="Trust" value={metrics.trust} onChange={v=>setMetrics(m=>({...m,trust:v}))}/>
      <Stepper label="Clarity" value={metrics.clarity} onChange={v=>setMetrics(m=>({...m,clarity:v}))}/>
      <Stepper label="Energy" value={metrics.energy} onChange={v=>setMetrics(m=>({...m,energy:v}))}/>
      <Stepper label="Completion" value={metrics.completion} onChange={v=>setMetrics(m=>({...m,completion:v}))}/>
      <Stepper label="Synchronicity" value={metrics.synchronicity} onChange={v=>setMetrics(m=>({...m,synchronicity:v}))}/>
      <Stepper label="Volatility" value={metrics.volatility} onChange={v=>setMetrics(m=>({...m,volatility:v}))}/>
      <TextInput multiline style={styles.notes} placeholder="What actually happened?" placeholderTextColor="#667b76" value={notes} onChangeText={setNotes}/>
      <TouchableOpacity style={styles.saveButton} onPress={save}><Text style={styles.saveText}>Save Observation + Transit Snapshot</Text></TouchableOpacity>

      <Text style={styles.section}>Experiment history</Text>
      <View style={styles.summary}><Text style={styles.summaryBig}>{summary.count}</Text><Text style={styles.meta}>logged observations for this experiment</Text></View>
      {Object.entries(summary.averages).slice(0,7).map(([key,value])=><View style={styles.historyRow} key={key}><Text style={styles.historyKey}>{key}</Text><Text style={styles.historyVal}>{value.toFixed(1)} / 10</Text></View>)}
      <Text style={styles.disclaimer}>The Lab records hypotheses and observations; it does not label the original prototype percentages or p-values as evidence until the app has actual data to calculate them from.</Text>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#07100f'},content:{padding:20,paddingBottom:56},loading:{flex:1,backgroundColor:'#07100f',justifyContent:'center',alignItems:'center'},
  kicker:{color:'#8df0d0',fontSize:11,fontWeight:'900',letterSpacing:2,marginBottom:8},title:{color:'#f5fbfa',fontSize:28,fontWeight:'900',marginBottom:8},subtitle:{color:'#94aaa5',fontSize:14,lineHeight:21,marginBottom:18},section:{color:'#f1faf8',fontSize:18,fontWeight:'900',marginTop:20,marginBottom:10},meta:{color:'#91a8a2',fontSize:12,lineHeight:18},
  fieldGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},fieldCard:{width:'31.5%',backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#1f3b36',borderRadius:14,padding:12,marginBottom:8},fieldName:{color:'#b8cbc7',fontSize:11,fontWeight:'800'},fieldPct:{color:'#8df0d0',fontSize:22,fontWeight:'900',marginTop:4},fieldTiny:{color:'#6f8982',fontSize:10,marginTop:3},
  expChip:{borderWidth:1,borderColor:'#28453f',borderRadius:99,paddingVertical:9,paddingHorizontal:13,marginRight:8},expChipActive:{backgroundColor:'#8df0d0'},expChipText:{color:'#9db1ac',fontWeight:'800',fontSize:12},expChipTextActive:{color:'#07100f'},
  hero:{backgroundColor:'#0d1b19',borderRadius:18,borderWidth:1,borderColor:'#2d4c46',padding:17},heroTitle:{color:'#eef9f7',fontSize:19,fontWeight:'900'},heroText:{color:'#9cb1ac',fontSize:13,lineHeight:20,marginTop:8,marginBottom:10},statusRow:{flexDirection:'row',justifyContent:'space-between',paddingTop:9,borderTopWidth:1,borderTopColor:'#17302c',marginTop:7},statusLabel:{color:'#708984',fontSize:10,fontWeight:'900',letterSpacing:1},statusOn:{color:'#8df0d0',fontWeight:'900',fontSize:12},statusOff:{color:'#8ca09b',fontWeight:'700',fontSize:12},
  stepRow:{backgroundColor:'#0a1714',borderColor:'#18322d',borderWidth:1,borderRadius:12,padding:12,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},stepLabel:{color:'#d9ebe7',fontWeight:'800'},stepControls:{flexDirection:'row',alignItems:'center'},stepButton:{width:34,height:34,borderRadius:9,backgroundColor:'#14302a',alignItems:'center',justifyContent:'center'},stepText:{color:'#8df0d0',fontSize:20,fontWeight:'900'},stepValue:{color:'#fff',fontSize:16,fontWeight:'900',width:44,textAlign:'center'},
  notes:{minHeight:100,textAlignVertical:'top',backgroundColor:'#0d1b19',borderColor:'#1f3b36',borderWidth:1,borderRadius:13,color:'#fff',padding:13,marginTop:8},saveButton:{backgroundColor:'#8df0d0',borderRadius:13,padding:15,alignItems:'center',marginTop:12},saveText:{color:'#07100f',fontWeight:'900'},summary:{backgroundColor:'#0d1b19',borderRadius:14,padding:15,marginBottom:10},summaryBig:{color:'#8df0d0',fontSize:28,fontWeight:'900'},historyRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomColor:'#162d29',borderBottomWidth:1},historyKey:{color:'#a9bdb8',textTransform:'capitalize'},historyVal:{color:'#dff7f1',fontWeight:'800'},disclaimer:{color:'#6f8781',fontSize:11,lineHeight:17,marginTop:18},
});