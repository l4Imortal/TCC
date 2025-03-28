const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'escola'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados');
});

// Criar uma nova associação entre atividade e aluno
app.post('/atividade-aluno', (req, res) => {
    const { id_atividade, id_aluno } = req.body;
    const sql = 'INSERT INTO Atividade_Aluno (id_atividade, id_aluno) VALUES (?, ?)';
    db.query(sql, [id_atividade, id_aluno], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id_atividade, id_aluno });
    });
});

// Obter todas as associações de atividades e alunos
app.get('/atividade-aluno', (req, res) => {
    const sql = 'SELECT * FROM Atividade_Aluno';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter a associação de atividade e aluno por IDs
app.get('/atividade-aluno/:id_atividade/:id_aluno', (req, res) => {
    const { id_atividade, id_aluno } = req.params;
    const sql = 'SELECT * FROM Atividade_Aluno WHERE id_atividade = ? AND id_aluno = ?';
    db.query(sql, [id_atividade, id_aluno], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Associação de atividade e aluno não encontrada' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar a associação de atividade e aluno
app.put('/atividade-aluno/:id_atividade/:id_aluno', (req, res) => {
    const { id_atividade, id_aluno } = req.params;
    const sql = 'UPDATE Atividade_Aluno SET id_atividade = ?, id_aluno = ? WHERE id_atividade = ? AND id_aluno = ?';
    db.query(sql, [id_atividade, id_aluno, id_atividade, id_aluno], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Associação atualizada com sucesso' });
    });
});

// Deletar a associação de atividade e aluno
app.delete('/atividade-aluno/:id_atividade/:id_aluno', (req, res) => {
    const { id_atividade, id_aluno } = req.params;
    const sql = 'DELETE FROM Atividade_Aluno WHERE id_atividade = ? AND id_aluno = ?';
    db.query(sql, [id_atividade, id_aluno], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Associação deletada com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar uma nova atividade
app.post('/atividades', (req, res) => {
    const { descricao, data_realizacao } = req.body;
    const sql = 'INSERT INTO Atividade (descricao, data_realizacao) VALUES (?, ?)';
    db.query(sql, [descricao, data_realizacao], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, descricao, data_realizacao });
    });
});

// Obter todas as atividades
app.get('/atividades', (req, res) => {
    const sql = 'SELECT * FROM Atividade';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter uma atividade por ID
app.get('/atividades/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Atividade WHERE id_atividade = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Atividade não encontrada' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar uma atividade
app.put('/atividades/:id', (req, res) => {
    const { id } = req.params;
    const { descricao, data_realizacao } = req.body;
    const sql = 'UPDATE Atividade SET descricao = ?, data_realizacao = ? WHERE id_atividade = ?';
    db.query(sql, [descricao, data_realizacao, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Atividade atualizada com sucesso' });
    });
});

// Deletar uma atividade
app.delete('/atividades/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Atividade WHERE id_atividade = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Atividade deletada com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar um novo pagamento
app.post('/pagamentos', (req, res) => {
    const { id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status } = req.body;
    const sql = 'INSERT INTO Pagamento (id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status });
    });
});

// Obter todos os pagamentos
app.get('/pagamentos', (req, res) => {
    const sql = 'SELECT * FROM Pagamento';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter um pagamento por ID
app.get('/pagamentos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Pagamento WHERE id_pagamento = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Pagamento não encontrado' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar um pagamento
app.put('/pagamentos/:id', (req, res) => {
    const { id } = req.params;
    const { id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status } = req.body;
    const sql = 'UPDATE Pagamento SET id_aluno = ?, data_pagamento = ?, valor_pago = ?, forma_pagamento = ?, referencia = ?, status = ? WHERE id_pagamento = ?';
    db.query(sql, [id_aluno, data_pagamento, valor_pago, forma_pagamento, referencia, status, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Pagamento atualizado com sucesso' });
    });
});

// Deletar um pagamento
app.delete('/pagamentos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Pagamento WHERE id_pagamento = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Pagamento deletado com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar uma nova presença
app.post('/presencas', (req, res) => {
    const { id_aluno, data_presenca, presente } = req.body;
    const sql = 'INSERT INTO Presenca (id_aluno, data_presenca, presente) VALUES (?, ?, ?)';
    db.query(sql, [id_aluno, data_presenca, presente], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, id_aluno, data_presenca, presente });
    });
});

// Obter todas as presenças
app.get('/presencas', (req, res) => {
    const sql = 'SELECT * FROM Presenca';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter uma presença por ID
app.get('/presencas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Presenca WHERE id_presenca = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Presença não encontrada' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar uma presença
app.put('/presencas/:id', (req, res) => {
    const { id } = req.params;
    const { id_aluno, data_presenca, presente } = req.body;
    const sql = 'UPDATE Presenca SET id_aluno = ?, data_presenca = ?, presente = ? WHERE id_presenca = ?';
    db.query(sql, [id_aluno, data_presenca, presente, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Presença atualizada com sucesso' });
    });
});

// Deletar uma presença
app.delete('/presencas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Presenca WHERE id_presenca = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Presença deletada com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar um novo professor
app.post('/professores', (req, res) => {
    const { nome_completo, email, telefone } = req.body;
    const sql = 'INSERT INTO Professor (nome_completo, email, telefone) VALUES (?, ?, ?)';
    db.query(sql, [nome_completo, email, telefone], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, nome_completo, email, telefone });
    });
});

// Obter todos os professores
app.get('/professores', (req, res) => {
    const sql = 'SELECT * FROM Professor';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter um professor por ID
app.get('/professores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Professor WHERE id_professor = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Professor não encontrado' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar um professor
app.put('/professores/:id', (req, res) => {
    const { id } = req.params;
    const { nome_completo, email, telefone } = req.body;
    const sql = 'UPDATE Professor SET nome_completo = ?, email = ?, telefone = ? WHERE id_professor = ?';
    db.query(sql, [nome_completo, email, telefone, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Professor atualizado com sucesso' });
    });
});

// Deletar um professor
app.delete('/professores/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Professor WHERE id_professor = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Professor deletado com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar uma nova turma
app.post('/turmas', (req, res) => {
    const { nome_turma, id_professor, horario } = req.body;
    const sql = 'INSERT INTO Turma (nome_turma, id_professor, horario) VALUES (?, ?, ?)';
    db.query(sql, [nome_turma, id_professor, horario], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, nome_turma, id_professor, horario });
    });
});

// Obter todas as turmas
app.get('/turmas', (req, res) => {
    const sql = 'SELECT * FROM Turma';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter uma turma por ID
app.get('/turmas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Turma WHERE id_turma = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Turma não encontrada' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar uma turma
app.put('/turmas/:id', (req, res) => {
    const { id } = req.params;
    const { nome_turma, id_professor, horario } = req.body;
    const sql = 'UPDATE Turma SET nome_turma = ?, id_professor = ?, horario = ? WHERE id_turma = ?';
    db.query(sql, [nome_turma, id_professor, horario, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Turma atualizada com sucesso' });
    });
});

// Deletar uma turma
app.delete('/turmas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Turma WHERE id_turma = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Turma deletada com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Criar um novo usuário
app.post('/usuarios', (req, res) => {
    const { login, senha, nivel_acesso, id_professor } = req.body;
    const sql = 'INSERT INTO Usuario (login, senha, nivel_acesso, id_professor) VALUES (?, ?, ?, ?)';
    db.query(sql, [login, senha, nivel_acesso, id_professor], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(201).send({ id: result.insertId, login, senha, nivel_acesso, id_professor });
    });
});

// Obter todos os usuários
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM Usuario';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send(results);
    });
});

// Obter um usuário por ID
app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'Usuário não encontrado' });
            return;
        }
        res.send(results[0]);
    });
});

// Atualizar um usuário
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { login, senha, nivel_acesso, id_professor } = req.body;
    const sql = 'UPDATE Usuario SET login = ?, senha = ?, nivel_acesso = ?, id_professor = ? WHERE id_usuario = ?';
    db.query(sql, [login, senha, nivel_acesso, id_professor, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Usuário atualizado com sucesso' });
    });
});

// Deletar um usuário
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Usuario WHERE id_usuario = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send({ message: 'Usuário deletado com sucesso' });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});