import React from "react";
import { View, StyleSheet } from "react-native"; // <-- Adicionado View e StyleSheet
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Welcome from "./screens/Welcome";
import Login from "./screens/Login";
import Cadastro from "./screens/Cadastro";
import Home from "./screens/Home";
import Perfil from "./screens/Perfil";
import Atividade from "./screens/Atividade";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Mantém escondido por padrão
        tabBarShowLabel: false,
        // ... (resto do seu código do TabBar continua igualzinho)
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ 
          headerShown: true, // Liga a barra superior só para essa tela
          title: "Início", // O nome bonitinho que vai aparecer lá em cima
          headerStyle: { 
            backgroundColor: '#1C1C1C', // Fundo escuro combinando com o app
            borderBottomWidth: 0, // Tira a linha de divisão para ficar moderno
          },
          headerTintColor: '#FFFFFF' // Cor do texto
        }} 
      />
      <Tab.Screen 
        name="Atividade" 
        component={Atividade} 
        options={{ 
          headerShown: true,
          title: "Nova Atividade", 
          headerStyle: { backgroundColor: '#1C1C1C', borderBottomWidth: 0 },
          headerTintColor: '#FFFFFF'
        }}
      /> 
      <Tab.Screen 
        name="Perfil" 
        component={Perfil} 
        options={{ 
          headerShown: true,
          title: "Meu Perfil", 
          headerStyle: { backgroundColor: '#1C1C1C', borderBottomWidth: 0 },
          headerTintColor: '#FFFFFF'
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Estilos para o nosso botão flutuante
const styles = StyleSheet.create({
  botaoFlutuante: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5012FF", // Seu roxo oficial!
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30, // Isso empurra ele pra fora da barra
    shadowColor: "#5012FF",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5, // Sombra para Android
  },
  botaoFlutuanteAtivo: {
    backgroundColor: "#5619ff", // Um pouquinho mais claro se estiver clicado
  },
});