import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigation = useNavigation();

  // --- A NOSSA BUZINA BLINDADA (Funciona 100% no Web e no Celular) ---
  const dispararAlerta = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      dispararAlerta("Erro", "Preencha todos os campos!");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("https://playdex-yh18.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      // Proteção: tenta ler o JSON, mas se o servidor não mandar nada, não quebra o app!
      let dados = {};
      try {
        dados = await resposta.json();
      } catch (e) {
        console.log("Servidor não devolveu JSON.");
      }

      if (resposta.ok) {
        // Salva o username no aparelho para o app saber quem está logado
        await AsyncStorage.setItem("usuarioLogado", dados.usuario?.username || email);
        navigation.navigate("MainTabs");
      } else {
        // Mostra o erro exato que o servidor mandou (ou um genérico)
        dispararAlerta("Ops!", dados.erro || "E-mail ou senha incorretos.");
      }
    } catch (erro) {
      dispararAlerta("Erro de Conexão", "Não foi possível conectar ao servidor. Verifique sua internet.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acesse sua conta</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail ou Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#6F6F6F"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none" // Evita que a primeira letra fique maiúscula sozinha
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#6F6F6F"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Image
              source={
                showPassword
                  ? require("../assets/icons/StateEyeoff.png")
                  : require("../assets/icons/StateEye.png")
              }
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, carregando && { opacity: 0.7 }]} 
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
        <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkTextBold}>Cadastre-se</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1C1C1C",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontSize: 16,
    outlineStyle: 'none', // <--- ADEUS BORDA LARANJA!
  },
  passwordWrapper: {
    width: "100%",
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 15,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#5012FF",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#B3B3B3",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  linkTextBold: {
    color: "#5012FF",
    fontWeight: "bold",
  },
});