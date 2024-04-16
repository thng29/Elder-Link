import { StyleSheet, Text, View, Button, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {createUserWithEmailAndPassword,signInWithEmailAndPassword} from "firebase/auth"
import {addDoc, setDoc, doc,collection} from "firebase/firestore"
import Toast from 'react-native-toast-message';

export default function RegisterScreen({navigation}){
    const [displayName,setDisplayName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleRegister = async() =>{
        try{
            if (password.length < 6){
                Toast.show({type: 'error',text1: "Password must be longer than 6 characters",position:'bottom'})
                return
            }
            const user = await createUserWithEmailAndPassword(auth,email,password)
            const data = {
                displayName: displayName,
                trackingEnabled: false,
                statusEnabled: false,
                fallEnabled: false, 
                callEnabled: false,
                lowerRange: 0,
                upperRange: 0,
            }
            const res = setDoc(doc(db,'user',user.user.uid),data);
        }
        catch(error){
            console.log(error)
            Toast.show({type: 'error',text1: "Registration Failed! Please check if the email is valid and try again",position:'bottom'})
            return
        }
        setDisplayName("")
        setEmail("")
        setPassword("")
        navigation.navigate("LoginScreen",{registerSuccess: true})
    }

    const testRegister = async() =>{
        try{
            const user = await createUserWithEmailAndPassword(auth,'test@gmail.com','111111')
            const login = await signInWithEmailAndPassword(auth,'test@gmail.com','111111')
            console.log('--- Register Test success ---')
        }
        catch(err){
            console.log('--- Register Test failed ---')
        }
    }

    const testDuplicated = async() =>{
        try{
            const user = await createUserWithEmailAndPassword(auth,'test2@gmail.com','111111')
            const user2 = await createUserWithEmailAndPassword(auth,'test2@gmail.com','111111')
            console.log('--- Duplicate Test failed ---')
        }
        catch(err){
            console.log('--- Duplicate Test success ---')
        }
    }

    const testWrongAccount = async() =>{
        try{
            const login = await signInWithEmailAndPassword(auth,'random@gmail.com','111111')
            console.log('--- Wrong Account Test failed ---')
        }
        catch(err){
            console.log('--- Wrong Account Test success ---')
        }
    }

    const testWrongPassword = async() =>{
        try{
            const login = await signInWithEmailAndPassword(auth,'test@gmail.com','wrongpw')
            console.log('--- Wrong Password Test failed ---')
        }
        catch(err){
            console.log('--- Wrong Password Test success ---')
        }
    }

    return(
        <View>
            <Text style={styles.title}>Register</Text>
            <TextInput style={styles.input} placeholder='Display Name' value={displayName} onChange={(event) =>{setDisplayName(event.nativeEvent.text)}}/>
            <TextInput style={styles.input} placeholder='Email' value={email} onChange={(event) =>{setEmail(event.nativeEvent.text)}}/>
            <TextInput style={styles.input} secureTextEntry={true} placeholder='Password' value={password} onChange={(event) =>{setPassword(event.nativeEvent.text)}}/>
            <Pressable onPress={handleRegister} style={styles.button}>
                <Text style={{fontSize:25, color:"white"}}>Sign Up</Text>
            </Pressable>
            <Pressable onPress={() => {navigation.navigate("LoginScreen")}} style={styles.nav}>
                <Text style={{fontSize:25, color:"#5db075",paddingRight:"5%", fontWeight:"bold"}}>Log In</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        alignSelf:'center',
        fontSize: 30,
        marginVertical: 20,
        color: '#5db075',
        fontWeight: 'bold',
    },

    input: {
        width: "80%",
        fontSize: 20,
        paddingLeft:10,
        height: "12%",
        borderRadius: 10,
        alignSelf:'center',
        backgroundColor: '#DEDEDE',
        marginVertical: 10,
    },

    button:{
        width: "80%",
        height: '14%',
        borderRadius: 50,
        fontSize: 20,
        marginVertical: 20,
        backgroundColor:"#5db075",
        alignSelf:'center',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color:"#5db075",
    },

    nav:{
        alignContent: "flex-end",
        alignSelf: "flex-end",
        alignItems: 'flex-end',
        
    }
})