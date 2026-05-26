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
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#1C1C1C",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#5012FF",
        tabBarInactiveTintColor: "#6F6F6F",
        tabBarIcon: ({ focused, color, size }) => {
          
          // O botão especial da Atividade fica no meio
          if (route.name === "Atividade") {
            return (
              <View style={[styles.botaoFlutuante, focused && styles.botaoFlutuanteAtivo]}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </View>
            );
          }

          // Ícones normais para Home e Perfil
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Atividade" component={Atividade} /> 
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome" // <-- Voltei para o Welcome!
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        
        {/* Atividade foi removida daqui, pois agora mora dentro do MainTabs! */}
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