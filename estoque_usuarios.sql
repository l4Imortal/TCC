-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_usuario)
);

-- Inserir usuário padrão admin
INSERT INTO usuarios (username, senha) VALUES ('admin', 'admin')
ON DUPLICATE KEY UPDATE username = username;