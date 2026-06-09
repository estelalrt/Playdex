const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
        const sql = 'INSERT INTO usuario (nome, email, username, senha) VALUES ($1, $2, $3, $4) RETURNING id, nome, username';
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
            atividade.nota,
            jogo.id AS id_jogo    
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

    async postarAtividade(username, id_jogo, status, duracao, data, nota, review) {
        const sql = `
          INSERT INTO atividade (id_usuario, id_jogo, status, duracao, data, nota, review) 
          VALUES (
              (SELECT id FROM usuario WHERE username = $1), 
              $2, 
              $3, 
              $4, 
              $5, 
              $6,
              $7
          )
        `;
        const valores = [username, id_jogo, status, duracao, data, nota, review];
        await pool.query(sql, valores);
    }

    async verificarAtividadeDuplicada(username, id_jogo, status) {
        const sql = `
          SELECT id FROM atividade 
          WHERE id_usuario = (SELECT id FROM usuario WHERE username = $1) 
          AND id_jogo = $2 
          AND status = $3
        `;
        const resultado = await pool.query(sql, [username, id_jogo, status]);
        return resultado.rows[0]; 
    }

    async pegarJogosEmAlta() {
        try {
          const sql = `
            SELECT j.id, j.titulo, j.foto_capa 
            FROM jogos_em_alta ja
            INNER JOIN jogo j ON ja.id_jogo = j.id
            ORDER BY ja.posicao ASC
          `;
          const resultado = await pool.query(sql); 
          return resultado.rows;
        } catch (erro) {
          console.error("Erro no DAO ao buscar jogos em alta:", erro);
          throw erro; 
        }
    }

    async pegarAtividadesDoUsuario(username) {
        const sql = `
          SELECT 
            a.id,
            a.status,
            a.duracao,
            a.data,
            a.nota,
            a.review,
            j.titulo AS jogo_titulo,
            j.foto_capa AS jogo_capa
          FROM atividade a
          JOIN jogo j ON a.id_jogo = j.id
          WHERE a.id_usuario = (SELECT id FROM usuario WHERE username = $1)
          ORDER BY a.data DESC;
        `;
        const resultado = await pool.query(sql, [username]);
        return resultado.rows;
    }

    async pegarRecomendacoes(username) {
        const sql = `
            SELECT j.id, j.titulo, j.foto_capa
            FROM jogo j
            WHERE j.genero IN (
                SELECT j2.genero
                FROM favoritos f
                JOIN jogo j2 ON f.id_jogo = j2.id
                WHERE f.id_usuario = (SELECT id FROM usuario WHERE username = $1)
                AND j2.genero IS NOT NULL
            )
            AND j.id NOT IN (
                SELECT id_jogo FROM favoritos 
                WHERE id_usuario = (SELECT id FROM usuario WHERE username = $1)
                AND id_jogo IS NOT NULL
            )
            LIMIT 10;
        `;
        const resultado = await pool.query(sql, [username]);
        return resultado.rows;
    }

    async buscarJogoPorId(id) {
        const sql = `
          SELECT 
            j.*, 
            COALESCE((SELECT ROUND(AVG(nota), 1) FROM atividade WHERE id_jogo = j.id), 0) AS media_nota
          FROM jogo j 
          WHERE j.id = $1
        `;
        const resultado = await pool.query(sql, [id]);
        return resultado.rows[0];
    }

    
    async seguirUsuario(seguidorUsername, seguidoUsername) {
        const sql = `
            INSERT INTO seguidores (id_seguidor, id_seguido) 
            VALUES (
                (SELECT id FROM usuario WHERE username = $1),
                (SELECT id FROM usuario WHERE username = $2)
            )
        `;
        await pool.query(sql, [seguidorUsername, seguidoUsername]);
    }

    async deixarDeSeguir(seguidorUsername, seguidoUsername) {
        const sql = `
            DELETE FROM seguidores 
            WHERE id_seguidor = (SELECT id FROM usuario WHERE username = $1) 
              AND id_seguido = (SELECT id FROM usuario WHERE username = $2)
        `;
        await pool.query(sql, [seguidorUsername, seguidoUsername]);
    }

    async obterContagemSeguidores(username) {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM seguidores WHERE id_seguido = u.id) as seguidores,
                (SELECT COUNT(*) FROM seguidores WHERE id_seguidor = u.id) as seguindo
            FROM usuario u
            WHERE u.username = $1
        `;
        const resultado = await pool.query(sql, [username]);
        
        if (resultado.rows.length > 0) {
            return {
                followers: parseInt(resultado.rows[0].seguidores),
                following: parseInt(resultado.rows[0].seguindo)
            };
        }
        return { followers: 0, following: 0 };
    }

    async verificaSeSegue(seguidorUsername, seguidoUsername) {
        const sql = `
            SELECT 1 FROM seguidores 
            WHERE id_seguidor = (SELECT id FROM usuario WHERE username = $1) 
              AND id_seguido = (SELECT id FROM usuario WHERE username = $2)
        `;
        const resultado = await pool.query(sql, [seguidorUsername, seguidoUsername]);
        
        return resultado.rows.length > 0;
    }

    
    async buscarUsuariosPorNome(pesquisa) {
        const sql = `
            SELECT username, nome, foto_perfil 
            FROM usuario 
            WHERE username ILIKE $1 OR nome ILIKE $1 
            LIMIT 10
        `;
        const resultado = await pool.query(sql, [`%${pesquisa}%`]);
        return resultado.rows;
    }
}

module.exports = new UsuarioDAO();