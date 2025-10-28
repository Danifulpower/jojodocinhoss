// netlify/functions/connect.js

import { neon } from '@netlify/neon';

// O Netlify injeta automaticamente a variável de ambiente NETLIFY_DATABASE_URL
// se você a configurar no painel do Netlify.
// A função `neon()` a usará automaticamente.
const sql = neon();

exports.handler = async (event, context) => {
  try {
    // Exemplo de consulta:
    // **Atenção:** A tabela 'posts' e a coluna 'id' são apenas um exemplo.
    // Você deve adaptar esta consulta para as suas tabelas.

    // Para evitar injeção de SQL, sempre use placeholders (como ${postId})
    // e nunca concatene strings diretamente na consulta.
    const postId = 1; // Exemplo de ID

    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Conexão bem-sucedida ao Neon DB via Netlify Function!",
        // Retorna o resultado da consulta de exemplo.
        // Se a tabela 'posts' não existir, isso pode falhar.
        // Você pode começar com uma consulta mais simples como:
        // const result = await sql`SELECT 1 as success;`
        data: post || "Nenhum post encontrado com o ID 1. Verifique se a tabela 'posts' existe."
      }),
    };
  } catch (error) {
    console.error("Erro ao conectar ou consultar o banco de dados:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Falha na conexão ou consulta ao banco de dados.",
        details: error.message,
      }),
    };
  }
};
