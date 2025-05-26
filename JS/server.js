const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/../"));

// Configurações do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "26216911a",
  database: "estoque",
});

// Testar conexão com o MySQL
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err.message);
    return;
  }
  console.log("Conectado ao MySQL!");
});

// Função auxiliar para tratamento de erros
const handleError = (res, err, message) => {
  console.error(`${message}:`, err);
  return res.status(500).json({
    error: message,
    details: err.message,
    code: err.code,
  });
};

// ==================== USUÁRIOS (CORRIGIDO) ====================

// GET - Listar todos os usuários
app.get("/api/usuarios", (req, res) => {
  console.log("GET /api/usuarios - Listando usuários");
  
  db.query("SELECT id_usuario, login, email, senha as password FROM usuario", (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar usuários");
    }
    
    console.log(`Encontrados ${results.length} usuários`);
    res.json(results);
  });
});

// GET - Buscar usuário por ID
app.get("/api/usuarios/:id", (req, res) => {
  const userId = req.params.id;
  console.log(`GET /api/usuarios/${userId} - Buscando usuário específico`);
  
  db.query("SELECT id_usuario, login, email, senha as password FROM usuario WHERE id_usuario = ?", [userId], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar usuário");
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado",
        userId: userId
      });
    }
    
    res.json(results[0]);
  });
});

// POST - Criar novo usuário (CORRIGIDO)
app.post("/api/usuarios", (req, res) => {
  console.log("=== POST /api/usuarios - Criando novo usuário ===");
  console.log("Headers:", req.headers);
  console.log("Body recebido:", req.body);
  
  const { nome, email, username, login, password, senha } = req.body;
  
  // Usar login ou username (compatibilidade)
  const nomeUsuario = login || username || nome; // Usar nome como fallback
  const senhaUsuario = password || senha;
  
  console.log("Dados extraídos:", { 
    email: email, 
    login: nomeUsuario, 
    passwordLength: senhaUsuario?.length 
  });
  
  // Validações básicas
  if (!email || !nomeUsuario || !senhaUsuario) {
    console.error("Validação falhou - campos obrigatórios:", {
      email: !!email,
      login: !!nomeUsuario,
      password: !!senhaUsuario
    });
    return res.status(400).json({ 
      error: "Campos obrigatórios: email, login/username, password",
      received: { 
        email: !!email, 
        login: !!nomeUsuario, 
        password: !!senhaUsuario 
      }
    });
  }
  
  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  
  // Verificar se o username já existe
  console.log("Verificando se login já existe:", nomeUsuario);
  db.query("SELECT id_usuario FROM usuario WHERE login = ?", [nomeUsuario], (err, results) => {
    if (err) {
      console.error("Erro ao verificar login existente:", err);
      return handleError(res, err, "Erro ao verificar usuário existente");
    }
    
    if (results.length > 0) {
      console.log("Login já existe:", nomeUsuario);
      return res.status(400).json({ error: "Nome de usuário já existe" });
    }
    
    // Verificar se o email já existe
    console.log("Verificando se email já existe:", email);
    db.query("SELECT id_usuario FROM usuario WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("Erro ao verificar email existente:", err);
        return handleError(res, err, "Erro ao verificar email existente");
      }
      
      if (results.length > 0) {
        console.log("Email já existe:", email);
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      
      // Inserir novo usuário (usando a estrutura atual: login, email, senha)
      const query = "INSERT INTO usuario (login, email, senha) VALUES (?, ?, ?)";
      const params = [nomeUsuario, email, senhaUsuario];
      
      console.log("Executando query:", query);
      console.log("Com parâmetros:", [nomeUsuario, email, "***"]);
      
      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Erro ao inserir usuário:", err);
          console.error("Código do erro:", err.code);
          console.error("Mensagem do erro:", err.message);
          
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
              error: "Login ou email já existe",
              details: err.message
            });
          }
          
          return handleError(res, err, "Erro ao criar usuário");
        }
        
        console.log('Usuário criado com sucesso, ID:', result.insertId);
        res.status(201).json({
          success: true,
          message: "Usuário criado com sucesso",
          userId: result.insertId,
          usuario: {
            id_usuario: result.insertId,
            login: nomeUsuario,
            email: email
          }
        });
      });
    });
  });
});


// PUT - Atualizar usuário
app.put("/api/usuarios/:id", (req, res) => {
  console.log("=== PUT /api/usuarios/:id CHAMADA ===");
  console.log("ID recebido:", req.params.id);
  console.log("Dados recebidos:", req.body);
  
  const userId = req.params.id;
  const { email, login, username, password, senha } = req.body;

  // Usar login ou username (compatibilidade)
  const nomeUsuario = login || username;
  const senhaUsuario = password || senha;

  // Validações básicas
  if (!email || !nomeUsuario) {
    console.log("Erro de validação: campos obrigatórios");
    return res.status(400).json({
      error: "Email e nome de usuário são obrigatórios",
      received: req.body
    });
  }

  // Construir a query SQL
  let query;
  let params;

  if (senhaUsuario && senhaUsuario.trim() !== '') {
    // Atualizar com senha
    query = "UPDATE usuario SET email = ?, login = ?, senha = ? WHERE id_usuario = ?";
    params = [email, nomeUsuario, senhaUsuario, userId];
    console.log("Atualizando com senha");
  } else {
    // Atualizar sem senha
    query = "UPDATE usuario SET email = ?, login = ? WHERE id_usuario = ?";
    params = [email, nomeUsuario, userId];
    console.log("Atualizando sem senha");
  }

  console.log("Query SQL:", query);
  console.log("Parâmetros:", params);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Erro na query SQL:", err);
      return handleError(res, err, "Erro ao atualizar usuário no banco de dados");
    }

    console.log("Resultado da query:", result);

    if (result.affectedRows === 0) {
      console.log("Nenhuma linha foi afetada - usuário não encontrado");
      return res.status(404).json({
        error: "Usuário não encontrado",
        userId: userId
      });
    }

    console.log("Usuário atualizado com sucesso");
    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      affectedRows: result.affectedRows
    });
  });
});

// DELETE - Excluir usuário
app.delete("/api/usuarios/:id", (req, res) => {
  const userId = req.params.id;
  console.log(`DELETE /api/usuarios/${userId} - Excluindo usuário`);
  
  db.query("DELETE FROM usuario WHERE id_usuario = ?", [userId], (err, result) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir usuário");
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado",
        userId: userId
      });
    }
    
    console.log("Usuário excluído com sucesso");
    res.json({
      success: true,
      message: "Usuário excluído com sucesso",
      affectedRows: result.affectedRows
    });
  });
});

// ==================== PRODUTOS ====================
// GET - Listar todos os produtos
app.get("/api/produtos", (req, res) => {
  db.query("SELECT id_produto, ean, produto, categoria, un, data, fornecedor, estoque_minimo FROM produtos", (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar produtos");
    }
    res.json(results);
  });
});

// GET - Buscar um produto específico pelo ID
app.get("/api/produtos/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT id_produto, ean, produto, categoria, un, data, fornecedor, estoque_minimo FROM produtos WHERE id_produto = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar produto");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo produto
app.post("/api/produtos", (req, res) => {
  const { ean, produto, categoria, un, data, fornecedor, estoque_minimo } = req.body;

  // Validação básica
  if (!ean || !produto || !categoria || !un || !data || !fornecedor || !estoque_minimo) {
    return res.status(400).json({
      error: "Campos obrigatórios: ean, produto, categoria, un, data, fornecedor, estoque_minimo",
    });
  }

  const query = "INSERT INTO produtos (ean, produto, categoria, un, data, fornecedor, estoque_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [ean, produto, categoria, un, data, fornecedor, estoque_minimo], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao cadastrar produto");
    }
    res.status(201).json({
      id: results.insertId,
      message: "Produto cadastrado com sucesso",
    });
  });
});

// PUT - Atualizar um produto existente
app.put("/api/produtos/:id", (req, res) => {
  const id = req.params.id;
  const { ean, produto, categoria, un, data, fornecedor, estoque_minimo } = req.body;

  // Validação básica
  if (!ean || !produto || !categoria || !un || !data || !fornecedor || !estoque_minimo) {
    return res.status(400).json({
      error: "Campos obrigatórios: ean, produto, categoria, un, data, fornecedor, estoque_minimo",
    });
  }

  const query = "UPDATE produtos SET ean = ?, produto = ?, categoria = ?, un = ?, data = ?, fornecedor = ?, estoque_minimo = ? WHERE id_produto = ?";
  db.query(query, [ean, produto, categoria, un, data, fornecedor, estoque_minimo, id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao atualizar produto");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json({
      message: "Produto atualizado com sucesso",
    });
  });
});

// DELETE - Remover um produto
app.delete("/api/produtos/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM produtos WHERE id_produto = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir produto");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json({
      message: "Produto excluído com sucesso",
    });
  });
});

// ==================== FORNECEDORES ====================
// GET - Listar todos os fornecedores
app.get("/api/fornecedores", (req, res) => {
  db.query("SELECT * FROM fornecedores", (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar fornecedores");
    }
    res.json(results);
  });
});

// GET - Buscar um fornecedor específico pelo ID
app.get("/api/fornecedores/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM fornecedores WHERE id_fornecedor = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar fornecedor");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    res.json(results[0]);
  });
});

// POST - Criar um novo fornecedor
app.post("/api/fornecedores", (req, res) => {
  console.log("Requisição recebida para cadastrar fornecedor:", req.body);
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: "Campos obrigatórios: nome e cnpj" });
  }

  // Verificar a estrutura da tabela fornecedores
  db.query("DESCRIBE fornecedores", (descErr, descResults) => {
    if (descErr) {
      console.error("Erro ao verificar estrutura da tabela:", descErr);
      return res.status(500).json({
        error: "Erro ao verificar estrutura da tabela",
        details: descErr.message,
      });
    }

    console.log("Estrutura da tabela fornecedores:", descResults);

    // Verificar se a tabela tem a coluna data_cadastro
    const hasDataCadastro = descResults.some((column) => column.Field === "data_cadastro");

    let query, params;
    if (hasDataCadastro) {
      query = "INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)";
      params = [nome, cnpj, telefone || "", email || "", endereco || "", new Date()];
    } else {
      query = "INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)";
      params = [nome, cnpj, telefone || "", email || "", endereco || ""];
    }

    console.log("Executando query:", query);
    console.log("Parâmetros:", params);

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Erro detalhado ao cadastrar fornecedor:", {
          message: err.message,
          code: err.code,
          errno: err.errno,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage,
        });
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "CNPJ já cadastrado" });
        }
        return res.status(500).json({
          error: "Erro ao cadastrar fornecedor",
          details: err.message,
          code: err.code,
        });
      }

      console.log("Fornecedor cadastrado com sucesso:", results);
      res.status(201).json({
        id: results.insertId,
        message: "Fornecedor cadastrado com sucesso",
      });
    });
  });
});

// PUT - Atualizar um fornecedor existente
app.put("/api/fornecedores/:id", (req, res) => {
  const id = req.params.id;
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // Validação básica
  if (!nome || !cnpj) {
    return res.status(400).json({ error: "Campos obrigatórios: nome e cnpj" });
  }

  const query = "UPDATE fornecedores SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? WHERE id_fornecedor = ?";
  db.query(query, [nome, cnpj, telefone || "", email || "", endereco || "", id], (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "CNPJ já cadastrado para outro fornecedor" });
      }
      return handleError(res, err, "Erro ao atualizar fornecedor");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    res.json({
      message: "Fornecedor atualizado com sucesso",
    });
  });
});

// DELETE - Remover um fornecedor
app.delete("/api/fornecedores/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM fornecedores WHERE id_fornecedor = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir fornecedor");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    res.json({
      message: "Fornecedor excluído com sucesso",
    });
  });
});

// ==================== MOVIMENTAÇÕES ====================
// GET - Listar todas as movimentações
app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes", (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar movimentações");
    }
    res.json(results);
  });
});

// GET - Buscar uma movimentação específica pelo ID
app.get("/api/movimentacoes/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM movimentacoes WHERE id_movimentacao = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar movimentação");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Movimentação não encontrada" });
    }
    res.json(results[0]);
  });
});

// POST - Criar uma nova movimentação
app.post("/api/movimentacoes", (req, res) => {
  const { id_produto, tipo_movimentacao, quantidade, data_movimentacao } = req.body;

  // Validação básica
  if (!id_produto || !tipo_movimentacao || !quantidade) {
    return res.status(400).json({
      error: "Campos obrigatórios: id_produto, tipo_movimentacao, quantidade",
    });
  }

  const query = "INSERT INTO movimentacoes (id_produto, tipo_movimentacao, quantidade, data_movimentacao) VALUES (?, ?, ?, ?)";
  db.query(query, [id_produto, tipo_movimentacao, quantidade, data_movimentacao || new Date()], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao criar movimentação");
    }
    res.status(201).json({
      id: results.insertId,
      message: "Movimentação criada com sucesso",
    });
  });
});

// PUT - Atualizar uma movimentação existente
app.put("/api/movimentacoes/:id", (req, res) => {
  const id = req.params.id;
  const { id_produto, tipo_movimentacao, quantidade, data_movimentacao } = req.body;

  // Validação básica
  if (!id_produto || !tipo_movimentacao || !quantidade) {
    return res.status(400).json({
      error: "Campos obrigatórios: id_produto, tipo_movimentacao, quantidade",
    });
  }

  const query = "UPDATE movimentacoes SET id_produto = ?, tipo_movimentacao = ?, quantidade = ?, data_movimentacao = ? WHERE id_movimentacao = ?";
  db.query(query, [id_produto, tipo_movimentacao, quantidade, data_movimentacao || new Date(), id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao atualizar movimentação");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Movimentação não encontrada" });
    }
    res.json({
      message: "Movimentação atualizada com sucesso",
    });
  });
});

// DELETE - Remover uma movimentação
app.delete("/api/movimentacoes/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM movimentacoes WHERE id_movimentacao = ?", [id], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir movimentação");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Movimentação não encontrada" });
    }
    res.json({
      message: "Movimentação excluída com sucesso",
    });
  });
});

// ==================== AUTENTICAÇÃO ====================
// POST - Autenticar usuário
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM usuario WHERE login = ? AND senha = ?", [username, password], (err, results) => {
    if (err) return handleError(res, err, "Erro ao autenticar");
    if (results.length > 0) {
      res.json({ user: results[0] });
    } else {
      res.status(401).json({ error: "Usuário ou senha inválidos!" });
    }
  });
});

// ==================== RELATÓRIOS ====================
// GET - Relatório de estoque atual
app.get("/api/relatorios/estoque", (req, res) => {
  const query = `
    SELECT
      p.id_produto,
      p.ean,
      p.produto,
      p.categoria,
      p.un,
      p.fornecedor,
      p.estoque_minimo,
      COALESCE(SUM(CASE WHEN m.tipo_movimentacao = 'entrada' THEN m.quantidade ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN m.tipo_movimentacao = 'saida' THEN m.quantidade ELSE 0 END), 0) AS quantidade_atual
    FROM
      produtos p
    LEFT JOIN
      movimentacoes m ON p.id_produto = m.id_produto
    GROUP BY
      p.id_produto, p.ean, p.produto, p.categoria, p.un, p.fornecedor, p.estoque_minimo
  `;

  db.query(query, (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao gerar relatório de estoque");
    }
    res.json(results);
  });
});

// GET - Relatório de movimentações por período
app.get("/api/relatorios/movimentacoes", (req, res) => {
  const { dataInicio, dataFim } = req.query;

  let query = `
    SELECT
      m.id_movimentacao,
      m.id_produto,
      p.produto AS nome_produto,
      m.tipo_movimentacao,
      m.quantidade,
      m.data_movimentacao
    FROM
      movimentacoes m
    JOIN
      produtos p ON m.id_produto = p.id_produto
  `;

  const params = [];
  if (dataInicio && dataFim) {
    query += ` WHERE m.data_movimentacao BETWEEN ? AND ?`;
    params.push(dataInicio, dataFim);
  }

  query += ` ORDER BY m.data_movimentacao DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao gerar relatório de movimentações");
    }
    res.json(results);
  });
});

// ==================== ENTRADAS ====================
// GET - Listar todas as entradas
app.get("/api/entradas", (req, res) => {
  const query = "SELECT * FROM entradas";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar entradas:", err);
      return res.status(500).json({ error: "Erro ao buscar entradas" });
    }
    res.json(results);
  });
});

// GET - Buscar uma entrada específica por EAN
app.get("/api/entradas/:ean", (req, res) => {
  const ean = req.params.ean;
  db.query("SELECT ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida FROM entradas WHERE ean = ?", [ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar entrada");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Entrada não encontrada" });
    }
    res.json(results[0]);
  });
});

// POST - Criar uma nova entrada
app.post("/api/entradas", (req, res) => {
  const { ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_entrada } = req.body;

  console.log("ean:", ean);
  console.log("produto:", produto);
  console.log("quantidade:", quantidade);
  console.log("fornecedor:", fornecedor);
  console.log("nota_fiscal:", nota_fiscal);
  console.log("valor_unitario:", valor_unitario);
  console.log("responsavel:", responsavel);
  console.log("data_entrada:", data_entrada);

  // Validação básica
  if (!ean || !produto || !quantidade || !fornecedor || !nota_fiscal || !valor_unitario || !responsavel || !data_entrada) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "INSERT INTO entradas (ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_entrada) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_entrada], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao cadastrar entrada");
    }
    res.status(201).json({
      id: results.insertId,
      message: "Entrada cadastrada com sucesso",
    });
  });
});

// PUT - Atualizar uma entrada existente
app.put("/api/entradas/:ean", (req, res) => {
  const ean = req.params.ean;
  const { produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_entrada } = req.body;

  // Validação básica
  if (!produto || !quantidade || !fornecedor || !nota_fiscal || !valor_unitario || !responsavel || !data_entrada) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "UPDATE entradas SET produto = ?, quantidade = ?, fornecedor = ?, nota_fiscal = ?, valor_unitario = ?, responsavel = ?, data_entrada = ? WHERE ean = ?";
  db.query(query, [produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_entrada, ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao atualizar entrada");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Entrada não encontrada" });
    }
    res.json({
      message: "Entrada atualizada com sucesso",
    });
  });
});

// DELETE - Remover uma entrada
app.delete("/api/entradas/:ean", (req, res) => {
  const ean = req.params.ean;
  db.query("DELETE FROM entradas WHERE ean = ?", [ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir entrada");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Entrada não encontrada" });
    }
    res.json({
      message: "Entrada excluída com sucesso",
    });
  });
});

// ==================== SAÍDAS ====================
// GET - Listar todas as saídas
app.get("/api/saidas", (req, res) => {
  db.query("SELECT ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida FROM saidas", (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar saídas");
    }
    res.json(results);
  });
});

// GET - Buscar uma saída específica por EAN
app.get("/api/saidas/:ean", (req, res) => {
  const ean = req.params.ean;
  db.query("SELECT ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida FROM saidas WHERE ean = ?", [ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar saída");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Saída não encontrada" });
    }
    res.json(results[0]);
  });
});

// POST - Criar uma nova saída
app.post("/api/saidas", (req, res) => {
  const { ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida } = req.body;

  // Validação básica
  if (!ean || !produto || !quantidade || !fornecedor || !nota_fiscal || !valor_unitario || !responsavel || !data_saida) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "INSERT INTO saidas (ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [ean, produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao cadastrar saída");
    }
    res.status(201).json({
      id: results.insertId,
      message: "Saída cadastrada com sucesso",
    });
  });
});

// PUT - Atualizar uma saída existente
app.put("/api/saidas/:ean", (req, res) => {
  const ean = req.params.ean;
  const { produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida } = req.body;

  // Validação básica
  if (!produto || !quantidade || !fornecedor || !nota_fiscal || !valor_unitario || !responsavel || !data_saida) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "UPDATE saidas SET produto = ?, quantidade = ?, fornecedor = ?, nota_fiscal = ?, valor_unitario = ?, responsavel = ?, data_saida = ? WHERE ean = ?";
  db.query(query, [produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida, ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao atualizar saída");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Saída não encontrada" });
    }
    res.json({
      message: "Saída atualizada com sucesso",
    });
  });
});

// DELETE - Remover uma saída
app.delete("/api/saidas/:ean", (req, res) => {
  const ean = req.params.ean;
  db.query("DELETE FROM saidas WHERE ean = ?", [ean], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir saída");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Saída não encontrada" });
    }
    res.json({
      message: "Saída excluída com sucesso",
    });
  });
});

// PUT - Atualizar uma saída existente usando EAN e nota fiscal
app.put("/api/saidas/:ean/:notaFiscal", (req, res) => {
  const ean = req.params.ean;
  const notaFiscal = req.params.notaFiscal;
  const { produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida } = req.body;

  // Validação básica
  if (!produto || !quantidade || !fornecedor || !nota_fiscal || !valor_unitario || !responsavel || !data_saida) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const query = "UPDATE saidas SET produto = ?, quantidade = ?, fornecedor = ?, nota_fiscal = ?, valor_unitario = ?, responsavel = ?, data_saida = ? WHERE ean = ? AND nota_fiscal = ?";
  db.query(query, [produto, quantidade, fornecedor, nota_fiscal, valor_unitario, responsavel, data_saida, ean, notaFiscal], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao atualizar saída");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Saída não encontrada" });
    }
    res.json({
      message: "Saída atualizada com sucesso",
    });
  });
});

// DELETE - Remover uma saída usando EAN e nota fiscal
app.delete("/api/saidas/:ean/:notaFiscal", (req, res) => {
  const ean = req.params.ean;
  const notaFiscal = req.params.notaFiscal;
  db.query("DELETE FROM saidas WHERE ean = ? AND nota_fiscal = ?", [ean, notaFiscal], (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao excluir saída");
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Saída não encontrada" });
    }
    res.json({
      message: "Saída excluída com sucesso",
    });
  });
});

// GET - Relatório de entradas por período
app.get("/api/relatorios/entradas", (req, res) => {
  // Definir valores padrão para maio de 2025
  const dataInicioPadrao = "2025-05-01";
  const dataFimPadrao = "2025-05-31";

  // Usar os valores da query ou os valores padrão
  const dataInicio = req.query.dataInicio || dataInicioPadrao;
  const dataFim = req.query.dataFim || dataFimPadrao;

  console.log(`Buscando entradas de ${dataInicio} até ${dataFim}`);

  const query = `
    SELECT
      DATE(data_entrada) as data_entrada,
      SUM(quantidade) as quantidade_total
    FROM
      entradas
    WHERE
      data_entrada BETWEEN ? AND ?
    GROUP BY
      DATE(data_entrada)
    ORDER BY
      data_entrada
  `;

  db.query(query, [dataInicio, dataFim], (err, resultados) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar relatório de entradas");
    }
    console.log(`Encontradas ${resultados.length} entradas no período`);
    res.json(resultados);
  });
});

// GET - Relatório de saídas por período
app.get("/api/relatorios/saidas", (req, res) => {
  // Definir valores padrão para maio de 2025
  const dataInicioPadrao = "2025-05-01";
  const dataFimPadrao = "2025-05-31";

  // Usar os valores da query ou os valores padrão
  const dataInicio = req.query.dataInicio || dataInicioPadrao;
  const dataFim = req.query.dataFim || dataFimPadrao;

  console.log(`Buscando saídas de ${dataInicio} até ${dataFim}`);

  const query = `
    SELECT
      DATE(data_saida) as data_saida,
      SUM(quantidade) as quantidade_total
    FROM
      saidas
    WHERE
      data_saida BETWEEN ? AND ?
    GROUP BY
      DATE(data_saida)
    ORDER BY
      data_saida
  `;

  db.query(query, [dataInicio, dataFim], (err, resultados) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar relatório de saídas");
    }
    console.log(`Encontradas ${resultados.length} saídas no período`);
    res.json(resultados);
  });
});

// GET - Produtos com informações de estoque
app.get("/api/produtos/com-estoque", (req, res) => {
  const query = `
    SELECT
      p.id_produto,
      p.ean,
      p.produto,
      p.categoria,
      p.un,
      p.fornecedor,
      p.estoque_minimo,
      COALESCE(SUM(CASE WHEN m.tipo_movimentacao = 'entrada' THEN m.quantidade ELSE 0 END) -
      SUM(CASE WHEN m.tipo_movimentacao = 'saida' THEN m.quantidade ELSE 0 END), 0) AS estoque_atual
    FROM
      produtos p
    LEFT JOIN
      movimentacoes m ON p.id_produto = m.id_produto
    GROUP BY
      p.id_produto, p.ean, p.produto, p.categoria, p.un, p.fornecedor, p.estoque_minimo
  `;

  db.query(query, (err, results) => {
    if (err) {
      return handleError(res, err, "Erro ao buscar produtos com estoque");
    }
    res.json(results);
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
