import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Perfil() {
  // Estados do Perfil
  const [meuUsername, setMeuUsername] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUri, setFotoUri] = useState("https://github.com/github.png");
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // Estados dos Favoritos (Prateleira)
  const [favoritos, setFavoritos] = useState([null, null, null, null]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [query, setQuery] = useState("");
  const [sugestoes, setSugestoes] = useState([]);

  // URL BASE DO BACKEND
  const URL_BASE =
    "https://playdex-yh18.onrender.com";

  // 1. CARREGAR TUDO AO ABRIR A TELA
  useEffect(() => {
    const carregarPerfilEFavoritos = async () => {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");
        if (!usuarioSalvo) return;
        setMeuUsername(usuarioSalvo);

        // Busca Bio e Foto
        const resPerfil = await fetch(`${URL_BASE}/perfil/${usuarioSalvo}`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "PostmanRuntime/7.32.3",
          },
        });
        const dadosPerfil = await resPerfil.json();
        if (resPerfil.ok) {
          if (dadosPerfil.bio) {
            setBio(dadosPerfil.bio);
            setTempBio(dadosPerfil.bio);
          }
          if (
            dadosPerfil.foto_perfil &&
            dadosPerfil.foto_perfil.startsWith("http")
          ) {
            setFotoUri(dadosPerfil.foto_perfil);
          }
        }

        // Busca Favoritos
        const resFav = await fetch(`${URL_BASE}/favoritos/${usuarioSalvo}`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "PostmanRuntime/7.32.3",
          },
        });
        const dadosFav = await resFav.json();
        if (resFav.ok) {
          const novosFavs = [null, null, null, null];
          dadosFav.forEach((f) => {
            novosFavs[f.posicao] = f;
          });
          setFavoritos(novosFavs);
        }
      } catch (erro) {
        console.log("Erro ao carregar dados:", erro);
      }
    };

    carregarPerfilEFavoritos();
  }, []);

  // 2. FUNÇÕES DE PESQUISA E SELEÇÃO DE JOGO
  const abrirPesquisa = (index) => {
    setSlotSelecionado(index);
    setModalVisivel(true);
  };

  const fecharPesquisa = () => {
    setModalVisivel(false);
    setQuery("");
    setSugestoes([]);
    setSlotSelecionado(null);
  };

  const buscarJogos = async (texto) => {
    setQuery(texto);
    if (texto.length < 2) {
      setSugestoes([]);
      return;
    }
    try {
      const resposta = await fetch(`${URL_BASE}/jogos/busca?q=${texto}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
      });
      const dados = await resposta.json();
      setSugestoes(dados);
    } catch (erro) {
      console.log("Erro na busca:", erro);
    }
  };

  const handleSelecionarJogo = async (jogo) => {
    try {
      const resposta = await fetch(`${URL_BASE}/favoritos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
        body: JSON.stringify({
          username: meuUsername,
          id_jogo: jogo.id,
          posicao: slotSelecionado,
        }),
      });

      if (resposta.ok) {
        const novosFavoritos = [...favoritos];
        novosFavoritos[slotSelecionado] = jogo;
        setFavoritos(novosFavoritos);
        fecharPesquisa();
      } else {
        Alert.alert("Erro", "Não foi possível salvar o favorito no banco.");
      }
    } catch (erro) {
      console.log("Erro ao salvar favorito:", erro);
    }
  };

  // 3. FUNÇÕES DE BIO E FOTO
  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Aviso", "Precisamos de permissão para acessar suas fotos!");
      return;
    }

    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!resultado.canceled) {
      const uriLocal = resultado.assets[0].uri;
      setFotoUri(uriLocal);
      try {
        const respostaDaImagem = await fetch(uriLocal);
        const arquivoBlob = await respostaDaImagem.blob();
        const data = new FormData();
        data.append("file", arquivoBlob, "perfil.jpg");
        data.append("upload_preset", "playdex_perfil");

        const respostaCloudinary = await fetch(
          "https://api.cloudinary.com/v1_1/dvtbgnv4v/image/upload",
          { method: "POST", body: data },
        );
        const dadosNuvem = await respostaCloudinary.json();

        if (dadosNuvem.secure_url) {
          const linkDaFoto = dadosNuvem.secure_url;
          setFotoUri(linkDaFoto);
          await fetch(`${URL_BASE}/atualizar-perfil`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "PostmanRuntime/7.32.3",
            },
            body: JSON.stringify({
              username: meuUsername,
              bio: bio,
              foto_perfil: linkDaFoto,
            }),
          });
          Alert.alert("Sucesso!", "Foto updated!");
        }
      } catch (erro) {
        Alert.alert("Erro", "Falha ao enviar foto para a nuvem.");
      }
    }
  };

  const handleEdit = () => {
    setTempBio(bio);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const resposta = await fetch(`${URL_BASE}/atualizar-perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
        body: JSON.stringify({
          username: meuUsername,
          bio: tempBio,
          foto_perfil: fotoUri,
        }),
      });

      if (resposta.ok) {
        setBio(tempBio);
        setIsEditing(false);
        Alert.alert("Sucesso", "Perfil salvo!");
      }
    } catch (erro) {
      Alert.alert("Erro", "Falha de conexão.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{meuUsername || "Visitante"}</Text>
            <TouchableOpacity onPress={escolherFoto}>
              <Image source={{ uri: fotoUri }} style={styles.profilepic} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bioContainer}>
          {isEditing ? (
            <TextInput
              style={styles.bioText}
              value={tempBio}
              onChangeText={setTempBio}
              multiline
              autoFocus
            />
          ) : (
            <Text style={styles.bioText}>{bio || "Nenhuma bio definida."}</Text>
          )}
        </View>

        <View style={styles.secaoFavoritos}>
          <Text style={styles.subtitulo}>Jogos Favoritos</Text>
          <View style={styles.linhaFavoritos}>
            {favoritos.map((jogo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.slotFavorito}
                onPress={() => abrirPesquisa(index)}
              >
                {jogo ? (
                  <Image
                    source={{ uri: jogo.foto_capa }}
                    style={styles.capapaFavorito}
                  />
                ) : (
                  <Ionicons name="add" size={24} color="#6F6F6F" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisivel} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Escolha um jogo</Text>
            <TouchableOpacity onPress={fecharPesquisa}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.inputPesquisa}
            placeholder="Pesquise um jogo..."
            placeholderTextColor="#6F6F6F"
            value={query}
            onChangeText={buscarJogos}
            autoFocus
          />
          <ScrollView keyboardShouldPersistTaps="handled">
            {sugestoes.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemSugestao}
                onPress={() => handleSelecionarJogo(item)}
              >
                <Image
                  source={{ uri: item.foto_capa }}
                  style={styles.capinhaSugestao}
                />
                <Text style={styles.textoSugestao}>{item.titulo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 60,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 12,
  },
  profilepic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  sectionTitle: {
    color: "#FFFFFF",
    marginTop: 32,
    fontSize: 18,
    fontWeight: "500",
  },
  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  bioContainer: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  bioText: {
    color: "#B3B3B3",
    fontSize: 14,
    lineHeight: 22,
  },
  editButtonText: {
    color: "#6F6F6F",
    fontSize: 14,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#5012FF",
    fontSize: 14,
    fontWeight: "bold",
  },
  secaoFavoritos: {
    marginTop: 40,
    marginBottom: 40,
  },
  subtitulo: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  linhaFavoritos: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  slotFavorito: {
    width: 75,
    height: 110,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  capapaFavorito: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  inputPesquisa: {
    backgroundColor: "#1C1C1C",
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 20,
    outlineStyle: "none",
    borderWidth: 0,
  },
  itemSugestao: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  capinhaSugestao: {
    width: 40,
    height: 55,
    borderRadius: 5,
    marginRight: 12,
  },
  textoSugestao: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
});
