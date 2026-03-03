import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput} from 'react-native';
import { useNavigation } from '@react-navigation/native';



export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


  return (
    <View style={styles.container}>
      
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
        >
            <Image
                source={require('../assets/icons/arrowleft.png')}
                style={styles.backIcon}
            />
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Entre na sua conta Playdex</Text>

        <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="E-mail ou username"
            placeholderTextColor="#6F6F6F"
        />

        <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Senha"
            placeholderTextColor="#6F6F6F"
            secureTextEntry={true}
        />

        <Text style={styles.password}>Esqueci minha senha</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 32,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '500',
        color: '#E2E2E2',
        marginLeft: 24,
        marginRight: 24,
    },

    subtitle: {
        fontSize: 22,
        marginBottom: 72,
        textAlign: 'center',
        fontWeight: '500',
        color: '#BDBCBC',
        marginLeft: 24,
        marginRight: 24,
    },

   password: {
        fontSize: 16,
        marginBottom: 24,
        color: '#E2E2E2',
        width: 312,           
        textAlign: 'left',    
    },

    button: {
        backgroundColor: '#5012FF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 40,
        height: 49,
        width: 312,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,   // ← adiciona isso
    },

    buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center', // Garante centralização no Android
    includeFontPadding: false, // Remove um respiro extra que o Android coloca e causa corte
},

    input: {
        backgroundColor: '#1C1C1C',
        width: 312,
        height: 50,
        marginBottom: 12,
        paddingHorizontal: 20,
        color: '#FFFFFF',
        borderRadius: 40,
    },

    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
    },

    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },

});
