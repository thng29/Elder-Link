import 'react-native-gesture-handler';
import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainScreen from './screens/MainScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="LoginScreen" screenOptions={{title: "Elder Link", drawerActiveTintColor: "green", headerTintColor: "white", headerStyle: {backgroundColor:"green"}, headerTitleStyle: {fontWeight: "bold", alignSelf: "center"}}}>
        <Drawer.Screen name="LoginScreen" component={LoginScreen}/>
        <Drawer.Screen name="RegisterScreen" component={RegisterScreen} />
        <Drawer.Screen name="MainScreen" component={MainScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}