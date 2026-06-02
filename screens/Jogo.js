import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DetalhesJogo() {
  const [jogo, setJogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  const route = useRoute();
  const navigation = useNavigation();
  
  // Pega o ID que você enviou lá da Home!
  const { id } = route.params; 

  useEffect(() => {
    async function buscarDetalhes() {
      try {
        // Chama a rota que configuramos no backend
        const resposta = await fetch(`https://playdex-yh18.onrender.com/jogo/${id}`);
        const dados = await resposta.json();
        setJogo(dados);
      } catch (erro) {
        console.error("Erro ao buscar detalhes do jogo:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarDetalhes();
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5012FF" />
      </View>
    );
  }

  if (!jogo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'white' }}>Jogo não encontrado :(</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Imagem de Fundo cobrindo metade da tela */}
      <ImageBackground 
        source={{ uri: jogo.foto_fundo || jogo.foto_capa }} 
        style={styles.imagemFundo}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
          style={styles.gradiente}
        >
          {/* Botão de Voltar */}
          <TouchableOpacity 
            style={styles.botaoVoltar} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Título do Jogo */}
          <View style={styles.conteudoInfos}>
            <Text style={styles.titulo}>{jogo.titulo}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      
      {/* Parte de baixo da tela (Sinopse, etc) */}
      <View style={styles.containerInferior}>
         <Text style={styles.sinopseTitulo}>Sinopse</Text>
         <Text style={styles.sinopseTexto}>{jogo.sinopse || "Sinopse não disponível."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagemFundo: {
    width: '100%',
    height: 450, // Ajuste conforme a altura que preferir
  },
  gradiente: {
    flex: 1,
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    marginTop: 50, // Ajuste para a Status Bar do celular
    marginLeft: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  conteudoInfos: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titulo: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  containerInferior: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  sinopseTitulo: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sinopseTexto: {
    color: '#B3B3B3',
    fontSize: 14,
    lineHeight: 22,
  },
});