const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 5500; // Usar uma porta adequada para HTTP

// Configurações do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'estoque'
});

// Testar conexão com o MySQL
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Endpoint para buscar dados
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, results) => { // Ajuste a tabela para o seu caso
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

fetch('http://127.0.0.1:5500/api/produtos') // Porta 3000, porque 3306 não suporta HTTP
  .then(response => response.json())
  .then(data => console.log(data)) // Exibe os dados no console
  .catch(err => console.error('Erro durante o fetch:', err.message));