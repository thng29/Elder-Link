import { StyleSheet, Text, View, Button, Pressable, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import {auth,db} from "../firebaseConfig.js"
import {signInWithEmailAndPassword} from "firebase/auth"
import {addDoc,collection} from "firebase/firestore"
import Toast from 'react-native-toast-message';
import {GoogleGenerativeAI} from "@google/generative-ai"

export default function Chatbot({navigation}){
    const [query,setQuery] = useState("");
    const [chatHist, setChatHist] = useState([["","Great to meet you. What would you like to know?"]]);
    const [hist,setHist] = useState([
      {
        role: "user",
        parts: [{ text: "" },],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" },]
      },
    ]);
    const genAI = new GoogleGenerativeAI("AIzaSyDBfgYUoKeQp2ODtXxyTBFMKuWgEZLeEK0");
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    async function handleSubmit() {
        const chat = model.startChat({
          history: hist,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });
        const msg = query;
        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();
        console.log(msg)
        setHist(hist =>{hist[0].parts.push({text:msg}); return hist});
        setHist(hist =>{hist[1].parts.push({text:text}); return hist});
        setChatHist(chatHist => {chatHist.push([hist[0].parts.slice(-1)[0].text,hist[1].parts.slice(-1)[0].text]); return chatHist})
        setQuery("")
      }

    return(
        <KeyboardAvoidingView behavior='padding'> 
          <View style={styles.chat}>
            <FlatList data={chatHist} renderItem={({item}) =>{
              return <View> 
              <Text style={item[0] != "" && styles.user}>{item[0] != "" && item[0]}</Text>
              <Text style={styles.bot}>{item[1] != "" && item[1]}</Text>
              </View>
            }}></FlatList>
          </View>
          <View style={styles.container}>
            <TextInput placeholder='Ask AI !' value={query} onChange={(event) =>{setQuery(event.nativeEvent.text)}} style={styles.prompt}/>
            <Pressable onPress={handleSubmit} style={styles.send}>
              <Text style={styles.text}>↑</Text>
              </Pressable>
              </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
  container:{
    flexDirection:'row',
    justifyContent:'space-between', 
    backgroundColor:'#DEDEDE',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 15,
  },
  text:{
    fontSize: 35,
    fontWeight:'bold',
    textAlign:'center',
    textAlignVertical:'center',
    color:'white'
  },
  bot: {
      marginLeft:5,
      padding: 15,
      maxWidth: "60%",
      width: 'auto',
      height: 'auto',
      fontSize: 20,
      marginVertical: 10,
      color: 'black',
      backgroundColor: "#DEDEDE",
      borderRadius: 20,
      textAlign:'left',
  },

  user: {
    marginRight:5,
    alignSelf: 'flex-end',
    padding: 15,
    maxWidth: "60%",
    width: 'auto',
    height: 'auto',
    fontSize: 20,
    marginVertical: 10,
    color: 'white',
    backgroundColor: "#5db075",
    borderRadius: 20,
  },

  chat: {
    height: "90%",
  },

  send:{
    height:40,
    width: 40,
    backgroundColor:"#5db075",
    borderRadius: 20,
  },

  prompt:{
    fontSize: 20,
    paddingLeft: 15,
  }
})