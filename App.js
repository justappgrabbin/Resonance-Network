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
import AgentContactScreen from './AgentScreens';

const Stack = createStackNavigator();

export default function App() {
  const [ready,setReady]=useState(false);
  const [bootLog,setBootLog]=useState([]);
  useEffect(()=>{
    const bootstrap=new SystemBootstrap();
    bootstrap.on('log',msg=>setBootLog(prev=>[...prev,msg].slice(-6)));
    bootstrap.init().then(()=>setReady(true)).catch(err=>setBootLog(prev=>[...prev,`ERROR: ${err.message}`]));
  },[]);

  if(!ready) return <View style={styles.boot}><Text style={styles.brand}>RESONANCE NETWORK</Text><Text style={styles.bootSub}>Wiring local chart + resonance systems…</Text><ActivityIndicator color="#8df0d0" size="large"/><View style={styles.logs}>{bootLog.map((l,i)=><Text style={styles.log} key={i}>{l}</Text>)}</View></View>;

  return <NavigationContainer>
    <Stack.Navigator initialRouteName="Home" screenOptions={{headerStyle:{backgroundColor:'#07100f'},headerTintColor:'#dff7f1',headerTitleStyle:{fontWeight:'800'},cardStyle:{backgroundColor:'#07100f'}}}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'Resonance Network'}}/>
      <Stack.Screen name="Cynthia" component={AgentContactScreen} options={{title:'Cynthia'}}/>
      <Stack.Screen name="CreateProfile" component={ProfileCreationScreen} options={{title:'Create Profile'}}/>
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="HumanDesign" component={HumanDesignScreen} options={{title:'Human Design'}}/>
      <Stack.Screen name="Astrology" component={AstrologyScreen}/>
      <Stack.Screen name="Lab" component={LabScreen} options={{title:'Cynthia Lab'}}/>
      <Stack.Screen name="Matches" component={MatchingScreen}/>
    </Stack.Navigator>
  </NavigationContainer>;
}

function HomeScreen({navigation}){
  const [profile,setProfile]=useState(null);
  useEffect(()=>{ const unsub=navigation.addListener('focus',()=>profileStore.getCurrent().then(setProfile)); profileStore.getCurrent().then(setProfile); return unsub; },[navigation]);
  const go=(screen)=> profile ? navigation.navigate(screen,{profile}) : navigation.navigate('CreateProfile');
  return <ScrollView style={styles.home} contentContainerStyle={styles.homeContent}>
    <Text style={styles.eyebrow}>LOCAL-FIRST CREATOR RESONANCE SYSTEM</Text>
    <Text style={styles.homeTitle}>One profile. One resident. Multiple ways in.</Text>
    <Text style={styles.homeBody}>Human Design, astrology, resonance, Cynthia, and Agentic Reality share the same local system. The normal pages remain the default; the world is optional.</Text>
    {profile ? <View style={styles.current}><Text style={styles.currentLabel}>CURRENT PROFILE</Text><Text style={styles.currentName}>{profile.name}</Text><Text style={styles.currentMeta}>{profile.humanDesign.type} • {profile.humanDesign.profile} • {profile.humanDesign.authority}</Text></View> : <View style={styles.current}><Text style={styles.currentName}>No profile yet</Text><Text style={styles.currentMeta}>Create one to activate the system.</Text></View>}
    <HomeButton title={profile?'Open Current Profile':'Create Profile'} onPress={()=>profile?navigation.navigate('Profile',{profile}):navigation.navigate('CreateProfile')}/>
    <View style={styles.tileRow}><Tile title="Cynthia" caption="Text · call · peek" onPress={()=>navigation.navigate('Cynthia')}/><Tile title="Matches" caption="People + resonance" onPress={()=>go('Matches')}/></View>
    <View style={styles.tileRow}><Tile title="Human Design" caption="BodyGraph mechanics" onPress={()=>go('HumanDesign')}/><Tile title="Astrology" caption="Triad engine" onPress={()=>go('Astrology')}/></View>
    <View style={styles.tileRow}><Tile title="Cynthia Lab" caption="Connected experiments" onPress={()=>go('Lab')}/><Tile title="Profile" caption="Your normal pages" onPress={()=>profile?navigation.navigate('Profile',{profile}):navigation.navigate('CreateProfile')}/></View>
    <Text style={styles.homeNote}>Agentic Reality is an optional surface. Resonance does not create a second Cynthia when you open chat or Peek.</Text>
  </ScrollView>;
}

const HomeButton=({title,onPress})=><TouchableOpacity style={styles.primary} onPress={onPress}><Text style={styles.primaryText}>{title}</Text></TouchableOpacity>;
const Tile=({title,caption,onPress})=><TouchableOpacity style={styles.tile} onPress={onPress}><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileCaption}>{caption}</Text></TouchableOpacity>;

const styles=StyleSheet.create({
  boot:{flex:1,backgroundColor:'#07100f',justifyContent:'center',alignItems:'center',padding:24},brand:{color:'#8df0d0',fontSize:24,fontWeight:'900',letterSpacing:2},bootSub:{color:'#89a09a',marginTop:9,marginBottom:25},logs:{marginTop:24,width:'100%'},log:{color:'#6f8d86',fontSize:11,marginBottom:4},
  home:{flex:1,backgroundColor:'#07100f'},homeContent:{padding:22,paddingBottom:50},eyebrow:{color:'#8df0d0',fontWeight:'900',fontSize:10,letterSpacing:2,marginTop:12},homeTitle:{color:'#f4fbf9',fontWeight:'900',fontSize:34,lineHeight:40,marginTop:10},homeBody:{color:'#98ada8',fontSize:15,lineHeight:23,marginTop:12},current:{backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#28443e',borderRadius:18,padding:17,marginTop:22},currentLabel:{color:'#728a84',fontSize:10,fontWeight:'900',letterSpacing:1.5},currentName:{color:'#e9f8f4',fontSize:21,fontWeight:'900',marginTop:5},currentMeta:{color:'#8fb0a8',fontSize:13,marginTop:5},primary:{backgroundColor:'#8df0d0',borderRadius:14,padding:15,alignItems:'center',marginTop:14},primaryText:{color:'#07100f',fontWeight:'900'},tileRow:{flexDirection:'row',justifyContent:'space-between',marginTop:12},tile:{width:'48.5%',minHeight:115,backgroundColor:'#0b1715',borderWidth:1,borderColor:'#1e3732',borderRadius:16,padding:15,justifyContent:'flex-end'},tileTitle:{color:'#e9f8f4',fontSize:17,fontWeight:'900'},tileCaption:{color:'#76908a',fontSize:12,marginTop:4},homeNote:{color:'#667f79',fontSize:11,lineHeight:17,marginTop:18},
});
