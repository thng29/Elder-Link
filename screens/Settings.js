import { StyleSheet, Text, View, Button, Pressable, TextInput, Switch } from 'react-native';
import { useState, useEffect, useLayoutEffect} from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc,getDoc,setDoc,doc,collection} from "firebase/firestore"
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Accelerometer } from 'expo-sensors';

export default function Settings({route,navigation}){

    const {uid} = route.params
    const [trackingEnabled,setTrackingEnabled] = useState(false)
    const [callsFilteringEnabled,setcallsFilteringEnabled] = useState(false)
    const [bodyStatusEnabled,setBodyStatusEnabled] = useState(false)
    const [fallEnabled,setFallEnabled] = useState(false)
    const [lower, setLower] = useState('')
    const [upper, setUpper] = useState('')
    const [displayName,setDisplayName] = useState("")
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
          const res3 = await setDoc(doc(db,'location',uid),{locationData: {location}})
        } catch (err) {
          console.error(err);
        }
      });

    useLayoutEffect(()=>{
        async function getData(){
            try{
                const res = await getDoc(doc(db,'user',uid));
                const data = res.data();
                setDisplayName(data.displayName);
                setFallEnabled(data.fallEnabled);
                setLower(data.lowerRange.toString());
                setUpper(data.upperRange.toString());
                setTrackingEnabled(data.trackingEnabled);
                setBodyStatusEnabled(data.statusEnabled);
                setcallsFilteringEnabled(data.callEnabled);
            }
            catch(err){
                console.log(err)
            }
    }
    getData()
},[]);

    const issueWarning = async(msg,t) =>{
        try{
            let arr = []
            const prev = await getDoc(doc(db,'warning',uid));
            if (prev._document != null){
                arr = prev.data().data
            }
            arr.push({text:msg,time:t})
            await setDoc(doc(db,'warning',uid),{data: arr});
        }
        catch(err){
            console.log(err)
        }
    } 

    useEffect(()=>{
    const a = 9.81 * Math.sqrt(x*x+y*y+z*z);
    if (a > 24.25){
        const timestamp = Date.now()
        const time = new Date(timestamp)
        var year = time.getFullYear();
        var month = (time.getMonth()+1).toString().padStart(2,'0');
        var day = time.getDate().toString().padStart(2,'0');
        var hour = time.getHours().toString().padStart(2,'0');
        var minute = time.getMinutes().toString().padStart(2,'0');
        var second = time.getSeconds().toString().padStart(2,'0');
        var timeStr = [year,month,day].join('.')+' '+[hour,minute,second].join(':');
        const warningMsg = `[${timeStr}]\n${displayName} is detected to have a suspicious fall`;
        issueWarning(warningMsg,timestamp)
    }},[x,y,z])

    const handleSubmit = async() => {
        if(isNaN(Number(lower)) || isNaN(Number(upper))){
            Toast.show({type: 'error',text1: "Lower and Upper bound must be a number",position:'bottom'})
            return false
        }
        else if (Number(lower) < 0 || Number(upper) < 0){
            Toast.show({type: 'error',text1: "Blood Pressure must be positive",position:'bottom'})
            return false
        }
        else if(Number(lower) > Number(upper)){
            Toast.show({type: 'error',text1: "Lower range must be smaller than upper range",position:'bottom'})
            return false
        }
        const data = {
            displayName: displayName,
            trackingEnabled: trackingEnabled,
            statusEnabled: bodyStatusEnabled,
            fallEnabled: fallEnabled, 
            callEnabled: callsFilteringEnabled,
            lowerRange: lower,
            upperRange: upper,
        }
        try{
            res = await setDoc(doc(db,'user',uid),data);
            Toast.show({type: 'success',text1: "Update successful !",position:'bottom'})
            const trackingStarted = await Location.hasStartedLocationUpdatesAsync(TASK_FETCH_LOCATION)
            if (trackingEnabled && !trackingStarted){
                await Location.requestBackgroundPermissionsAsync()
                await Location.requestForegroundPermissionsAsync()
                Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
                    accuracy: Location.Accuracy.Highest,
                    distanceInterval: 1, 
                    deferredUpdatesInterval: 100, 
                    foregroundService: {
                      notificationTitle: 'Using your location',
                      notificationBody: 'To turn off, disable location tracking in settings',
                    },
                    uid: uid
                  });
            }
            if (!trackingEnabled){
                if (trackingStarted){
                    Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION);
                }
            }

            if(fallEnabled){
                await Accelerometer.getPermissionsAsync();
                Accelerometer.setUpdateInterval(100);
                Accelerometer.addListener(setAcc)
            }
            return true
        }
        catch(err){
            console.log(err)
            Toast.show({type: 'error',text1: "Update failed ! Please Try again",position:'bottom'})
        }
    }

    return(
        <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.text}>Location Tracking</Text>
            <Switch value={trackingEnabled} onValueChange={() => setTrackingEnabled(prev => {return !prev})} style={styles.button}></Switch>
            <Text style={styles.text}>Calls Filtering</Text>
            <Switch value={callsFilteringEnabled} onValueChange={() => setcallsFilteringEnabled(prev => {return !prev}) } style={styles.button}></Switch>
            <Text style={styles.text}>Body Status Monitoring</Text>
            <Switch value={bodyStatusEnabled} onValueChange={() => setBodyStatusEnabled(prev => {return !prev}) } style={styles.button}></Switch>
            <Text style={styles.text}>Fall Detection</Text>
            <Switch value={fallEnabled} onValueChange={() => setFallEnabled(prev => {return !prev}) } style={styles.button}></Switch>
            <Text style={styles.text}>Blood Pressure Limit</Text>
            <Text style={styles.text}>Lower</Text>
            <TextInput value={lower} onChange={(event) =>{setLower(event.nativeEvent.text)}} style={styles.text}></TextInput>
            <Text style={styles.text}>Upper</Text>
            <TextInput value={upper} onChange={(event) =>{setUpper(event.nativeEvent.text)}} style={styles.text}></TextInput>
            <Pressable onPress={handleSubmit} style={styles.nav}>
                <Text style={{fontSize:25, color:"white", fontWeight:'bold'}}>Submit Changes</Text>
            </Pressable>
            <Toast></Toast>
        </View>
    );
};

const testSetting = ()=>{
    const test_cases_fail = [["not number",0],[0,'not number'],[-1,0],[0,-1],[101,100]]
    for (let i = 0; i < test_cases_fail.length; i++){
        setLow(test_cases_fail[i][0])
        setUpper(test_cases_fail[i][1])
        if (handleSubmit){
            console.log("--- setting test failed ---")
            return
        }
    }
    const test_cases_pass = [[0,0],[50,50],[50,100]]
    for (let i = 0; i < test_cases_pass.length; i++){
        setLow(test_cases_pass[i][0])
        setUpper(test_cases_pass[i][1])
        if (!handleSubmit){
            console.log("--- setting test failed ---")
            return
        }
    }
    console.log("--- setting test success ---")
}

const styles = StyleSheet.create({
    title: {
        alignSelf:'center',
        fontSize: 30,
        marginVertical: 10,
        color: '#5db075',
        fontWeight: 'bold',
    },

    text: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 15,
        marginVertical: 2,
    },

    button:{
        marginRight: 125,
        transform:[{scaleX:2},{scaleY:2}]
    },

    nav:{
        width: "80%",
        height: '10%',
        borderRadius: 50,
        fontSize: 20,
        marginVertical: 20,
        backgroundColor:"#5db075",
        alignSelf:'center',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color:"#5db075",
    }
})