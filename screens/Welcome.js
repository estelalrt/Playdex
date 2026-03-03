import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';



export default function Welcome() {
    const navigation = useNavigation();
  return (

    <View style={styles.container}>
      
        <Text style={styles.title}>Escolha como deseja continuar</Text>

        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Criar uma conta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
                Já possui uma conta? Faça login
            </Text>
        </TouchableOpacity>

        <Image
            source={require('../assets/logos/welcome.png')}
            style={styles.image}
        />
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
        fontSize: 28,
        marginBottom: 72,
        textAlign: 'center',
        fontWeight: '500',
        color: '#E2E2E2',
        marginLeft: 24,
        marginRight: 24,
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
        marginBottom: 12, 
    },

    loginText: {
        fontSize: 16,
        color: '#E2E2E2',
        fontWeight: '500',
        marginBottom: 40, 
    },


    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },

    image: {
        width: 159.75,
        height: 117.96,
        resizeMode: 'contain',
        marginTop: 54,
    },

});
