import { StyleSheet, Text, View, Button, Pressable, TextInput, PermissionsAndroid, Platform } from 'react-native';
import { useState, useEffect  } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc, setDoc, doc,getDoc} from "firebase/firestore"
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import CallDetectorManager from 'react-native-call-detection'
import { Accelerometer } from 'expo-sensors';   
import { parse } from 'node-html-parser';

export default function MainScreen({route,navigation}){
    const {uid} = route.params;
    this.uid = uid
    const [data, setData] = useState();
    const [update, setUpdate] = useState(0);
    const [logout,setLogout] = useState(false);
    const [displayName,setDisplayName] = useState("");
    const [linkList,setLinkList] = useState([])
    const [scam,setScam] = useState(false);
    const [body,setBody] = useState(false);
    const [upper,setUpper] = useState();
    const [lower,setLower] = useState();
    const [url,setUrl] = useState();
    const [{ x, y, z }, setAcc] = useState({
        x: 0,
        y: 0,
        z: 0,
      });
    
    const TASK_FETCH_LOCATION = 'TASK_FETCH_LOCATION';
    TaskManager.defineTask(TASK_FETCH_LOCATION, async ({ data: { locations }, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        const [location] = locations;
        try {
          const res = await setDoc(doc(db,'location',uid),{locationData: {location}})
        } catch (err) {
          console.error(err);
        }
      });
    
    const issueWarning = async(mode,data) =>{
        try{
            const timestamp = Date.now()
            const time = new Date(timestamp)
            var year = time.getFullYear();
            var month = (time.getMonth()+1).toString().padStart(2,'0');
            var day = time.getDate().toString().padStart(2,'0');
            var hour = time.getHours().toString().padStart(2,'0');
            var minute = time.getMinutes().toString().padStart(2,'0');
            var second = time.getSeconds().toString().padStart(2,'0');
            var timeStr = [year,month,day].join('.')+' '+[hour,minute,second].join(':');
            let warningMsg = ''

            if (mode === 0){
                warningMsg = `[${timeStr}]\n${displayName} is detected to have a suspicious fall`;
            }
            else if (mode === 1){
                warningMsg = `[${timeStr}]\n${displayName} received a suspected scam call from ${data}`;
            }
            else if (mode === 2){
                warningMsg = `[${timeStr}]\n${displayName} is having an abnormal heart rate: ${data} bpm`;
            }

            let arr = []
            const prev = await getDoc(doc(db,'warning',uid));
            if (prev._document != null){
                arr = prev.data().data
            }

            if (arr.length > 0){
                if (timestamp - arr[arr.length-1].time < 5000){
                    return
                }
            }
            arr.push({text:warningMsg,time:timestamp})
            console.log("warning issued")
            await setDoc(doc(db,'warning',uid),{data: arr});
            await setDoc(doc(db,'new_warning',uid),{warning: true});
        }
        catch(err){
            console.log(err)
        }
    } 

    useEffect(()=>{
    const a = Math.sqrt(x*x+y*y+z*z);
    if (a >= 3 && a <= 15){
        console.log("fall detected")
        issueWarning(0,0)
    }},[x,y,z])

    useEffect(()=>{
        navigation.addListener('beforeRemove',(e)=>{e.preventDefault();if (logout){navigation.dispatch(e.data.action); return}})
        async function getData(){
            try{
                const res = await getDoc(doc(db,'user',uid));
                const data = res.data();
                setDisplayName(data.displayName);
                const tracking = data.trackingEnabled;
                const call = data.callEnabled;
                const fall = data.fallEnabled;
                setBody(data.statusEnabled);
                setUpper(data.upperRange);
                setLower(data.lowerRange);
                const trackingStarted = await Location.hasStartedLocationUpdatesAsync(TASK_FETCH_LOCATION)
                if (tracking && !trackingStarted){
                    await Location.requestForegroundPermissionsAsync()
                    await Location.requestBackgroundPermissionsAsync()
                    Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
                        accuracy: Location.Accuracy.Highest,
                        distanceInterval: 1, 
                        deferredUpdatesInterval: 100, 
                        foregroundService: {
                          notificationTitle: 'Using your location',
                          notificationBody: 'To turn off, disable location tracking in settings',
                        },
                      });
                }
                if (!tracking){
                    if (trackingStarted){
                        Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
                    }
                }

                if (call){
                    if (Platform.constants['Release'] <= 9){
                        const permission = await PermissionsAndroid.requestMultiple([
                            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG])
                            this.callDetector = new CallDetectorManager(async(event, phoneNumber)=> {
                                if (event === 'Incoming'){
                                    console.log(phoneNumber)
                                    await fetch(`https://www.junk-call.com/hk/${phoneNumber}`).then(
                                        data =>{
                                            return data.text()
                                        })
                                        .then(text =>{
                                            const root = parse(text)
                                            const node = root.querySelector('.junkcall')
                                            if (node.innerText.includes("詐騙")){
                                                console.log("scam call detected")
                                                issueWarning(1,phoneNumber)
                                            }
                                        })
                                }
                            },
                            true, 
                            ()=>{}, 
                            )
                    }
                }

                if(!call){
                    this.callDetector && this.callDetector.dispose();
                }

                if(fall){
                    await Accelerometer.getPermissionsAsync();
                    Accelerometer.setUpdateInterval(100);
                    Accelerometer.addListener(setAcc)
                }

                const l = (await getDoc(doc(db,'link',uid))).data();
                if (l != undefined){
                    setLinkList(l.id)
                }
            }
            catch(err){
                console.log(err)
            }
    }
    getData()
    setTimeout(() =>{setUpdate(prev=>{return prev+1})},5000)
},[logout]);

const testFall = ()=>{
    test_cases_fail = [[2.99,0,0],[0,2.99,0],[0,0,2.99],[15.01,0,0][0,15.01,0],[0,0,15.01]]
    test_cases_pass = [[3,0,0],[0,3,0],[0,0,3],[15,0,0],[0,15,0][0,0,15]]
    for (let i = 0; i < test_cases_fail.length; i++){
        setAcc({x:test_cases_fail[i][0],y:test_cases_fail[i][1],z:test_cases_fail[i][2]})
    }
    for (let i = 0; i < test_cases_pass.length; i++){
        setAcc({x:test_cases_pass[i][0],y:test_cases_pass[i][1],z:test_cases_pass[i][2]})
    }
}

const testCall = async()=>{
    test_cases_scam = "38975266"
    test_cases_not_scam = "22698800"
    await fetch(`https://www.junk-call.com/hk/${test_cases_scam}`).then(
        data =>{
            return data.text()
        })
        .then(text =>{
            const root = parse(text)
            const node = root.querySelector('.junkcall')
            if (node.innerText.includes("詐騙")){
                console.log("--- call detection test 1 success ---")
            }
            else{console.log("--- call detection test 1 failed ---")}
        })
        await fetch(`https://www.junk-call.com/hk/${test_cases_not_scam}`).then(
            data =>{
                return data.text()
            })
            .then(text =>{
                const root = parse(text)
                const node = root.querySelector('.junkcall')
                if (node.innerText.includes("詐騙")){
                    console.log("--- call detection test 2 failed ---")
                }
                else{console.log("--- call detection test 2 success ---")}
            })
}

    const getWarning = async() =>{
            let warnings = []
            for (let i = 0; i < linkList.length; i++){
                const w = (await getDoc(doc(db,'new_warning',linkList[i]))).data();
                if (w != undefined){
                    if (w.warning === true){
                    Toast.show({
                        type: 'error',
                        text1: 'A new warning has been issued. Check Message!'
                      });
                    await setDoc(doc(db,'new_warning',linkList[i]),{warning:false})
                    }
                }
            }
}

getWarning()

if(body){
    fetch(url).then( 
        res =>  res.json()
    ).then(
        res =>{
        let data = res.bucket[res.bucket.length-1].dataset[0].point[0]
        if (data > upper || data < lower){
            issueWarning(2,data)
        }
        }
    ).catch( () => {

    }
    )
}

    return(
        <View>
            <Pressable onPress={() => navigation.navigate("Chatbot",{uid: uid})} style={styles.input}>
                <Text style={{fontSize:40, color:"white"}}>Chatbot</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Link",{uid: uid})} style={styles.input}>
                <Text style={{fontSize:40, color:"white"}}>Link</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Message",{uid: uid})} style={styles.input}>
                <Text style={{fontSize:40, color:"white"}}>Message</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Settings",{uid: uid})} style={styles.input}>
                <Text style={{fontSize:40, color:"white"}}>Settings</Text>
            </Pressable>
            <Pressable onPress={() => {setLogout(true);navigation.navigate("LoginScreen",{registerSuccess: false})}} style={styles.button}>
                <Text style={{fontSize:20, color:"white", fontWeight:'bold'}}>Log out</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        width: "80%",
        height: "16%",
        borderRadius: 50,
        alignSelf:'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5db075',
        marginVertical: 15,
    },

    button:{
        width: "40%",
        height: '10%',
        borderRadius: 50,
        marginVertical: 20,
        backgroundColor:"red",
        marginRight: 20,
        alignSelf:'flex-end',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    }
})