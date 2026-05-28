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
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ 
          headerShown: true, // Liga a barra superior
          title: "Início", // Nome elegante
          headerStyle: { 
            backgroundColor: '#1C1C1C', 
            borderBottomWidth: 0 
          },
          headerTintColor: '#FFFFFF' 
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