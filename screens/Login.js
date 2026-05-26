import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Por favor, preencha seu e-mail e senha!");
      return;
    }
    try {
      const url =
        "https://playdex-yh18.onrender.com/login";
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
        body: JSON.stringify({ email, senha: password }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        await AsyncStorage.setItem("usuarioLogado", dados.usuario.username);
        Alert.alert("Sucesso!", dados.mensagem);
        navigation.navigate("MainTabs");
      } else {
        Alert.alert("Erro", dados.erro);
      }
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../assets/icons/arrowleft.png")}
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

      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          onChangeText={setPassword}
          value={password}
          placeholder="Senha"
          placeholderTextColor="#6F6F6F"
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

      <TouchableOpacity style={styles.forgotContainer} onPress={() => {}}>
        <Text style={styles.forgotText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    color: "#E2E2E2",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    color: "#BDBCBC",
    marginBottom: 60,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1C1C1C",
    width: 312,
    height: 50,
    borderRadius: 40,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  passwordWrapper: {
    width: 312,
    height: 50,
    justifyContent: "center",
    marginBottom: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 20,
    height: "100%",
    justifyContent: "center",
  },
  eyeIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  forgotContainer: {
    width: 312,
    alignItems: "flex-start",
    marginBottom: 24,
  },
  forgotText: {
    color: "#E2E2E2",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#5012FF",
    width: 312,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});
