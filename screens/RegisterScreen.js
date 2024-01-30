import { StyleSheet, Text, View, Button, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {createUserWithEmailAndPassword} from "firebase/auth"
import {addDoc,collection} from "firebase/firestore"

export default function RegisterScreen({navigation}){
    const [displayName,setDisplayName] = useState("");
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");

    const handleRegister = async() =>{
        setDisplayName("");
        setUsername("");
        setPassword("");
        try{
            const user = await createUserWithEmailAndPassword(auth,username,password)
            const docRef = await addDoc(collection(db,"user"),{
                uid: user.user.uid,
                displayName: displayName,
                email: user.user.email,
                trackingEnabled: false,
                statusEnabled: false,
                fallEnabled: false,
                lowerRange: 0,
                upperRange: 0,
            });
        }
        catch(error){
            console.log(error)
        }
    }

    return(
        <View>
            <Text>Register</Text>
            <TextInput placeholder='Display Name' value={displayName} onChange={(event) =>{setDisplayName(event.nativeEvent.text)}}/>
            <TextInput placeholder='Email' value={username} onChange={(event) =>{setUsername(event.nativeEvent.text)}}/>
            <TextInput placeholder='Password' value={password} onChange={(event) =>{setPassword(event.nativeEvent.text)}}/>
            <Button title='Sign Up' onPress={handleRegister}/>
            <Pressable onPress={() => navigation.navigate("LoginScreen")}>
                <Text>Log In</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({

})