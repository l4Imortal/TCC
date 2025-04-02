const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Permite conexões entre frontend e backend

// Configurar conexão com MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "estoque"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao MySQL!");
});

// Rota para cadastrar um produto
app.post("/cadastrarProduto", (req, res) => {
  const { nome, categoria, preco } = req.body;

  if (!nome || !categoria || !preco) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
  }

  const sql = "INSERT INTO produtos (nome, categoria, preco) VALUES (?, ?, ?)";
  db.query(sql, [nome, categoria, preco], (err, result) => {
    if (err) {
      console.error("Erro ao cadastrar produto:", err);
      return res.status(500).json({ erro: "Erro ao cadastrar produto!" });
    }
    res.json({ mensagem: "Produto cadastrado com sucesso!", id: result.insertId });
  });
});

// Inicia o servidor na porta 3306
app.listen(3306, () => {
  console.log("Servidor rodando na porta 3306...");
});

fetch("http://localhost:3306/estoque", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nome: "Camisa",
    categoria: "Roupas",
    preco: 49.90
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro ao cadastrar:", error));