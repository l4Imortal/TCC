-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY,
 username VARCHAR(50) UNIQUE NOT NULL,
 email VARCHAR(100) UNIQUE NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Criação da tabela de posts
CREATE TABLE IF NOT EXISTS posts (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id),
 title VARCHAR(200) NOT NULL,
 content TEXT,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Inserção de dados de exemplo
INSERT INTO users (username, email) VALUES
 ('usuario_teste', 'teste@exemplo.com'),
 ('admin', 'admin@exemplo.com');


 CREATE TABLE alunos (
    aluno_id VARCHAR(5) NOT NULL PRIMARY KEY,
    nome VARCHAR(40) NOT NULL,
    endereco VARCHAR(60),
    cidade VARCHAR(15),
    estado VARCHAR(15),
    cep VARCHAR(10),
    pais VARCHAR(15),
    telefone VARCHAR(24)
);

INSERT INTO alunos (aluno_id, nome, endereco, cidade, estado, cep, pais, telefone) VALUES
('A001', 'João Silva', 'Rua A', 'São Paulo', 'SP', '01000-000', 'Brasil', '11999999999'),
('A002', 'Maria Oliveira', 'Rua B', 'Rio de Janeiro', 'RJ', '21000-000', 'Brasil', '21999999999'),
('A003', 'Pedro Santos', 'Rua C', 'Salvador', 'BA', '40000-000', 'Brasil', '71999999999');