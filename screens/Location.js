import { StyleSheet, Text, View, Button, Pressable, TextInput } from 'react-native';
import { useEffect, useRef, useState, useLayoutEffect} from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc, setDoc, doc,getDoc} from "firebase/firestore"
import Toast from 'react-native-toast-message';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

export default function Location({navigation,route}){
    const {uid,peer_id} = route.params;
    const [timeStr,setTimeStr] = useState("");
    const [displayName,setDisplayName] = useState("");
    const [long,setLongitude] = useState('114.1350359');
    const [lat,setLatitude] = useState('22.2839936');
    const [enabled,setEnabled] = useState(null);
    const [coordinate,setCoordinate] = useState({});
    const [initial,setInitial] = useState({});
    const mapRef = useRef();


    useEffect(() => {
        async function getData(){
            try {
                const res = await getDoc(doc(db,'location',peer_id));
                const userInfo = (await getDoc(doc(db,'user',peer_id))).data();
                setDisplayName(userInfo.displayName)
                setEnabled(userInfo.trackingEnabled)
                const data = res.data().locationData.location;
                var time = new Date(data.timestamp);
                var year = time.getFullYear();
                var month = (time.getMonth()+1).toString().padStart(2,'0');
                var day = time.getDate().toString().padStart(2,'0');
                var hour = time.getHours().toString().padStart(2,'0');
                var minute = time.getMinutes().toString().padStart(2,'0');
                var second = time.getSeconds().toString().padStart(2,'0');
                var time = [year,month,day].join('.')+' '+[hour,minute,second].join(':');
                setTimeStr(time);
                setLongitude(data.coords.longitude)
                setLatitude(data.coords.latitude)
            } catch (err) {
                console.log(err)
            }
        }
        getData()
    } , [])

    useEffect(()=>{
        console.log(long)
        console.log(lat)
    },[long,lat])

    return(
        <View>
        {enabled && <View style={styles.container}>
            <Text style={{fontSize: 20, textAlign:'center', marginTop:10,fontWeight:'bold'}}>{displayName}'s Location</Text>
            <Text style={{fontSize: 20, textAlign:'center', marginVertical:5}}>{timeStr}</Text>
            <MapView style={styles.map} initialRegion={{longitude: parseFloat(long),
                    latitude: parseFloat(lat),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,}}>
                <Marker coordinate={{latitude: parseFloat(lat), longitude:parseFloat(long)}}></Marker>
            </MapView>
        </View>}
        {!enabled && <View><Text style={{fontSize:20,fontWeight:'bold',textAlign:'center',marginTop:20}}>{displayName} did not enable location tracking!</Text></View>}
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        height:'100%',
    },
    map:{
        ...StyleSheet.absoluteFill,
        top: 70,
    },
  });