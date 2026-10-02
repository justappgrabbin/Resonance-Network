import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SystemBootstrap } from './Core/SystemBootstrap';
import { profileStore } from './Core/ProfileStore';
import { ProfileCreationScreen, ProfileScreen, MatchingScreen } from './ProfileScreens';
import { HumanDesignScreen, AstrologyScreen } from './SystemScreens';
import LabScreen from './LabScreen';
import {
  CapabilitiesScreen,
  CynthiaScreen,
  PortabilityScreen,
  RelationshipScreen,
  StellarScreen,
  TimingScreen,
} from './FeatureScreens';

const Stack = createStackNavigator();

export default function App() {
  const [ready,setReady]=useState(false);
  const [bootLog,setBootLog]=useState([]);
  useEffect(()=>{
    const bootstrap=new SystemBootstrap();
    bootstrap.on('log',msg=>setBootLog(prev=>[...prev,msg].slice(-8)));
    bootstrap.init().then(()=>setReady(true)).catch(err=>setBootLog(prev=>[...prev,`ERROR: ${err.message}`]));
  },[]);

  if(!ready) return <View style={styles.boot}><Text style={styles.brand}>RESONANCE NETWORK</Text><Text style={styles.bootSub}>Booting sovereign local capabilities…</Text><ActivityIndicator color="#8df0d0" size="large"/><View style={styles.logs}>{bootLog.map((l,i)=><Text style={styles.log} key={i}>{l}</Text>)}</View></View>;

  return <NavigationContainer>
    <Stack.Navigator initialRouteName="Home" screenOptions={{headerStyle:{backgroundColor:'#07100f'},headerTintColor:'#dff7f1',headerTitleStyle:{fontWeight:'800'},cardStyle:{backgroundColor:'#07100f'}}}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'Resonance Network'}}/>
      <Stack.Screen name="CreateProfile" component={ProfileCreationScreen} options={{title:'Create Profile'}}/>
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="HumanDesign" component={HumanDesignScreen} options={{title:'Human Design'}}/>
      <Stack.Screen name="Astrology" component={AstrologyScreen}/>
      <Stack.Screen name="Cynthia" component={CynthiaScreen}/>
      <Stack.Screen name="Lab" component={LabScreen} options={{title:'Cynthia Field Lab'}}/>
      <Stack.Screen name="Stellar" component={StellarScreen} options={{title:'Stellar Proximology'}}/>
      <Stack.Screen name="Relationship" component={RelationshipScreen} options={{title:'Relationship + Composite'}}/>
      <Stack.Screen name="Timing" component={TimingScreen} options={{title:'Timing + Transits'}}/>
      <Stack.Screen name="Portability" component={PortabilityScreen} options={{title:'Import / Export'}}/>
      <Stack.Screen name="Capabilities" component={CapabilitiesScreen} options={{title:'Capabilities'}}/>
      <Stack.Screen name="Matches" component={MatchingScreen}/>
    </Stack.Navigator>
  </NavigationContainer>;
}

function HomeScreen({navigation}){
  const [profile,setProfile]=useState(null);
  useEffect(()=>{ const unsub=navigation.addListener('focus',()=>profileStore.getCurrent().then(setProfile)); profileStore.getCurrent().then(setProfile); return unsub; },[navigation]);
  const go=(screen)=> profile ? navigation.navigate(screen,{profile}) : navigation.navigate('CreateProfile');
  return <ScrollView style={styles.home} contentContainerStyle={styles.homeContent}>
    <Text style={styles.eyebrow}>SOVEREIGN LOCAL COMPUTER</Text>
    <Text style={styles.homeTitle}>Resonance Network</Text>
    <Text style={styles.homeBody}>One portable profile feeds deterministic Human Design, geonatal astrology, Cynthia, Stellar, relationship/composite, timing/transits, matching, and local trajectory state.</Text>
    {profile ? <View style={styles.current}><Text style={styles.currentLabel}>CURRENT PROFILE</Text><Text style={styles.currentName}>{profile.name}</Text><Text style={styles.currentMeta}>{profile.humanDesign.type} • {profile.humanDesign.profile} • {profile.humanDesign.authority}</Text></View> : <View style={styles.current}><Text style={styles.currentName}>No profile yet</Text><Text style={styles.currentMeta}>Create one to activate the computer.</Text></View>}
    <HomeButton title={profile?'Open Current Profile':'Create Profile'} onPress={()=>profile?navigation.navigate('Profile',{profile}):navigation.navigate('CreateProfile')}/>
    <Text style={styles.sectionLabel}>LOCAL APPS</Text>
    <View style={styles.tileRow}><Tile title="Human Design" caption="BodyGraph mechanics" onPress={()=>go('HumanDesign')}/><Tile title="Astrology" caption="Tropical · Fagan · draconic" onPress={()=>go('Astrology')}/></View>
    <View style={styles.tileRow}><Tile title="Cynthia" caption="Cognition + trajectory" onPress={()=>go('Cynthia')}/><Tile title="Stellar" caption="Second face, same owner" onPress={()=>go('Stellar')}/></View>
    <View style={styles.tileRow}><Tile title="Relationship" caption="Delta + composite" onPress={()=>go('Relationship')}/><Tile title="Timing" caption="Transits + pressure" onPress={()=>go('Timing')}/></View>
    <View style={styles.tileRow}><Tile title="Field Lab" caption="Persistent observations" onPress={()=>go('Lab')}/><Tile title="Matches" caption="Saved profiles only" onPress={()=>go('Matches')}/></View>
    <View style={styles.tileRow}><Tile title="Import / Export" caption="User-owned profile bundle" onPress={()=>navigation.navigate('Portability')}/><Tile title="Capabilities" caption="Executable registry" onPress={()=>navigation.navigate('Capabilities')}/></View>
    <Text style={styles.homeNote}>Hosted Stellar and ChatGPT are optional adapters. They are not required for this computer to calculate or preserve local profile state. No random chart values or generated sample matches are used in the live path.</Text>
  </ScrollView>;
}

const HomeButton=({title,onPress})=><TouchableOpacity accessibilityRole="button" accessibilityLabel={title} style={styles.primary} onPress={onPress}><Text style={styles.primaryText}>{title}</Text></TouchableOpacity>;
const Tile=({title,caption,onPress})=><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open ${title}`} style={styles.tile} onPress={onPress}><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileCaption}>{caption}</Text></TouchableOpacity>;

const styles=StyleSheet.create({
  boot:{flex:1,backgroundColor:'#07100f',justifyContent:'center',alignItems:'center',padding:24},brand:{color:'#8df0d0',fontSize:24,fontWeight:'900',letterSpacing:2},bootSub:{color:'#89a09a',marginTop:9,marginBottom:25},logs:{marginTop:24,width:'100%'},log:{color:'#6f8d86',fontSize:11,marginBottom:4},
  home:{flex:1,backgroundColor:'#07100f'},homeContent:{padding:22,paddingBottom:50},eyebrow:{color:'#8df0d0',fontWeight:'900',fontSize:10,letterSpacing:2,marginTop:12},homeTitle:{color:'#f4fbf9',fontWeight:'900',fontSize:38,lineHeight:43,marginTop:8},homeBody:{color:'#98ada8',fontSize:15,lineHeight:23,marginTop:12},current:{backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#28443e',borderRadius:18,padding:17,marginTop:22},currentLabel:{color:'#728a84',fontSize:10,fontWeight:'900',letterSpacing:1.5},currentName:{color:'#e9f8f4',fontSize:21,fontWeight:'900',marginTop:5},currentMeta:{color:'#8fb0a8',fontSize:13,marginTop:5},primary:{backgroundColor:'#8df0d0',borderRadius:14,padding:15,alignItems:'center',marginTop:14},primaryText:{color:'#07100f',fontWeight:'900'},sectionLabel:{color:'#78918b',fontSize:10,fontWeight:'900',letterSpacing:1.8,marginTop:25,marginBottom:3},tileRow:{flexDirection:'row',justifyContent:'space-between',marginTop:12},tile:{width:'48.5%',minHeight:108,backgroundColor:'#0b1715',borderWidth:1,borderColor:'#1e3732',borderRadius:16,padding:15,justifyContent:'flex-end'},tileTitle:{color:'#e9f8f4',fontSize:16,fontWeight:'900'},tileCaption:{color:'#76908a',fontSize:11,marginTop:4,lineHeight:16},homeNote:{color:'#667f79',fontSize:11,lineHeight:17,marginTop:20},
});
