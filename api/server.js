const express = require('express');
const cors = require('cors'); 
const UsuarioController = require('./src/controllers/UsuarioController');

const app = express();

app.use(cors({
  origin: '*', 
  allowedHeaders: ['Content-Type', 'Accept', 'User-Agent']
}));

app.use(express.json());


app.post('/login', UsuarioController.login);
app.post('/cadastro', UsuarioController.cadastrar);
app.put('/atualizar-perfil', UsuarioController.atualizarPerfil);
app.get('/perfil/:username', UsuarioController.buscarPerfil);
app.get('/feed/:username', UsuarioController.buscarFeed);
app.get('/jogos/busca', UsuarioController.buscarJogo);
app.put('/favoritos', UsuarioController.atualizarFavorito);
app.get('/favoritos/:username', UsuarioController.listarFavoritos);
app.post('/atividade', UsuarioController.registrarAtividade);
app.get('/jogos/populares', UsuarioController.buscarJogosPopulares);
app.get("/usuario/:username/atividades", UsuarioController.buscarAtividadesPerfil);

app.listen(3000, () => {
  console.log('Rodando na porta 3000');
});