import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';

export default function LoginScreen({navigation}){
    return(
        <View>
            <Text>Login Page</Text>
            <Button title='Log In' onPress={() => navigation.navigate("MainScreen")}/>
        </View>
    );
};