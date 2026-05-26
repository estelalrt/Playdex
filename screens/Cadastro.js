import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Cadastro() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !username || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const url =
        "https://sturdy-space-system-grqgvwrpqw7cjw6-3000.app.github.dev/cadastro";
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
        body: JSON.stringify({ nome, email, username, senha: password }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Conta criada com sucesso!");
        navigation.navigate("MainTabs");
      } else {
        Alert.alert("Erro", dados.erro || "Falha ao cadastrar");
      }
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../assets/icons/arrowleft.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <Text style={styles.title}>Crie sua conta</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Informe seu nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#6F6F6F"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Informe seu e-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#6F6F6F"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crie um nome de usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#6F6F6F"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Escolha uma senha</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#6F6F6F"
            value={password}
            onChangeText={setPassword}
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
        <Text style={styles.hint}>
          A senha deve conter 6 caracteres ou mais, com letras e números
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000000",
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
    width: "100%",
  },
  passwordWrapper: {
    width: "100%",
    position: "relative",
  },
  input: {
    backgroundColor: "#1C1C1C",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontSize: 16,
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
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  hint: {
    color: "#B3B3B3",
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 10,
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
});
