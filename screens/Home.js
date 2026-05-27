import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState([]);
  const [jogosPopulares, setJogosPopulares] = useState([]);
  const [carregandoJogos, setCarregandoJogos] = useState(true);

  useEffect(() => {
    const carregarFeed = async () => {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");
        if (!usuarioSalvo) return;

        const url = `https://playdex-yh18.onrender.com/feed/${usuarioSalvo}`;
        const resposta = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "PostmanRuntime/7.32.3",
          },
        });
        const dados = await resposta.json();

        if (resposta.ok) {
          setFeed(dados);
        }
      } catch (erro) {
        console.log("Erro de conexão no feed:", erro);
      }
    };
    carregarFeed();
  }, []);

  useEffect(() => {
    async function buscarJogosPopulares() {
        try {
            // Aqui estamos chamando a rota nova que você acabou de criar no Render!
            const resposta = await fetch('https://playdex-yh18.onrender.com/jogos/populares');
            const dados = await resposta.json();
            
            setJogosPopulares(dados);
        } catch (erro) {
            console.error("Erro ao carregar jogos populares:", erro);
        } finally {
            setCarregandoJogos(false);
        }
    }

    buscarJogosPopulares();
}, []);

  const renderIconeStatus = (status) => {
    if (status === 'Jogando') return <Ionicons name="game-controller" size={16} color="#FFFFFF" />;
    if (status === 'Quero Jogar') return <Ionicons name="bookmark" size={16} color="#5012FF" />;
   
    if (status === 'Concluído') return (
      <View style={{ 
        width: 16, 
        height: 16, 
        borderRadius: 8, 
        backgroundColor: '#00BEBE', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        
        <Ionicons name="checkmark" size={12} color="#000000" /> 
      </View>
    );

    return null;
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/logos/Logo.png")}
          style={styles.logo}
        />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#6F6F6F"
            value={search}
            onChangeText={setSearch}
          />
          <Image
            source={require("../assets/icons/search.png")}
            style={styles.searchIcon}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Atividade de amigos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContainer}
      >
        {feed.map((item, index) => (
          <View key={index} style={styles.cardItem}>
            <Image
              source={{
                uri:
                  item.foto_capa ||
                  "https://placehold.co/100x135/1C1C1C/FFFFFF/png?text=Sem+Capa",
              }}
              style={styles.game}
            />
            <View style={styles.activityInfo}>
              <Image
                source={{
                  uri:
                    item.foto_perfil ||
                    "https://ui-avatars.com/api/?name=Amigo&background=0D8ABC&color=fff",
                }}
                style={styles.player}
              />
              <View style={styles.nomeEIcone}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {item.username}
                </Text>
                {renderIconeStatus(item.status)}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Em Alta</Text>
    
      {carregandoJogos ? (
        <ActivityIndicator size="large" color="#5012FF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={jogosPopulares}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <Image source={{ uri: item.foto_capa }} style={styles.game} />
              {/* Usamos o playerName e limitamos a largura para o texto não vazar da capa */}
              <Text style={[styles.playerName, { marginTop: 8, width: 100 }]} numberOfLines={1}>
                {item.titulo}
              </Text>
            </View>
          )}
        />
      )}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  logo: {
    width: 53.86,
    height: 40,
    resizeMode: "contain",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 40,
    height: 50,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 15,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  searchIcon: {
    tintColor: "#6F6F6F",
    width: 20,
    height: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
  },
  sectionTitle: {
    color: "#FFFFFF",
    marginTop: 32,
    fontSize: 18,
    fontWeight: "500",
  },
  scrollWrapper: {
    marginRight: -24,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingRight: 24,
  },
  cardItem: {
    marginRight: 12,
  },
  game: {
    width: 100,
    height: 135,
    borderRadius: 10,
  },
  // home.js Styles Section (CORRIGIDA DE VERDADE)

  activityInfo: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    width: 100, // Força a largura máxima para alinhar com a capa
  },
  player: {
    width: 24, // Perfeito círculo
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    resizeMode: "cover",
  },
  // --- ESTE AGRUPAMENTO RESOLVE OS DOIS PROBLEMAS ---
  nomeEIcone: {
    flex: 1, // Vital para ocupar o espaço restante e o justify funcionar
    flexDirection: "row",
    alignItems: "center", // Alinha verticalmente nome e ícone (centralizados em 24px)
    // 1. Posição: Põe nome na esquerda e ícone na direita do card
    justifyContent: "space-between", 
    // 2. Fix Bug: Dá 2 pixels de respiro em cima e embaixo para o ícone não cortar!
    paddingVertical: 2, 
  },
  playerName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    flexShrink: 1, // Se o nome for muito grande, ele encolhe
    marginRight: 4, 
    includeFontPadding: false, 
  },
});
