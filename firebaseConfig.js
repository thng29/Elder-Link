import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAMsK7mqOM39roENI3uK3Gn4_RLOCCkDCw",
  authDomain: "elder-link-15b40.firebaseapp.com",
  projectId: "elder-link-15b40",
  storageBucket: "elder-link-15b40.appspot.com",
  messagingSenderId: "216473175030",
  appId: "1:216473175030:web:0adaaef17d8594ca68bdd7",
  measurementId: "G-8RBKD7TXFR"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app,{persistence: getReactNativePersistence(ReactNativeAsyncStorage)});
const db = getFirestore(app);

export {auth,db};