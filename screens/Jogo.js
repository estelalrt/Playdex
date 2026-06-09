import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Jogo() {
  const [jogo, setJogo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(false);
  
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params; 

  useEffect(() => {
    async function buscarDetalhes() {
      try {
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

  const renderEstrelas = (media) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Ionicons 
          key={i} 
          name={i <= Math.round(media) ? "star" : "star-outline"} 
          size={18} 
          color="#00BEBE" 
          style={{ marginRight: 4 }}
        />
      );
    }
    return estrelas;
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} style={{ flex: 1 }}>
        
        {}
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: jogo.foto_fundo || jogo.foto_capa }} 
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
            locations={[0, 0.5, 0.85]} 
            style={StyleSheet.absoluteFillObject}
          />
          
          <TouchableOpacity 
            style={styles.botaoVoltar} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.containerInferior}>
           <Text style={styles.titulo}>{jogo.titulo}</Text>
           
           <Text style={styles.metadados}>
             {jogo.ano_lancamento || '2025'} • {jogo.classificacao || '+18'} • {jogo.genero || 'Gênero não informado'}
           </Text>

           <View style={styles.containerAvaliacao}>
              <Text style={styles.notaTexto}>{jogo.media_nota ? jogo.media_nota.replace('.', ',') : '0,0'}</Text>
              <View style={styles.estrelas}>
                {renderEstrelas(jogo.media_nota || 0)}
              </View>
           </View>

           <View style={styles.botoesAcao}>
              <TouchableOpacity style={styles.botaoAvaliar}>
                <Text style={styles.textoBotaoAvaliar}>Avaliar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoIcone}>
                <Ionicons name="game-controller-outline" size={20} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoIcone}>
                <Ionicons name="bookmark-outline" size={20} color="#FFF" />
              </TouchableOpacity>
           </View>
           
           <Text style={styles.sinopseTitulo}>Sinopse</Text>
           <Text 
             style={styles.sinopseTexto}
             numberOfLines={expandido ? undefined : 3}
           >
             {jogo.sinopse || "Sinopse não disponível."}
           </Text>

           {jogo.sinopse && jogo.sinopse.length > 120 && (
             <TouchableOpacity onPress={() => setExpandido(!expandido)}>
               <Text style={styles.lerMais}>
                 {expandido ? "Ler menos" : "Ler mais"}
               </Text>
             </TouchableOpacity>
           )}

           <View style={{ height: 60 }} />
        </View>
        
      </ScrollView>
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
  headerImageContainer: {
    width: '100%',
    height: 520, // Altura total da área da foto
  },
  botaoVoltar: {
    marginTop: 50, 
    marginLeft: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 20,
    padding: 10,
    alignSelf: 'flex-start',
  },
  containerInferior: {
    flex: 1,
    paddingHorizontal: 24,
    // FUNDO PRETO SÓLIDO PARA O RESTO DA TELA!
    backgroundColor: '#000000', 
    // Sobe por cima da área preta do gradiente, fundindo os dois sem deixar borda
    marginTop: -80, 
  },
  titulo: {
    color: '#FFF',
    fontSize: 36, 
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 40,
  },
  metadados: {
    color: '#6F6F6F',
    fontSize: 14,
    marginBottom: 16,
  },
  containerAvaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  notaTexto: {
    color: '#00BEBE', 
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  estrelas: {
    flexDirection: 'row',
  },
  botoesAcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  botaoAvaliar: {
    flex: 1, 
    backgroundColor: '#5012FF',
    borderRadius: 30,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoBotaoAvaliar: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sinopseTitulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sinopseTexto: {
    color: '#B3B3B3',
    fontSize: 14,
    lineHeight: 22,
  },
  lerMais: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
});