import React, { useState, useCallback } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
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
  const route = useRoute(); 
  const navigation = useNavigation();

  const [meuUsername, setMeuUsername] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUri, setFotoUri] = useState("https://github.com/github.png");
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState("");

  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);
  const [estouSeguindo, setEstouSeguindo] = useState(false); 

  const perfilVisitado = route.params?.username || meuUsername;

  const [favoritos, setFavoritos] = useState([null, null, null, null]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [query, setQuery] = useState("");
  const [sugestoes, setSugestoes] = useState([]);

  const [diario, setDiario] = useState([]);
  const [modalBibliotecaVisivel, setModalBibliotecaVisivel] = useState(false);

  const URL_BASE = "https://playdex-yh18.onrender.com";

  const jogosFinalizados = diario.filter(
    (item) => item.status === "Finalizado" || item.status?.toLowerCase() === "finalizado"
  );

  useFocusEffect(
    useCallback(() => {
      const carregarTudo = async () => {
        try {
          const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");
          if (!usuarioSalvo) return;
          setMeuUsername(usuarioSalvo);

          const alvoBusca = route.params?.username || usuarioSalvo;

          const resPerfil = await fetch(`${URL_BASE}/perfil/${alvoBusca}`, {
            headers: { Accept: "application/json" },
          });
          const dadosPerfil = await resPerfil.json();
          if (resPerfil.ok) {
            setBio(dadosPerfil.bio || "");
            setTempBio(dadosPerfil.bio || "");
            if (dadosPerfil.foto_perfil && dadosPerfil.foto_perfil.startsWith("http")) {
              setFotoUri(dadosPerfil.foto_perfil);
            }
          }

          const resFav = await fetch(`${URL_BASE}/favoritos/${alvoBusca}`, {
            headers: { Accept: "application/json" },
          });
          if (resFav.ok) {
            const dadosFav = await resFav.json();
            const novosFavs = [null, null, null, null];
            dadosFav.forEach((f) => { novosFavs[f.posicao] = f; });
            setFavoritos(novosFavs);
          }

          const resDiario = await fetch(`${URL_BASE}/atividades/${alvoBusca}`, {
            headers: { Accept: "application/json" },
          });
          if (resDiario.ok) {
            setDiario(await resDiario.json());
          }

          const resRede = await fetch(`${URL_BASE}/usuario/${alvoBusca}/rede`);
          if (resRede.ok) {
            const dadosRede = await resRede.json();
            setSeguidores(dadosRede.followers || 0); 
            setSeguindo(dadosRede.following || 0);   
          }

          if (alvoBusca !== usuarioSalvo) {
            const resSegue = await fetch(`${URL_BASE}/verificar-seguir/${usuarioSalvo}/${alvoBusca}`);
            if (resSegue.ok) {
              const dadosSegue = await resSegue.json();
              setEstouSeguindo(dadosSegue.segue); 
            }
          }

        } catch (erro) {
          console.log("Erro ao carregar dados:", erro);
        }
      };

      carregarTudo();
    }, [route.params?.username]) 
  );

  const handleSeguir = async () => {
    try {
      const endpoint = estouSeguindo ? "/unfollow" : "/seguir";
      
      const resposta = await fetch(`${URL_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor: meuUsername,
          seguido: perfilVisitado
        })
      });

      if (resposta.ok) {
        setEstouSeguindo(!estouSeguindo);
        setSeguidores(prev => Math.max(0, estouSeguindo ? prev - 1 : prev + 1));
      }
    } catch (erro) {
      console.log("Erro ao seguir:", erro);
    }
  };

  const abrirPesquisa = (index) => {
    if (perfilVisitado === meuUsername) {
        setSlotSelecionado(index);
        setModalVisivel(true);
    }
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
        headers: { Accept: "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: meuUsername,
          id_jogo: juego.id,
          posicao: slotSelecionado,
        }),
      });

      if (resposta.ok) {
        const novosFavoritos = [...favoritos];
        novosFavoritos[slotSelecionado] = jogo;
        setFavoritos(novosFavoritos);
        fecharPesquisa();
      } else {
        Alert.alert("Erro", "Não foi possível salvar o favorito.");
      }
    } catch (erro) {
      console.log("Erro ao salvar favorito:", erro);
    }
  };

  const escolherFoto = async () => {
    if (perfilVisitado !== meuUsername) return;

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
          { method: "POST", body: data }
        );
        const dadosNuvem = await respostaCloudinary.json();

        if (dadosNuvem.secure_url) {
          const linkDaFoto = dadosNuvem.secure_url;
          setFotoUri(linkDaFoto);
          await fetch(`${URL_BASE}/atualizar-perfil`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: meuUsername,
              bio: bio,
              foto_perfil: linkDaFoto,
            }),
          });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: meuUsername,
          bio: tempBio,
          foto_perfil: fotoUri,
        }),
      });

      if (resposta.ok) {
        setBio(tempBio);
        setIsEditing(false);
      }
    } catch (erro) {
      Alert.alert("Erro", "Falha de conexão.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerEsquerda}>
            {perfilVisitado !== meuUsername && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={escolherFoto}>
              <Image source={{ uri: fotoUri }} style={styles.profilepic} />
            </TouchableOpacity>
            
            <View style={styles.headerTextos}>
              <Text style={styles.userName}>{perfilVisitado || "Visitante"}</Text>
              <View style={styles.redeContainer}>
                <Text style={styles.redeTexto}><Text style={styles.redeNumero}>{seguidores}</Text> Seguidores</Text>
                <Text style={styles.redeTexto}><Text style={styles.redeNumero}>{seguindo}</Text> Seguindo</Text>
              </View>
            </View>
          </View>

          {perfilVisitado !== meuUsername ? (
            <TouchableOpacity 
              style={[styles.botaoSeguir, estouSeguindo && styles.botaoSeguindo]} 
              onPress={handleSeguir}
            >
              <Text style={[styles.textoBotaoSeguir, estouSeguindo && styles.textoBotaoSeguindo]}>
                {estouSeguindo ? "Seguindo" : "Seguir"}
              </Text>
            </TouchableOpacity>
          ) : (
             <Ionicons name="settings-outline" size={24} color="#6F6F6F" />
          )}
        </View>

        <View style={styles.bioHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {perfilVisitado === meuUsername && (
            !isEditing ? (
              <TouchableOpacity onPress={handleEdit}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            )
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
              outlineStyle="none"
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

        <View style={styles.secaoDiario}>
          <Text style={styles.subtitulo}>Diário Recente</Text>
          {diario.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhuma atividade registrada.</Text>
          ) : (
            diario.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.cardAtividade}>
                <Image source={{ uri: item.jogo_capa }} style={styles.capaDiario} />
                <View style={styles.infoDiario}>
                  <Text style={styles.tituloJogoDiario}>{item.jogo_titulo}</Text>
                  <View style={styles.linhaStatusData}>
                    <Text style={styles.textoStatus}>{item.status}</Text>
                    {item.data && (
                      <Text style={styles.textoData}>
                        • {new Date(item.data).toLocaleDateString('pt-BR')}
                      </Text>
                    )}
                  </View>
                  {item.nota > 0 && (
                    <Text style={{color: '#FFFFFF'}}>Avaliação: {Number(item.nota).toString().replace('.', ',')} / 5</Text>
                  )}
                  {item.review && (
                    <Text style={styles.textoReview} numberOfLines={3}>
                      "{item.review}"
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.secaoLinks}>
          <TouchableOpacity style={styles.linkRow} onPress={() => setModalBibliotecaVisivel(true)}>
            <Text style={styles.linkText}>Sua biblioteca</Text>
            <Ionicons name="chevron-forward" size={20} color="#6F6F6F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Quero Jogar</Text>
            <Ionicons name="chevron-forward" size={20} color="#6F6F6F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Listas</Text>
            <Ionicons name="chevron-forward" size={20} color="#6F6F6F" />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} /> 
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

      <Modal visible={modalBibliotecaVisivel} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Sua Biblioteca ({jogosFinalizados.length})</Text>
            <TouchableOpacity onPress={() => setModalBibliotecaVisivel(false)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.gridBiblioteca}>
            {jogosFinalizados.length === 0 ? (
              <Text style={styles.textoVazio}>Você ainda não marcou nenhum jogo como finalizado.</Text>
            ) : (
              jogosFinalizados.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.itemBiblioteca}
                  onPress={() => setModalBibliotecaVisivel(false)}
                >
                  <Image source={{ uri: item.jogo_capa }} style={styles.capaBiblioteca} />
                  <Text style={styles.tituloJogoBiblioteca} numberOfLines={2}>
                    {item.jogo_titulo}
                  </Text>
                </TouchableOpacity>
              ))
            )}
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
    justifyContent: "space-between", 
    marginTop: 20,
  },
  headerEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextos: {
    marginLeft: 15,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  profilepic: {
    width: 60, 
    height: 60,
    borderRadius: 30,
    resizeMode: "cover",
  },
  redeContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  redeTexto: {
    color: '#6F6F6F',
    fontSize: 12,
    marginRight: 12,
  },
  redeNumero: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  botaoSeguir: {
    backgroundColor: '#5012FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  botaoSeguindo: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#5012FF',
  },
  textoBotaoSeguir: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textoBotaoSeguindo: {
    color: '#5012FF',
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
  secaoDiario: {
    marginTop: 40,
  },
  textoVazio: {
    color: "#6F6F6F",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  cardAtividade: {
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  capaDiario: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 16,
  },
  infoDiario: {
    flex: 1,
    justifyContent: "center",
  },
  tituloJogoDiario: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  linhaStatusData: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  textoStatus: {
    color: "#00BEBE", 
    fontSize: 12,
    fontWeight: "bold",
  },
  textoData: {
    color: "#6F6F6F",
    fontSize: 12,
    marginLeft: 4,
  },
  textoNota: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 4,
  },
  textoReview: {
    color: "#B3B3B3",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 4,
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
  secaoLinks: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1C",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  gridBiblioteca: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 40,
  },
  itemBiblioteca: {
    width: "30%",
    marginBottom: 20,
    marginHorizontal: "1.6%",
    alignItems: "center",
  },
  capaBiblioteca: {
    width: "100%",
    height: 130,
    borderRadius: 8,
    backgroundColor: "#1C1C1C",
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  tituloJogoBiblioteca: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
  },
});