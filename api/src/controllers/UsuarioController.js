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

  async buscarDetalhesJogo(req, res) {
    try {
      const { id } = req.params; 
      const jogo = await UsuarioDAO.buscarJogoPorId(id);
      
      if (jogo) {
        return res.status(200).json(jogo);
      } else {
        return res.status(404).json({ erro: "Jogo não encontrado" });
      }
    } catch (erro) {
      console.error("Erro ao buscar detalhes do jogo:", erro);
      return res.status(500).json({ mensagem: "Erro ao carregar detalhes do jogo" });
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

  async registrarAtividade(req, res) {
        try {
            const { username, id_jogo, status, duracao, data, nota, review } = req.body;
            const atividadeExistente = await UsuarioDAO.verificarAtividadeDuplicada(username, id_jogo, status);
            
            if (atividadeExistente) {
                return res.status(400).json({ error: "Você já registrou esse jogo com esse mesmo status!" });
            }

            await UsuarioDAO.postarAtividade(username, id_jogo, status, duracao, data, nota, review);
            res.status(201).json({ message: "Atividade registrada com sucesso!" });
        } catch (erro) {
            console.error("Erro ao registrar atividade:", erro);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
  }

  async buscarJogosPopulares(req, res) {
    try {
      const jogosPopulares = await UsuarioDAO.pegarJogosEmAlta(); 
      res.status(200).json(jogosPopulares);
    } catch (erro) {
      console.error("Erro ao buscar jogos populares no banco:", erro);
      res.status(500).json({ error: "Erro interno ao buscar jogos em alta" });
    }
  }

  async buscarAtividadesPerfil(req, res) {
    try {
      const { username } = req.params;
      const atividades = await UsuarioDAO.pegarAtividadesDoUsuario(username);
      res.status(200).json(atividades);
    } catch (erro) {
      console.error("Erro ao buscar atividades do perfil:", erro);
      res.status(500).json({ mensagem: "Erro ao buscar diário de atividades" });
    }
  }

  async buscarRecomendacoes(req, res) {
        try {
            const { username } = req.params;
            const recomendados = await UsuarioDAO.pegarRecomendacoes(username);
            res.status(200).json(recomendados);
        } catch (erro) {
            console.error("Erro ao buscar recomendações:", erro);
            res.status(500).json({ erro: "Falha ao buscar recomendações" });
        }
  }

  // --- NOVAS FUNÇÕES DE REDE SOCIAL AQUI! ---
  async seguir(req, res) {
      try {
          const { seguidor, seguido } = req.body;
          if (seguidor === seguido) {
              return res.status(400).json({ erro: "Você não pode seguir a si mesmo." });
          }
          await UsuarioDAO.seguirUsuario(seguidor, seguido);
          res.status(200).json({ mensagem: "Seguindo com sucesso!" });
      } catch (erro) {
          console.error("Erro ao seguir:", erro);
          res.status(500).json({ erro: "Erro interno no servidor" });
      }
  }

  async unfollow(req, res) {
      try {
          const { seguidor, seguido } = req.body;
          await UsuarioDAO.deixarDeSeguir(seguidor, seguido);
          res.status(200).json({ mensagem: "Deixou de seguir." });
      } catch (erro) {
          console.error("Erro ao deixar de seguir:", erro);
          res.status(500).json({ erro: "Erro interno no servidor" });
      }
  }

  async contagemRede(req, res) {
      try {
          const { username } = req.params;
          const contagem = await UsuarioDAO.obterContagemSeguidores(username);
          res.status(200).json(contagem);
      } catch (erro) {
          console.error("Erro ao buscar contagem:", erro);
          res.status(500).json({ erro: "Erro interno no servidor" });
      }
  }

  async checarSeguir(req, res) {
      try {
          const { seguidor, seguido } = req.params;
          const segue = await UsuarioDAO.verificaSeSegue(seguidor, seguido);
          res.status(200).json({ segue });
      } catch (erro) {
          console.error("Erro ao verificar status:", erro);
          res.status(500).json({ erro: "Erro interno no servidor" });
      }
  }
}

module.exports = new UsuarioController();