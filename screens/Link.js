import { StyleSheet, Text, View, Button, Pressable, TextInput, FlatList } from 'react-native';
import { useEffect, useState,forceUpdate } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc, setDoc, doc,getDoc} from "firebase/firestore"
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

export default function MainScreen({route,navigation}){
    const {uid} = route.params
    const [link, setLink] = useState(true)
    const [add, setAdd] = useState(false)
    const [pid, setPid] = useState("")
    const [linkList,setLinkList] = useState([])
    const [requestList,setRequestList] = useState([])
    const [update, setUpdate] = useState(0)
    const [linkName, setLinkName] = useState([])
    const [reqName, setReqName] = useState([])

    useEffect(() =>{
        async function getData(){
            try{
            const l = (await getDoc(doc(db,'link',uid))).data();
            const r = (await getDoc(doc(db,'request',uid))).data();
            if (l != undefined && JSON.stringify(linkList) != JSON.stringify(l.id)){
                setLinkList(l.id)
            }
            if (r != undefined && JSON.stringify(requestList) != JSON.stringify(r.id)){
                setRequestList(r.id)
            }
            for (let i =0; i< linkList.length; i++){
                let n = linkList[i];
                let name = (await getDoc(doc(db,'user',n))).data().displayName;
                setLinkName((prev)=>{
                    if (!prev.includes(name)){
                    prev.push(name);
                    }
                    return prev
                }) 
            }
            for (let i =0; i< requestList.length; i++){
                let n = requestList[i];
                let name = (await getDoc(doc(db,'user',n))).data().displayName;
                setReqName((prev)=>{
                    if (!prev.includes(name)){
                        prev.push(name);
                        }
                    return prev
                }) 
            }
        }
        catch(err){
            console.log(err)
        }
    }
        getData()
    },[])

    useEffect(()=>{
        async function getData(){
            try{
            let list = [];
            for (let i =0; i< linkList.length; i++){
                let n = linkList[i];
                let name = (await getDoc(doc(db,'user',n))).data().displayName;
                list.push(name)
            }
            setLinkName(list)
        }
        catch(err){
            console.log(err)
        }
    }
        getData()
    },[linkList])

    useEffect(()=>{
        async function getData(){
            try{
            let list = [];
            for (let i =0; i< requestList.length; i++){
                let n = requestList[i];
                let name = (await getDoc(doc(db,'user',n))).data().displayName;
                list.push(name)
            }
            setReqName(list)
        }
        catch(err){
            console.log(err)
        }
    }
        getData()
    },[requestList])

    const handleLink = () =>{
        setLink(true)
        setAdd(false)
        setUpdate(prev => {return prev + 1})
    }

    const handleAdd = () =>{
        setAdd(true)
        setLink(false)
        setUpdate(prev => {return prev + 1})
    }

    const handleRequest = async() =>{
        if (linkList.includes(pid)){
            Toast.show({type: 'error',text1: "User already linked !",position:'bottom'})
            return
        }
        if (requestList.includes(pid)){
            Toast.show({type: 'error',text1: "This user has sent you a request! Accept it!",position:'bottom'})
            return
        }
        const res = (await getDoc(doc(db,'user',pid))).data();
        if (res == undefined){
            Toast.show({type: 'error',text1: "Wrong uid! User does not exist",position:'bottom'})
            return
        }
        let peer_requestList
        try{
            const currentList = (await getDoc(doc(db,'request',pid))).data();
            if (currentList == undefined){
                peer_requestList= []
            }
            else{
                peer_requestList= currentList.id
            }
            if (peer_requestList.includes(uid)){
                Toast.show({type: 'error',text1: "You have already sent a request to this user!",position:'bottom'})
                return
            }
            else{
                peer_requestList.push(uid)
            }
            const res = await setDoc(doc(db,'request',pid),{id: peer_requestList})
            Toast.show({type: 'success',text1: "Request has been sucessfully sent!",position:'bottom'})
            setPid("")
        }
        catch(err){
            console.log(err)
        }
    }

    const handleAccept = async(index) =>{
        peer_id = '' + requestList[index.index]
        try{
            my_list = (await getDoc(doc(db,'link',uid))).data();
            peer_list = (await getDoc(doc(db,'link',peer_id))).data();
            if (my_list == undefined){
                my_list = []
            }
            else{
                my_list = my_list.id
            }
            if (peer_list == undefined){
                peer_list = []
            }
            else{
                peer_list = peer_list.id
            }
            if (!my_list.includes(peer_id)){
                my_list.push(peer_id)
            }
            if (!peer_list.includes(uid)){
                peer_list.push(uid)
            }
            const res1 = await setDoc(doc(db,'link',uid),{id: my_list})
            const res2 = await setDoc(doc(db,'link',peer_id),{id: peer_list})
            setRequestList(prev => {prev.splice(index.index,1); return prev})
            setReqName(prev => {prev.splice(index.index,1); return prev})
            const res3 = await setDoc(doc(db,'request',uid),{id: requestList})
            const res4 = (await getDoc(doc(db,'user',peer_id))).data().displayName
            setLinkList(prev => {prev.push(peer_id); return prev})
            setLinkName(prev => {prev.push(res4); return prev})
            setUpdate(prev => {return prev + 1})
        }
        catch(err){
            console.log(err)
        }
    }

    const handleReject = async(index) =>{
        console.log("clicked")
        peer_id = '' + requestList[index.index]
        try{
            setRequestList(prev => {prev.splice(index.index,1); return prev})
            setReqName(prev => {prev.splice(index.index,1); return prev})
            const res3 = await setDoc(doc(db,'request',uid),{id: requestList})
            setUpdate(prev => {return prev + 1})
        }
        catch(err){
            console.log(err)
        }
    }

    const handleLocation = (index) =>{
        navigation.navigate('Location',{uid: uid,peer_id:linkList[index.index]})   
    }

    return(
        <View>
            <View style={{flexDirection:'row', alignSelf:'center'}}>
            <Pressable onPress={handleLink} style={link ? styles.on : styles.off}><Text style={link ? styles.texton : styles.textoff}>Linked users</Text></Pressable>
            <Pressable onPress={handleAdd} style={add ? styles.on : styles.off}><Text style={add ? styles.texton : styles.textoff}>Add users</Text></Pressable>
            </View>
            {link && <FlatList data={linkName} renderItem={({item,index}) => {
            return <Pressable onPress={() =>{handleLocation({index})}} style={styles.linkname}>
                <Text style={{fontSize:30,textAlign:"center",textAlignVertical:'center',fontWeight:'bold'}}>{item}</Text>
                </Pressable>}}>
                    </FlatList>}

            {add && <View>
                <Text style={{fontSize:20,textAlign:'center',fontWeight:'bold',marginVertical:5,}}>Your ID:</Text>
                <Pressable onPress={() =>{Clipboard.setStringAsync(uid); Toast.show({type: 'success',text1: "Copied to clipboard",position:'bottom'})}}>
                    <Text style={{fontSize:20,textAlign:'center',fontWeight:'bold',marginVertical:5,}}>{uid}</Text>
                </Pressable>
                <TextInput placeholder='Enter peer ID' value={pid} onChange={(event)=>setPid(event.nativeEvent.text)} style={styles.input}></TextInput>
                <Pressable onPress={handleRequest} style={styles.button}>
                    <Text style={{fontSize:20,color:'white'}}>Send Request</Text>
                </Pressable>
                <Text style={{fontSize:20,textAlign:'center',fontWeight:'bold',marginTop:20,}}>Received Request</Text>
                <FlatList data={reqName} renderItem={({item,index}) =>{return <View style={styles.container}>
                    <Text style={{fontSize:25, fontWeight:'bold',textAlignVertical:'center',paddingLeft:15}}>{item}</Text> 
                    <View style={{flexDirection:'row',paddingRight:15,}}>
                    <Pressable onPress={() => {handleAccept({index})}} style={{alignSelf: 'flex-end'}}><Text style={{fontSize:30,fontWeight:'bold',textAlignVertical:'center',color:'green',marginHorizontal:10,paddingBottom:8}}>✓</Text></Pressable> 
                    <Pressable onPress={() => {handleReject({index})}} style={{alignSelf:'flex-end'}}><Text style={{fontSize:30,fontWeight:'bold',textAlignVertical:'center',color:'red',marginHorizontal:10,paddingBottom:1}}>X</Text></Pressable>
                    </View>
                    </View>}}>
                    </FlatList>
                </View>}
            <Toast></Toast>
        </View>
    );
};

const styles = StyleSheet.create({
    on:{
        backgroundColor: '#5db075',
        borderRadius: 30,
        margin: 10,
        padding: 10,
    },
    off:{
        backgroundColor: "#DEDEDE",
        borderRadius: 30,
        margin: 10,
        padding: 10,
    },
    texton:{
        color: "white",
        fontSize: 20,
    },
    textoff:{
        color: "grey",
        fontSize: 20,
    },
    linkname:{
        backgroundColor: "#DEDEDE",
        width: '60%',
        borderRadius: 40,
        alignSelf:'center',
        marginVertical: 15,
    },
    input:{
        width: "80%",
        fontSize: 20,
        paddingLeft:10,
        height: "15%",
        borderRadius: 10,
        alignSelf:'center',
        backgroundColor: '#DEDEDE',
        marginVertical: 5,
    },
    button:{
        width: "80%",
        height: '15%',
        borderRadius: 50,
        fontSize: 25,
        marginVertical: 10,
        backgroundColor:"#5db075",
        alignSelf:'center',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color:"#5db075",
    },
    container:{
        flexDirection:'row',
        backgroundColor:"#DEDEDE",
        height: 40,
        width: '80%',
        alignSelf:'center',
        borderRadius:40,
        marginVertical:15,
        justifyContent: 'space-between',
    },
  })