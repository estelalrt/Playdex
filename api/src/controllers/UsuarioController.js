const UsuarioDAO = require('../dao/UsuarioDAO'); // Verifique se o caminho da pasta está certo no seu projeto

class UsuarioController {
  async login(req, res) {
    const { email, senha } = req.body; 
    try {
      const usuario = await UsuarioDAO.verificarLogin(email, senha);
      if (usuario) {
        res.status(200).json({ mensagem: "Login efetuado com sucesso!", usuario });
      } else {
        res.status(401).json({ erro: "E-mail/Username ou senha incorretos." });
      }
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro interno no banco de dados." });
    }
  }

  async cadastrar(req, res) {
    const { nome, email, username, senha } = req.body;
    try {
      const novoUsuario = await UsuarioDAO.criarUsuario(nome, email, username, senha);
      res.status(201).json({ mensagem: "Usuário criado!", usuario: novoUsuario });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
  }

  async atualizarPerfil(req, res) {
    const { username, bio, foto_perfil } = req.body;
    try {
      const usuarioAtualizado = await UsuarioDAO.atualizarBio(username, bio, foto_perfil);
      res.status(200).json({ mensagem: "Perfil atualizado!", usuario: usuarioAtualizado });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao atualizar o perfil." });
    }
  }

  async buscarPerfil(req, res) {
    const { username } = req.params;
    try {
      const usuario = await UsuarioDAO.buscarPorUsername(username);
      if (usuario) {
        res.status(200).json(usuario);
      } else {
        res.status(404).json({ erro: "Usuário não encontrado" });
      }
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao buscar perfil." });
    }
  }

  async buscarFeed(req, res) {
    try {
      const { username } = req.params;
      const atividades = await UsuarioDAO.pegarFeed(username);
      return res.status(200).json(atividades);
    } catch (erro) {
      console.log("Erro no Controller do Feed:", erro);
      return res.status(500).json({ mensagem: "Erro ao buscar o feed" });
    } 
  }
  
  async buscarJogo(req, res) {
    try {
      const nomePesquisa = req.query.q; 
      if (!nomePesquisa) {
        return res.json([]); 
      }
      const jogos = await UsuarioDAO.buscarJogoPorNome(nomePesquisa);
      return res.status(200).json(jogos);
    } catch (erro) {
      console.log("Erro ao buscar jogos:", erro);
      return res.status(500).json({ mensagem: "Erro ao pesquisar jogo" });
    }
  }

  async atualizarFavorito(req, res) {
    try {
      const { username, id_jogo, posicao } = req.body;
      await UsuarioDAO.salvarFavorito(username, id_jogo, posicao);
      res.status(200).json({ mensagem: "Favorito atualizado!" });
    } catch (erro) {
      res.status(500).json({ mensagem: "Erro ao salvar favorito" });
    }
  }

  async listarFavoritos(req, res) {
    try {
      const { username } = req.params;
      const favs = await UsuarioDAO.buscarFavoritos(username);
      res.json(favs);
    } catch (erro) {
      res.status(500).json({ mensagem: "Erro ao buscar favoritos" });
    }
  }

  // A FUNÇÃO DA FOFOCA COM OS NOMES CORRETOS
  async registrarAtividade(req, res) {
        try {
            // Agora extraímos a data e a review que vêm do aplicativo
            const { username, id_jogo, status, duracao, data, nota, review } = req.body;

            // Passamos na ordem exata que o DAO está esperando
            await UsuarioDAO.postarAtividade(username, id_jogo, status, duracao, data, nota, review);
            
            res.status(201).json({ message: "Atividade registrada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao registrar atividade:", erro);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
  }

  async buscarJogosPopulares(req, res) {
        try {
            const RAWG_KEY = 'e1b2f6d050a1411eb60aeadbfdb03325'; 
            
            // Calculando dinamicamente os anos para o filtro de datas
            const anoAtual = new Date().getFullYear();
            const dataInicio = `${anoAtual - 1}-01-01`; // Ex: 2025-01-01
            const dataFim = `${anoAtual}-12-31`;       // Ex: 2026-12-31
            
            // Adicionamos o filtro "dates=" antes do ordering
            const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&dates=${dataInicio},${dataFim}&ordering=-added&page_size=10`;

            const resposta = await fetch(url);
            const dados = await resposta.json();

            const jogosPopulares = dados.results.map(jogo => ({
                id: jogo.id,
                titulo: jogo.name,
                foto_capa: jogo.background_image
            }));

            res.status(200).json(jogosPopulares);
        } catch (erro) {
            console.error("Erro ao buscar jogos populares:", erro);
            res.status(500).json({ error: "Erro interno ao buscar da RAWG" });
        }
    }

}

module.exports = new UsuarioController();