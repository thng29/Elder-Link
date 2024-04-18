import { StyleSheet, Text, View, Button, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc,collection} from "firebase/firestore"
import Toast from 'react-native-toast-message';

export default function LoginScreen({route,navigation}){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const {registerSuccess} = route.params;
    let user_id;

    useEffect(()=>{
        if (registerSuccess){
            Toast.show({type: 'success',text1: "Registration Successful !!",position:'bottom'})
        }
    },[])

    const handleLogin = async() => {
        try{
            const user = await signInWithEmailAndPassword(auth,email,password)
            user_id = user.user.uid
        }
        catch(error){
            console.log(error)
            Toast.show({type: 'error',text1: "Log in Failed! Please try again",position:'bottom'})
            return
        }
        setEmail("")
        setPassword("")
        navigation.navigate("MainScreen",{uid: user_id})
    }

    return(
        <View>
            <Text style={styles.title}>Login</Text>
            <TextInput style={styles.input} placeholder='Email' value={email} onChange={(event) =>{setEmail(event.nativeEvent.text)}}/>
            <TextInput style={styles.input} secureTextEntry={true} placeholder='Password' value={password} onChange={(event) =>{setPassword(event.nativeEvent.text)}}/>
            <Pressable onPress={handleLogin} style={styles.button}>
                <Text style={{fontSize:25, color:"white"}}>Login</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("RegisterScreen")} style={styles.nav}>
                <Text style={{fontSize:25, color:"#5db075",paddingRight:"5%", fontWeight:"bold"}}>Register</Text>
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
        fontSize: 25,
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