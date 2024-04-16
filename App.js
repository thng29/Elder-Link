import 'react-native-gesture-handler';
import * as React from 'react';
import { Button, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';
import Chatbot from './screens/Chatbot';
import Link from './screens/Link';
import Message from './screens/Message';
import Settings from './screens/Settings';
import Toast from 'react-native-toast-message';
import Location from './screens/Location';
import * as TaskManager from 'expo-task-manager';
import {addDoc, setDoc, doc,getDoc} from "firebase/firestore"
import {auth,db} from "./firebaseConfig.js"
import 'expo-dev-client';

const Stack = createNativeStackNavigator();

export default function App() {
  console.disableYellowBox = true;
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{title: "Elder Link", drawerActiveTintColor: "green", headerTintColor: "white", headerStyle: {backgroundColor:"green"}, headerTitleStyle: {fontWeight: "bold",fontSize:25}}}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} initialParams={{registerSuccess: false}}/>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="MainScreen" component={MainScreen} options={{headerLeft: ()=> <></>, gestureEnabled:false}}/>
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="Link" component={Link} />
        <Stack.Screen name="Message" component={Message} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Location" component={Location} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast></Toast>
    </>
  );
}