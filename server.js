const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware para permitir requisições de outros domínios
app.use(cors());

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost", // Endereço do servidor
  user: "root", // Usuário do banco de dados
  password: "1234", // Senha do banco de dados
  database: "estoque", // Nome do banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados MySQL!");
});

// Rota para buscar os produtos
app.get("/produtos", (req, res) => {
  const query = "SELECT id_produto, nome, descricao, preco, categoria FROM produtos";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err);
      res.status(500).send("Erro ao buscar produtos");
      return;
    }
    res.json(results);
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});