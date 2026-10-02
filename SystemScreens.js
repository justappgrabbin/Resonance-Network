import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { profileStore } from './Core/ProfileStore';

const getProfile = async (routeProfile) => routeProfile || profileStore.getCurrent();
const fmt = (n, digits=2) => Number(n).toFixed(digits);

const Pill = ({active, children, onPress}) => (
  <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
    <Text style={[styles.pillText, active && styles.pillTextActive]}>{children}</Text>
  </TouchableOpacity>
);

export const HumanDesignScreen = ({ route, navigation }) => {
  const [profile, setProfile] = useState(route.params?.profile || null);
  useEffect(()=>{ if(!profile) getProfile().then(setProfile); },[]);
  if(!profile) return <Loading navigation={navigation} />;
  const hd = profile.humanDesign;
  const definedCenters = Object.values(hd.centers).filter(c=>c.defined);
  const openCenters = Object.values(hd.centers).filter(c=>!c.defined);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>HUMAN DESIGN LAYER</Text>
      <Text style={styles.title}>{profile.name}</Text>
      <View style={styles.hero}>
        <Text style={styles.heroType}>{hd.type}</Text>
        <Text style={styles.heroLine}>{hd.strategy}</Text>
        <Text style={styles.heroLine}>{hd.authority} Authority • Profile {hd.profile}</Text>
        <Text style={styles.heroLine}>{hd.definition.type}</Text>
        <Text style={styles.heroLine}>Cross gates {hd.incarnationCross.label}</Text>
      </View>

      <Text style={styles.section}>Centers</Text>
      <Text style={styles.meta}>Defined: {definedCenters.length ? definedCenters.map(c=>c.name).join(' • ') : 'none'}</Text>
      <Text style={styles.meta}>Open: {openCenters.length ? openCenters.map(c=>c.name).join(' • ') : 'none'}</Text>
      <View style={styles.grid}>
        {Object.values(hd.centers).map(center=>(
          <View style={[styles.centerCard, center.defined && styles.centerDefined]} key={center.name}>
            <Text style={styles.cardTitle}>{center.name}</Text>
            <Text style={styles.cardSub}>{center.defined ? 'DEFINED' : 'OPEN'}</Text>
            {!!center.channels.length && <Text style={styles.cardTiny}>{center.channels.join(' · ')}</Text>}
          </View>
        ))}
      </View>

      <Text style={styles.section}>Defined channels</Text>
      {!hd.channels.length && <Text style={styles.meta}>No completed channels in this local calculation.</Text>}
      {hd.channels.map(ch=><View style={styles.row} key={`${ch.a}-${ch.b}`}><Text style={styles.rowTitle}>{ch.a} — {ch.b}</Text><Text style={styles.rowSub}>{ch.centerA} ↔ {ch.centerB}</Text></View>)}

      <Text style={styles.section}>Personality activations</Text>
      {hd.personality.map(a=><Activation key={`p-${a.planet}`} a={a} />)}
      <Text style={styles.section}>Design activations</Text>
      <Text style={styles.meta}>Design moment: {new Date(hd.designDate).toISOString().replace('T',' ').slice(0,19)} UTC</Text>
      {hd.design.map(a=><Activation key={`d-${a.planet}`} a={a} />)}

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Substructure is wired</Text>
        <Text style={styles.meta}>Each activation carries gate → line → color → tone → base. The design moment is solved at an approximately 88° solar arc before birth, using the local ephemeris instead of random placeholders.</Text>
      </View>
    </ScrollView>
  );
};

const Activation = ({a}) => (
  <View style={styles.row}>
    <View><Text style={styles.rowTitle}>{a.planet}</Text><Text style={styles.rowSub}>{a.keyword} • {a.lineArchetype}</Text></View>
    <View style={{alignItems:'flex-end'}}><Text style={styles.gate}>G{a.gate}.{a.line}</Text><Text style={styles.rowSub}>C{a.color} T{a.tone} B{a.base}</Text></View>
  </View>
);

export const AstrologyScreen = ({ route, navigation }) => {
  const [profile, setProfile] = useState(route.params?.profile || null);
  const [system, setSystem] = useState('tropical');
  useEffect(()=>{ if(!profile) getProfile().then(setProfile); },[]);
  if(!profile) return <Loading navigation={navigation} />;
  const chart = profile.astrology[system];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>ASTROLOGY TRIAD</Text>
      <Text style={styles.title}>{profile.name}</Text>
      <View style={styles.pills}>
        <Pill active={system==='tropical'} onPress={()=>setSystem('tropical')}>Tropical</Pill>
        <Pill active={system==='sidereal'} onPress={()=>setSystem('sidereal')}>Sidereal</Pill>
        <Pill active={system==='draconic'} onPress={()=>setSystem('draconic')}>Draconic</Pill>
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroType}>{chart.system}</Text>
        <Text style={styles.heroLine}>Ascendant {chart.ascendant.sign} {fmt(chart.ascendant.degree)}°</Text>
        <Text style={styles.heroLine}>{chart.houseSystem}</Text>
        {system==='sidereal' && <Text style={styles.heroLine}>Fagan-Bradley ayanamsa ≈ {fmt(profile.astrology.ayanamsa)}°</Text>}
      </View>
      <Text style={styles.section}>Planets</Text>
      {chart.positions.map(p=>(
        <View style={styles.row} key={p.planet}>
          <View><Text style={styles.rowTitle}>{p.planet}</Text><Text style={styles.rowSub}>House {p.house}</Text></View>
          <Text style={styles.gate}>{p.sign} {fmt(p.degree)}°</Text>
        </View>
      ))}
      <View style={styles.row}><Text style={styles.rowTitle}>North Node</Text><Text style={styles.gate}>{chart.northNode.sign} {fmt(chart.northNode.degree)}°</Text></View>
      <View style={styles.row}><Text style={styles.rowTitle}>South Node</Text><Text style={styles.gate}>{chart.southNode.sign} {fmt(chart.southNode.degree)}°</Text></View>

      <Text style={styles.section}>Tropical aspects</Text>
      {profile.astrology.aspects.slice(0,24).map((a,i)=><View style={styles.row} key={`${a.a}-${a.b}-${i}`}><Text style={styles.rowTitle}>{a.a} {a.type} {a.b}</Text><Text style={styles.rowSub}>orb {fmt(a.orb)}°</Text></View>)}
      <View style={styles.noteCard}><Text style={styles.noteTitle}>Offline calculation note</Text><Text style={styles.meta}>{profile.astrology.tropical.precision}</Text></View>
    </ScrollView>
  );
};

const Loading = ({navigation}) => <View style={styles.loading}><ActivityIndicator color="#8df0d0"/><Text style={styles.meta}>No saved profile. Create one from Home.</Text></View>;

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#07100f'}, content:{padding:20,paddingBottom:50}, loading:{flex:1,backgroundColor:'#07100f',justifyContent:'center',alignItems:'center',gap:12},
  kicker:{color:'#8df0d0',fontSize:11,fontWeight:'900',letterSpacing:2,marginBottom:8}, title:{color:'#f5fbfa',fontSize:28,fontWeight:'900',marginBottom:12}, hero:{backgroundColor:'#0d1b19',borderColor:'#28433e',borderWidth:1,borderRadius:18,padding:18,marginBottom:18}, heroType:{fontSize:23,color:'#8df0d0',fontWeight:'900'}, heroLine:{color:'#bbd0cb',fontSize:14,lineHeight:22,marginTop:3},
  section:{color:'#f2fbf9',fontSize:18,fontWeight:'900',marginTop:20,marginBottom:10}, meta:{color:'#8fa6a1',fontSize:13,lineHeight:20,marginBottom:6}, grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'}, centerCard:{width:'48.5%',minHeight:88,borderRadius:14,borderWidth:1,borderColor:'#22332f',backgroundColor:'#0a1412',padding:12,marginBottom:10}, centerDefined:{borderColor:'#4b8b7d',backgroundColor:'#10231f'}, cardTitle:{color:'#eef9f7',fontSize:14,fontWeight:'800'}, cardSub:{color:'#8df0d0',fontSize:10,fontWeight:'900',letterSpacing:1,marginTop:7}, cardTiny:{color:'#7f9691',fontSize:10,marginTop:6},
  row:{backgroundColor:'#0b1715',borderWidth:1,borderColor:'#17302c',borderRadius:13,padding:13,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, rowTitle:{color:'#e8f6f3',fontSize:14,fontWeight:'800'}, rowSub:{color:'#809792',fontSize:11,marginTop:3}, gate:{color:'#8df0d0',fontSize:13,fontWeight:'900'},
  noteCard:{backgroundColor:'#0d1b19',borderLeftWidth:3,borderLeftColor:'#8df0d0',padding:15,borderRadius:12,marginTop:20}, noteTitle:{color:'#e9f8f5',fontWeight:'900',marginBottom:7}, pills:{flexDirection:'row',gap:8,marginBottom:14}, pill:{borderColor:'#2a4b45',borderWidth:1,borderRadius:99,paddingVertical:9,paddingHorizontal:14}, pillActive:{backgroundColor:'#8df0d0'}, pillText:{color:'#9eb2ae',fontWeight:'800'}, pillTextActive:{color:'#07100f'},
});