import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SystemBootstrap } from './Core/SystemBootstrap';
import { profileStore } from './Core/ProfileStore';
import { purposeStore } from './Core/PurposeStore';
import { ProfileCreationScreen, ProfileScreen, MatchingScreen } from './ProfileScreens';
import { HumanDesignScreen, AstrologyScreen } from './SystemScreens';
import LabScreen from './LabScreen';
import AgentContactScreen from './AgentScreens';
import PurposeScreen, { EntryScreen } from './PurposeScreens';

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
    <Stack.Navigator initialRouteName="Entry" screenOptions={{headerStyle:{backgroundColor:'#07100f'},headerTintColor:'#dff7f1',headerTitleStyle:{fontWeight:'800'},cardStyle:{backgroundColor:'#07100f'}}}>
      <Stack.Screen name="Entry" component={EntryScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Purpose" component={PurposeScreen} options={{title:'Purpose Fulfillment'}}/>
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
  const [purpose,setPurpose]=useState(null);

  useEffect(()=>{
    const refresh=()=>Promise.all([profileStore.getCurrent(),purposeStore.get()]).then(([p,pu])=>{setProfile(p);setPurpose(pu);});
    const unsub=navigation.addListener('focus',refresh);
    refresh();
    return unsub;
  },[navigation]);

  const go=(screen)=> profile ? navigation.navigate(screen,{profile}) : navigation.navigate('CreateProfile');

  return <ScrollView style={styles.home} contentContainerStyle={styles.homeContent}>
    <Text style={styles.eyebrow}>LOCAL-FIRST PURPOSE + RESONANCE NETWORK</Text>
    <Text style={styles.homeTitle}>Your pathway comes before the menu.</Text>
    <Text style={styles.homeBody}>Cynthia starts with who you are, where you are, what you want, and what is in the way. Resonance then reuses one local Human Design + astrology profile across the rest of the system.</Text>

    {purpose?.pathway ? <View style={styles.pathway}>
      <Text style={styles.pathwayStage}>{purpose.pathway.stage} · CURRENT PATHWAY</Text>
      <Text style={styles.pathwayHeadline}>{purpose.pathway.headline}</Text>
      <Text style={styles.pathwayLabel}>NEXT MOVE</Text>
      <Text style={styles.pathwayMove}>{purpose.pathway.nextMove}</Text>
    </View> : <View style={styles.pathway}>
      <Text style={styles.pathwayStage}>FIRST CONTACT</Text>
      <Text style={styles.pathwayHeadline}>Cynthia has not finished your purpose intake yet.</Text>
      <Text style={styles.pathwayMove}>Start with the conversation. Your answers become local pathway state, not disposable chat.</Text>
    </View>}

    <HomeButton title={purpose?.completed?'Continue Pathway':'Meet Cynthia + Start'} onPress={()=>navigation.navigate('Purpose',{profile})}/>

    {profile ? <View style={styles.current}><Text style={styles.currentLabel}>CURRENT RESONANCE PROFILE</Text><Text style={styles.currentName}>{profile.name}</Text><Text style={styles.currentMeta}>{profile.humanDesign.type} • {profile.humanDesign.profile} • {profile.humanDesign.authority}</Text></View> : <View style={styles.current}><Text style={styles.currentName}>No design profile yet</Text><Text style={styles.currentMeta}>Cynthia will send you to the one local calculation when the intake reaches that point.</Text></View>}

    <View style={styles.tileRow}><Tile title="Cynthia" caption="Resident text · call · peek" onPress={()=>navigation.navigate('Cynthia')}/><Tile title="Matches" caption="People + resonance" onPress={()=>go('Matches')}/></View>
    <View style={styles.tileRow}><Tile title="Human Design" caption="One shared BodyGraph" onPress={()=>go('HumanDesign')}/><Tile title="Astrology" caption="One shared triad" onPress={()=>go('Astrology')}/></View>
    <View style={styles.tileRow}><Tile title="Cynthia Lab" caption="Observe what happens" onPress={()=>go('Lab')}/><Tile title="Profile" caption="Identity + field layer" onPress={()=>profile?navigation.navigate('Profile',{profile}):navigation.navigate('CreateProfile')}/></View>
    <Text style={styles.homeNote}>The pathway does not replace Human Design, astrology, Cynthia, the Lab, matching, or Agentic Reality. It is the layer that turns them into an ongoing Know → Try → Observe → Learn loop.</Text>
  </ScrollView>;
}

const HomeButton=({title,onPress})=><TouchableOpacity style={styles.primary} onPress={onPress}><Text style={styles.primaryText}>{title}</Text></TouchableOpacity>;
const Tile=({title,caption,onPress})=><TouchableOpacity style={styles.tile} onPress={onPress}><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileCaption}>{caption}</Text></TouchableOpacity>;

const styles=StyleSheet.create({
  boot:{flex:1,backgroundColor:'#07100f',justifyContent:'center',alignItems:'center',padding:24},brand:{color:'#8df0d0',fontSize:24,fontWeight:'900',letterSpacing:2},bootSub:{color:'#89a09a',marginTop:9,marginBottom:25},logs:{marginTop:24,width:'100%'},log:{color:'#6f8d86',fontSize:11,marginBottom:4},
  home:{flex:1,backgroundColor:'#07100f'},homeContent:{padding:22,paddingBottom:50},eyebrow:{color:'#8df0d0',fontWeight:'900',fontSize:10,letterSpacing:2,marginTop:12},homeTitle:{color:'#f4fbf9',fontWeight:'900',fontSize:34,lineHeight:40,marginTop:10},homeBody:{color:'#98ada8',fontSize:15,lineHeight:23,marginTop:12},
  pathway:{backgroundColor:'#0d1b19',borderWidth:1,borderColor:'#31564d',borderRadius:18,padding:17,marginTop:22},pathwayStage:{color:'#8df0d0',fontSize:10,fontWeight:'900',letterSpacing:1.5},pathwayHeadline:{color:'#eef9f6',fontSize:18,lineHeight:25,fontWeight:'900',marginTop:7},pathwayLabel:{color:'#6f8b84',fontSize:9,fontWeight:'900',letterSpacing:1.4,marginTop:14},pathwayMove:{color:'#a9bdb8',fontSize:13,lineHeight:20,marginTop:5},
  current:{backgroundColor:'#0b1715',borderWidth:1,borderColor:'#1e3732',borderRadius:18,padding:17,marginTop:16},currentLabel:{color:'#728a84',fontSize:10,fontWeight:'900',letterSpacing:1.5},currentName:{color:'#e9f8f4',fontSize:21,fontWeight:'900',marginTop:5},currentMeta:{color:'#8fb0a8',fontSize:13,marginTop:5},
  primary:{backgroundColor:'#8df0d0',borderRadius:14,padding:15,alignItems:'center',marginTop:14},primaryText:{color:'#07100f',fontWeight:'900'},tileRow:{flexDirection:'row',justifyContent:'space-between',marginTop:12},tile:{width:'48.5%',minHeight:115,backgroundColor:'#0b1715',borderWidth:1,borderColor:'#1e3732',borderRadius:16,padding:15,justifyContent:'flex-end'},tileTitle:{color:'#e9f8f4',fontSize:17,fontWeight:'900'},tileCaption:{color:'#76908a',fontSize:12,marginTop:4},homeNote:{color:'#667f79',fontSize:11,lineHeight:17,marginTop:18},
});
