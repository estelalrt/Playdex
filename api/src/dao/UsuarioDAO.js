const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_dZQjkNY7IP9m@ep-lively-waterfall-a4ww2lmv-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

class UsuarioDAO {
    async verificarLogin(identificador, senha) {
        const sql = 'SELECT * FROM usuario WHERE (email = $1 OR username = $1) AND senha = $2';
        const resultado = await pool.query(sql, [identificador, senha]);
        return resultado.rows[0];
    }

    async criarUsuario(nome, email, username, senha) {
        const sql = 'INSERT INTO usuario (nome, email, username, senha) VALUES ($1, $2, $3, $4) RETURNING id, nome';
        const valores = [nome, email, username, senha];
        const resultado = await pool.query(sql, valores);
        return resultado.rows[0];
    }

    async atualizarBio(username, bio, foto_perfil) {
        const sql = 'UPDATE usuario SET bio = $1, foto_perfil = $2 WHERE username = $3 RETURNING id, username, bio, foto_perfil';
        const valores = [bio, foto_perfil, username];
        const resultado = await pool.query(sql, valores);
        return resultado.rows[0];
    }

    async buscarPorUsername(username) {
        const sql = 'SELECT username, nome, bio, foto_perfil FROM usuario WHERE username = $1';
        const resultado = await pool.query(sql, [username]);
        return resultado.rows[0];
    }

    async pegarFeed(username) {
        const sql = `
        SELECT 
            amigo.username, 
            amigo.foto_perfil, 
            jogo.foto_capa,
            atividade.status,  
            atividade.nota    
        FROM atividade
        JOIN usuario amigo ON atividade.id_usuario = amigo.id
        JOIN jogo ON atividade.id_jogo = jogo.id
        WHERE atividade.id_usuario IN (
            SELECT seguidores.id_seguido 
            FROM seguidores 
            JOIN usuario eu ON seguidores.id_seguidor = eu.id
            WHERE eu.username = $1
        )
        ORDER BY atividade.data DESC;
        `;
        const resultado = await pool.query(sql, [username]);
        return resultado.rows; 
    }

    async buscarJogoPorNome(nomePesquisa) {
        const sql = `SELECT id, titulo, foto_capa FROM jogo WHERE titulo ILIKE $1 LIMIT 5`;
        const resultado = await pool.query(sql, [`%${nomePesquisa}%`]);
        return resultado.rows;
    }

    async salvarFavorito(username, idJogo, posicao) {
        const sql = `
          INSERT INTO favoritos (id_usuario, id_jogo, posicao)
          VALUES ((SELECT id FROM usuario WHERE username = $1), $2, $3)
          ON CONFLICT (id_usuario, posicao) 
          DO UPDATE SET id_jogo = EXCLUDED.id_jogo;
        `;
        await pool.query(sql, [username, idJogo, posicao]);
    }

    async buscarFavoritos(username) {
        const sql = `
          SELECT f.posicao, j.id, j.titulo, j.foto_capa 
          FROM favoritos f
          JOIN jogo j ON f.id_jogo = j.id
          WHERE f.id_usuario = (SELECT id FROM usuario WHERE username = $1)
          ORDER BY f.posicao;
        `;
        const resultado = await pool.query(sql, [username]);
        return resultado.rows;
    }

    // A FUNÇÃO DE SALVAR NO BANCO COM DURACAO E DATA CORRETAS
    async postarAtividade(username, id_jogo, status, duracao, nota) {
        const sql = `
          INSERT INTO atividade (id_usuario, id_jogo, status, duracao, data, nota) 
          VALUES (
              (SELECT id FROM usuario WHERE username = $1), 
              $2, 
              $3, 
              $4, 
              NOW(), 
              $5
          )
        `;
        const valores = [username, id_jogo, status, duracao, nota];
        await pool.query(sql, valores);
    }
}

module.exports = new UsuarioDAO();