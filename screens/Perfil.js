import React, { useState, useCallback } from "react";
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
import { useRoute } from "@react-navigation/native"; // <-- Importante para receber parâmetros

export default function Perfil() {
  const route = useRoute(); // <-- Pega parâmetros passados pela Home

  // Estados do Perfil
  const [meuUsername, setMeuUsername] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUri, setFotoUri] = useState("https://github.com/github.png");
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // NOVOS ESTADOS PARA REDE SOCIAL
  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);
  const [estouSeguindo, setEstouSeguindo] = useState(false); // Para o botão mudar de cor

  // O username de quem estamos vendo (pode ser você ou um amigo)
  // Se route.params.username existir, usamos ele, senão, usamos o vazio (que será preenchido com o seu)
  const perfilVisitado = route.params?.username || meuUsername;

  // Estados dos Favoritos (Prateleira)
  const [favoritos, setFavoritos] = useState([null, null, null, null]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [query, setQuery] = useState("");
  const [sugestoes, setSugestoes] = useState([]);

  // Estado do Diário de Atividades
  const [diario, setDiario] = useState([]);

  // URL BASE DO BACKEND
  const URL_BASE = "https://playdex-yh18.onrender.com";

  useFocusEffect(
    useCallback(() => {
      const carregarTudo = async () => {
        try {
          const usuarioSalvo = await AsyncStorage.getItem("usuarioLogado");
          if (!usuarioSalvo) return;
          setMeuUsername(usuarioSalvo);

          // Define quem é o alvo da busca (Você ou o Amigo)
          const alvoBusca = route.params?.username || usuarioSalvo;

          // 1. Busca Bio e Foto do ALVO
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

          // 2. Busca Favoritos do ALVO
          const resFav = await fetch(`${URL_BASE}/favoritos/${alvoBusca}`, {
            headers: { Accept: "application/json" },
          });
          if (resFav.ok) {
            const dadosFav = await resFav.json();
            const novosFavs = [null, null, null, null];
            dadosFav.forEach((f) => { novosFavs[f.posicao] = f; });
            setFavoritos(novosFavs);
          }

          // 3. Busca o Diário do ALVO
          const resDiario = await fetch(`${URL_BASE}/atividades/${alvoBusca}`, {
            headers: { Accept: "application/json" },
          });
          if (resDiario.ok) {
            setDiario(await resDiario.json());
          }

          // 4. Busca a contagem de Seguidores do ALVO
          const resRede = await fetch(`${URL_BASE}/usuario/${alvoBusca}/rede`);
          if (resRede.ok) {
            const dadosRede = await resRede.json();
            setSeguidores(dadosRede.seguidores);
            setSeguindo(dadosRede.seguindo);
          }

        } catch (erro) {
          console.log("Erro ao carregar dados:", erro);
        }
      };

      carregarTudo();
    }, [route.params?.username]) // Recarrega se o username mudar
  );

  // NOVA FUNÇÃO: SEGUIR USUÁRIO
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
        setSeguidores(prev => estouSeguindo ? prev - 1 : prev + 1);
      }
    } catch (erro) {
      console.log("Erro ao seguir:", erro);
    }
  };

  // ... (O resto das suas funções de pesquisa e edição de bio continuam iguais) ...
  const abrirPesquisa = (index) => {
    // Só deixa pesquisar se for o seu próprio perfil
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
        Alert.alert("Erro", "Não foi possível salvar o favorito.");
      }
    } catch (erro) {
      console.log("Erro ao salvar favorito:", erro);
    }
  };

  const escolherFoto = async () => {
    // Só deixa trocar foto se for o seu próprio perfil
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
            <TouchableOpacity onPress={escolherFoto}>
              <Image source={{ uri: fotoUri }} style={styles.profilepic} />
            </TouchableOpacity>
            
            <View style={styles.headerTextos}>
              <Text style={styles.userName}>{perfilVisitado || "Visitante"}</Text>
              
              {/* NOVA ÁREA: NÚMEROS DE SEGUIDORES */}
              <View style={styles.redeContainer}>
                <Text style={styles.redeTexto}><Text style={styles.redeNumero}>{seguidores}</Text> Seguidores</Text>
                <Text style={styles.redeTexto}><Text style={styles.redeNumero}>{seguindo}</Text> Seguindo</Text>
              </View>
            </View>
          </View>

          {/* BOTÃO DINÂMICO: Se for meu perfil, mostra engrenagem (configurações). 
              Se for de amigo, mostra botão SEGUIR */}
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
             // Ícone placeholder para futuras configurações (Editar senha, etc)
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

        {/* ... (Todo o resto da UI dos favoritos, diário e links continua exatamente igual!) ... */}
        
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
          <TouchableOpacity style={styles.linkRow}>
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

      {/* Modal de pesquisa ... (continua igual) */}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Cole aqui os seus estilos antigos do Perfil.js)
  // Adicionei esses novos para a Rede Social:
  headerEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextos: {
    marginLeft: 15,
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
  botaoSegu