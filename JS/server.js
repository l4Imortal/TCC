const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Adicionar esta linha para importar o CORS
const app = express();
const PORT = 3000; // Usar uma porta adequada para HTTP

// Habilitar CORS para todas as rotas
app.use(cors());
app.use(express.json()); // Para permitir o envio de JSON no corpo da requisição

// Configurações do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cursoads',
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

// Endpoint para buscar dados de produtos
app.get('/api/produtos', (req, res) => {
  db.query('SELECT id_produto, ean, produto, categoria, un, data, fornecedor, estoque_minimo FROM produtos', (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results); // Retornar os dados como JSON
  });
});

// Endpoint para buscar dados de um produto específico
app.get('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT id_produto, ean, produto, categoria, un, data, fornecedor, estoque_minimo FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }
    res.json(results[0]); // Retornar o produto específico
  });
});

// Endpoint para criar um novo produto
app.post('/api/produtos', (req, res) => {
  const { ean, produto, categoria, un, data, fornecedor, estoque_minimo } = req.body;

  // Validação básica
  if (!ean || !produto || !categoria || !un || !data || !fornecedor || !estoque_minimo) {
    return res.status(400).json({ error: 'Campos obrigatórios: ean, produto, categoria, un, data, fornecedor, estoque_minimo' });
  }

  const query = 'INSERT INTO produtos (ean, produto, categoria, un, data, fornecedor, estoque_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [ean, produto, categoria, un, data, fornecedor, estoque_minimo], (err, results) => {
    if (err) {
      console.error('Erro ao cadastrar produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.status(201).json({
      id: results.insertId,
      message: 'Produto cadastrado com sucesso'
    });
  });
});

// Endpoint para atualizar um produto existente
app.put('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  const { ean, produto, categoria, un, data, fornecedor, estoque_minimo } = req.body;

  // Validação básica
  if (!ean || !produto || !categoria || !un || !data || !fornecedor || !estoque_minimo) {
    return res.status(400).json({ error: 'Campos obrigatórios: ean, produto, categoria, un, data, fornecedor, estoque_minimo' });
  }

  const query = 'UPDATE produtos SET ean = ?, produto = ?, categoria = ?, un = ?, data = ?, fornecedor = ?, estoque_minimo = ? WHERE id_produto = ?';
  db.query(query, [ean, produto, categoria, un, data, fornecedor, estoque_minimo, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      message: 'Produto atualizado com sucesso'
    });
  });
});

// Endpoint para excluir um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir produto:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      message: 'Produto excluído com sucesso'
    });
  });
});

// CRUD para Fornecedores

// GET - Listar todos os fornecedores
app.get('/api/fornecedores', (req, res) => {
  db.query('SELECT * FROM fornecedores', (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    res.json(results);
  });
});

// GET - Buscar um fornecedor específico pelo ID
app.get('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM fornecedores WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedor:', err.message);
      res.status(500).send('Erro no servidor');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Fornecedor não encontrado');
      return;
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo fornecedor
app.post('/api/fornecedores', (req, res) => {
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome e cnpj' });
  }

  const query = 'INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nome, cnpj, telefone, email, endereco, new Date()], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
      console.error('Erro ao cadastrar fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    res.status(201).json({
      id: results.insertId,
      message: 'Fornecedor cadastrado com sucesso'
    });
  });
});

// PUT - Atualizar um fornecedor existente
app.put('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome e cnpj' });
  }

  const query = 'UPDATE fornecedores SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? WHERE id_fornecedor = ?';
  db.query(query, [nome, cnpj, telefone, email, endereco, id], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNPJ já cadastrado para outro fornecedor' });
      }
      console.error('Erro ao atualizar fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({
      message: 'Fornecedor atualizado com sucesso'
    });
  });
});

// DELETE - Remover um fornecedor
app.delete('/api/fornecedores/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM fornecedores WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir fornecedor:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({
      message: 'Fornecedor excluído com sucesso'
    });
  });
});

// CRUD para Usuários

// GET - Listar todos os usuários
app.get('/api/usuario', (req, res) => {
  db.query('SELECT id_usuario, login, senha FROM usuario', (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    res.json(results);
  });
});

// GET - Buscar um usuário específico pelo ID
app.get('/api/usuario/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT id_usuario, login, senha FROM usuario WHERE id_usuario = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo usuário
app.post('/api/usuario', (req, res) => {
  const { login, senha } = req.body;

  // Validação básica
  if (!login || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: login e senha' });
  }

  const query = 'INSERT INTO usuario (login, senha) VALUES (?, ?)';
  db.query(query, [login, senha], (err, results) => {
    if (err) {
      console.error('Erro ao criar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    res.status(201).json({
      id: results.insertId,
      message: 'Usuário criado com sucesso'
    });
  });
});

// PUT - Atualizar um usuário existente
app.put('/api/usuario/:id', (req, res) => {
  const id = req.params.id;
  const { login, senha } = req.body;

  // Validação básica
  if (!login || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: login e senha' });
  }

  const query = 'UPDATE usuario SET login = ?, senha = ? WHERE id_usuario = ?';
  db.query(query, [login, senha, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Usuário atualizado com sucesso'
    });
  });
});

// DELETE - Remover um usuário
app.delete('/api/usuario/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir usuário:', err.message);
      return res.status(500).send('Erro no servidor');
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Usuário excluído com sucesso'
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
