import { StyleSheet, Text, View, Button, Pressable, TextInput,FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc,getDoc,doc, collection,setDoc} from "firebase/firestore"
import Toast from 'react-native-toast-message';

export default function Message({route,navigation}){
    const {uid} = route.params;
    const [linkList,setLinkList] = useState([])
    const [warningList,setWarningList] = useState([])

    useEffect(() =>{
        async function getData(){
            try {
                const l = (await getDoc(doc(db,'link',uid))).data();
                if (l != undefined){
                    setLinkList(l.id)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getData()
    },[])

    useEffect(()=>{
        async function getWarning(){
            let warnings = []
            for (let i = 0; i < linkList.length; i++){
                const w = (await getDoc(doc(db,'warning',linkList[i]))).data();
                if (w != undefined){
                    warnings = warnings.concat(w.data)
                }
            }
            warnings = warnings.sort((a,b) =>(parseInt(a.time) > parseInt(b.time)) ? -1 : 1)
            setWarningList(warnings)
        }
        getWarning()
    },[linkList])

    return(
        <View>
            <Text style={{fontSize:25,fontWeight:'bold',textAlign:'center',marginVertical:10,}}>Warning History</Text>
            <FlatList data={warningList} renderItem={({item}) =>{
                return <View style={{backgroundColor:"#DEDEDE", width: '80%',height:'auto' ,alignSelf:'center',marginVertical: 10}}>
                <Text style={{fontSize: 20}}>{item.text}</Text>
                </View>
                }}></FlatList>
        </View>
    );
};