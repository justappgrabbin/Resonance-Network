import React, {useEffect, useState} from 'react';
import {
  Alert, ActivityIndicator, ScrollView, Share, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import {profileStore} from './Core/ProfileStore';
import {journeyJournal} from './Core/JourneyJournal';
import {
  alreadyReceived, decodePeerUpdate, encodePeerUpdate, feedItems
} from './Core/PeerExchange';

function Action({label,onPress,secondary=false,disabled=false}) {
  return <TouchableOpacity onPress={onPress} disabled={disabled}
    style={[styles.action,secondary&&styles.secondary,disabled&&styles.disabled]}>
    <Text style={[styles.actionText,secondary&&styles.secondaryText]}>{label}</Text>
  </TouchableOpacity>;
}

export default function CommunityScreen({navigation}) {
  const [profile,setProfile] = useState(null);
  const [history,setHistory] = useState([]);
  const [draft,setDraft] = useState('');
  const [paste,setPaste] = useState('');
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState('');

  const load = async () => {
    setBusy(true);
    try {
      const p = await profileStore.getCurrent();
      setProfile(p);
      setHistory(p ? await journeyJournal.list(p.id) : []);
      setError('');
    } catch(err) {setError(err?.message||String(err));}
    finally {setBusy(false);}
  };
  useEffect(()=>{
    load();
    const unsub=navigation.addListener('focus',load);
    return unsub;
  },[navigation]);

  const shareUpdate = async (record) => {
    const code=encodePeerUpdate({
      senderId:profile.id,senderName:profile.name,
      messageId:record.id,createdAt:record.createdAt,text:record.payload.text
    });
    // The OS controls delivery and recipient. Saving a draft is not proof of delivery.
    await Share.share({
      title:'Resonance Network update',
      message:'Resonance Network update from '+profile.name+
        '\nCopy the complete code into Community → Receive Update.\n'+code
    });
  };

  const post = async () => {
    if (!profile || busy) return;
    const text=draft.trim();
    if (!text || text.length>1200) return;
    setBusy(true);
    try {
      const created=await journeyJournal.append(profile.id,'peer-outgoing',{text});
      setHistory(await journeyJournal.list(profile.id));
      setDraft('');
      await shareUpdate(created);
    } catch(err) {
      const message=err?.message||String(err);
      setError(message);
      Alert.alert('Could not prepare update',message);
    } finally {setBusy(false);}
  };

  const receive = async () => {
    if (!profile || busy) return;
    setBusy(true);
    try {
      const decoded=decodePeerUpdate(paste);
      const records=await journeyJournal.list(profile.id);
      if (alreadyReceived(records,decoded)) {
        Alert.alert('Already received','This exact update is in your local Community.');
        return;
      }
      if (decoded.senderId===profile.id) {
        Alert.alert('Your update','You cannot add a message from your own profile as a peer.');
        return;
      }
      await journeyJournal.append(profile.id,'peer-incoming',decoded);
      setHistory(await journeyJournal.list(profile.id));
      setPaste('');
      setError('');
      Alert.alert('Update imported','A peer update was saved locally. Its sender has not been authenticated.');
    } catch(err) {
      const message=err?.message||String(err);
      setError(message);
      Alert.alert('Import failed',message);
    } finally {setBusy(false);}
  };

  if (busy && !profile) return <View style={styles.center}>
    <ActivityIndicator color="#8df0d0"/>
  </View>;
  if (!profile) return <View style={styles.center}>
    <Text style={styles.title}>Create a profile to join</Text>
    <Action label="Create Profile" onPress={()=>navigation.navigate('CreateProfile')}/>
  </View>;

  const feed=feedItems(history,profile.id);
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}
    keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>RESONANCE NETWORK · COMMUNITY</Text>
    <Text style={styles.title}>A network we grow together</Text>
    <Text style={styles.meta}>Share a message with a friend by Android's share sheet.
      Friends using this app can paste your code to receive it—even without a server.
      This is a manual exchange, not automatic synchronization.</Text>

    <Text style={styles.section}>Send an invitation or an update</Text>
    <TextInput style={styles.input} multiline maxLength={1200}
      placeholder="What would you like to share with someone?"
      placeholderTextColor="#809b94" value={draft} onChangeText={setDraft}/>
    <Text style={styles.privacy}>Only the name “{profile.name}” and these words are sent.
      No birth date, chart, coordinates, private goals or observations are included.</Text>
    <Action label="Save & Share My Update" onPress={post}
      disabled={busy||!draft.trim()}/>

    <Text style={styles.section}>Receive a friend's update</Text>
    <TextInput style={styles.input} multiline
      placeholder="Paste the full RESONANCE1: code from a friend"
      placeholderTextColor="#809b94" value={paste} onChangeText={setPaste}/>
    <Action label="Import Update to My Community" secondary onPress={receive}
      disabled={busy||!paste.trim()}/>

    <Text style={styles.section}>My local community · {feed.length}</Text>
    {!feed.length&&<View style={styles.card}>
      <Text style={styles.meta}>Your shared updates and manually received updates will appear here.</Text>
    </View>}
    {feed.map(item=><View style={styles.card} key={item.id}>
      <Text style={styles.author}>{item.senderName}</Text>
      <Text style={styles.meta}>{item.source==='mine'?'Prepared on this phone':'Received by code · unverified sender'}</Text>
      <Text style={styles.body}>{item.text}</Text>
      {item.source==='mine'&&<Action label="Share This Again" secondary
        disabled={busy} onPress={()=>{
          const original=history.find(e=>e.id===item.id);
          if(original) shareUpdate(original).catch(err=>setError(err.message||String(err)));
        }}/>}
    </View>)}
    {!!error&&<Text style={styles.error}>{error}</Text>}
    <Text style={styles.privacy}>Import codes are not identity verification.
      Do not treat a claimed sender as authenticated. Anyone holding a code can read its text.
      There are no automated invites, accounts, real-time conversations or remote peers yet.</Text>
  </ScrollView>;
}

const styles=StyleSheet.create({
  page:{flex:1,backgroundColor:'#07100f'},
  content:{padding:20,paddingBottom:64},
  center:{flex:1,backgroundColor:'#07100f',justifyContent:'center',padding:22},
  eyebrow:{color:'#8df0d0',letterSpacing:2,fontWeight:'900',fontSize:11,marginBottom:10},
  title:{color:'#f3fff9',fontWeight:'900',fontSize:28,lineHeight:35,marginBottom:11},
  meta:{color:'#9fb9b1',fontSize:13,lineHeight:19,marginTop:4},
  section:{color:'#f1f9f6',fontSize:18,fontWeight:'900',marginTop:24,marginBottom:8},
  input:{minHeight:95,color:'#fff',backgroundColor:'#10241e',padding:15,
    textAlignVertical:'top',borderColor:'#385a4d',borderWidth:1,borderRadius:13,marginTop:5},
  action:{backgroundColor:'#8df0d0',padding:15,borderRadius:12,alignItems:'center',marginTop:10},
  secondary:{backgroundColor:'#14342b',borderWidth:1,borderColor:'#305e4e'},
  disabled:{opacity:0.4},
  actionText:{fontWeight:'900',color:'#07100f'},
  secondaryText:{color:'#e9fff6'},
  privacy:{color:'#8ba89e',fontSize:12,lineHeight:19,marginTop:12},
  card:{backgroundColor:'#0f211c',borderWidth:1,borderColor:'#2b4c41',borderRadius:15,padding:16,marginBottom:11},
  author:{fontWeight:'900',color:'#8df0d0',fontSize:15},
  body:{color:'#e7f7ef',fontSize:15,lineHeight:22,marginTop:11},
  error:{color:'#ffb5aa',fontSize:13,marginTop:12}
});
