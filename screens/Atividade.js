import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Keyboard,
  Alert,
} from "react-native";
// Adicionamos o FontAwesome aqui nos imports!
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Atividade() {
  const [query, setQuery] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const [status, setStatus] = useState("");
  const [duracao, setDuracao] = useState("");
  const [data, setData] = useState("");
  const [nota, setNota] = useState(0);
  const [review, setReview] = useState("");

  const buscarJogos = async (texto) => {
    setQuery(texto);
    if (texto.length < 2) {
      setSugestoes([]);
      return;
    }
    try {
      const url = `https://sturdy-space-system-grqgvwrpqw7cjw6-3000.app.github.dev/jogos/busca?q=${texto}`;
      const resposta = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
      });
      const dados = await resposta.json();
      setSugestoes(dados);
    } catch (erro) {
      console.log("Erro ao buscar sugestões:", erro);
    }
  };

  const handleSelecionarJogo = (jogo) => {
    setJogoSelecionado(jogo);
    setSugestoes([]);
    setQuery("");
    Keyboard.dismiss();
  };

  const handleDataFormatada = (texto) => {
    let formatado = texto.replace(/\D/g, "");
    if (formatado.length > 2) formatado = formatado.replace(/^(\d{2})(\d)/, "$1/$2");
    if (formatado.length > 5) formatado = formatado.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    setData(formatado.substring(0, 10));
  };

  const handlePostar = async () => {
    if (!jogoSelecionado) {
      Alert.alert("Erro", "Pesquise e selecione um jogo primeiro!");
      return;
    }
    if (!status) {
      Alert.alert("Erro", "Selecione um status para o jogo!");
      return;
    }
    if (!data) {
      Alert.alert("Erro", "Por favor, introduza a data da atividade!");
      return;
    }

    try {
      const usuarioLogado = await AsyncStorage.getItem("usuarioLogado");

      let dataBanco = data;
      if (data.includes('/')) {
        const partes = data.split('/');
        if (partes.length === 3) {
          dataBanco = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
      }

      const novaAtividade = {
        username: usuarioLogado,
        id_jogo: jogoSelecionado.id,
        status: status,
        duracao: duracao ? parseFloat(duracao.replace(',', '.')) : 0,
        nota: status === "Jogando" ? null : nota,
        data: dataBanco,
        review: review.trim() !== "" ? review : null,
      };

      const url = `https://sturdy-space-system-grqgvwrpqw7cjw6-3000.app.github.dev/atividade`;

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PostmanRuntime/7.32.3",
        },
        body: JSON.stringify(novaAtividade),
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Atividade registrada.");
        setJogoSelecionado(null);
        setStatus("");
        setDuracao("");
        setData("");
        setNota(0);
        setReview("");
        setQuery("");
      } else {
        const erro = await resposta.json();
        Alert.alert("Ops!", erro.mensagem || "Deu algum erro no servidor.");
      }
    } catch (erro) {
      console.log("Erro de conexão:", erro);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const renderBotaoStatus = (nome, icone) => {
    const isAtivo = status === nome;
    return (
      <TouchableOpacity
        style={[styles.botaoStatus, isAtivo && styles.botaoStatusAtivo]}
        onPress={() => {
          setStatus(nome);
          if (nome === "Jogando") setNota(0);
          if (nome === "Quero Jogar") setReview(""); 
        }}
      >
        <Ionicons
          name={icone}
          size={24}
          color={isAtivo ? "#FFFFFF" : "#6F6F6F"}
        />
        <Text style={[styles.textoStatus, isAtivo && styles.textoStatusAtivo]}>
          {nome}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEstrelas = () => {
    return (
      <View style={styles.estrelasContainer}>
        {[1, 2, 3, 4, 5].map((posicao) => {
          // Nomes dos ícones do FontAwesome
          let iconName = "star-o"; 
          if (nota >= posicao) iconName = "star";
          else if (nota >= posicao - 0.5) iconName = "star-half-o";

          return (
            <View key={posicao} style={styles.estrelaWrapper}>
              <TouchableOpacity
                style={styles.metadeEsquerda}
                onPress={() => setNota(posicao - 0.5)}
              />
              <TouchableOpacity
                style={styles.metadeDireita}
                onPress={() => setNota(posicao)}
              />
              {/* Trocado para FontAwesome com um tamanho um pouco ajustado */}
              <FontAwesome name={iconName} size={38} color="#00BEBE" />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nova Atividade</Text>
        <Text style={styles.subtitle}>O que você está jogando hoje?</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Jogo</Text>
          {jogoSelecionado ? (
            <View style={styles.cardSelecionado}>
              <Image
                source={{ uri: jogoSelecionado.foto_capa }}
                style={styles.capinhaSelecionada}
              />
              <Text style={styles.tituloSelecionado}>
                {jogoSelecionado.titulo}
              </Text>
              <TouchableOpacity
                onPress={() => setJogoSelecionado(null)}
                style={styles.botaoRemover}
              >
                <Text style={styles.textoRemover}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Pesquise um jogo..."
                placeholderTextColor="#6F6F6F"
                value={query}
                onChangeText={buscarJogos}
              />
              {sugestoes.length > 0 && (
                <View style={styles.dropdown}>
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
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data da Atividade</Text>
          <View style={styles.inputComIcone}>
            <TextInput
              style={styles.inputTransparente}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#6F6F6F"
              value={data}
              onChangeText={handleDataFormatada}
              keyboardType="numeric"
              maxLength={10}
            />
            <Ionicons name="calendar" size={24} color="#6F6F6F" />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.linhaStatus}>
            {renderBotaoStatus("Jogando", "game-controller")}
            {renderBotaoStatus("Concluído", "checkmark-circle")}
            {renderBotaoStatus("Quero Jogar", "bookmark")}
          </View>
        </View>

        {status !== "Jogando" && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Avaliação</Text>
            {renderEstrelas()}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tempo Jogado</Text>
          <TextInput
            style={styles.input}
            placeholder="Duração em horas"
            placeholderTextColor="#6F6F6F"
            value={duracao}
            onChangeText={setDuracao}
            keyboardType="numeric"
          />
        </View>

        {status !== "Quero Jogar" && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>O que achou do jogo?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escreva sua review..."
              placeholderTextColor="#6F6F6F"
              value={review}
              onChangeText={setReview}
              multiline={true}
              textAlignVertical="top" 
            />
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handlePostar}>
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#6F6F6F",
    marginBottom: 32,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    outlineStyle: "none",
    borderWidth: 0,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  inputComIcone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 55,
  },
  inputTransparente: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    outlineStyle: "none",
    borderWidth: 0,
    height: "100%",
  },
  button: {
    backgroundColor: "#5012FF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linhaStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoStatus: {
    flex: 1,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  botaoStatusAtivo: {
    backgroundColor: "#5012FF",
  },
  textoStatus: {
    color: "#6F6F6F",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  textoStatusAtivo: {
    color: "#FFFFFF",
  },
  dropdown: {
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  itemSugestao: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  capinhaSugestao: {
    width: 30,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textoSugestao: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  cardSelecionado: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    padding: 12,
  },
  capinhaSelecionada: {
    width: 45,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  tituloSelecionado: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    fontWeight: "bold",
  },
  botaoRemover: {
    padding: 8,
  },
  textoRemover: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
  },
  estrelasContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  estrelaWrapper: {
    width: 40,
    height: 40,
    marginRight: 8,
    position: "relative",
  },
  metadeEsquerda: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 20,
    height: 40,
    zIndex: 10,
  },
  metadeDireita: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 20,
    height: 40,
    zIndex: 10,
  },
});