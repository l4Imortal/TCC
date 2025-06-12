
# 🧾 StoQ – Sistema de Gerenciamento de Estoque

O **StoQ** é um sistema web desenvolvido para auxiliar na organização e controle de estoque de forma simples e eficiente. O projeto foi elaborado como Trabalho de Conclusão de Curso (TCC) e tem como foco a construção de uma aplicação leve, intuitiva e de fácil manutenção.

---

## 🚀 Funcionalidades

- Registro de entradas de produtos no estoque
- Dashboard com visão geral
- Administração de usuários do sistema
- Interface amigável com menu interativo
- Filtro de busca em tempo real nas tabelas

---

## 🛠️ Tecnologias Utilizadas

### 🔹 HTML5 (HyperText Markup Language)
Responsável por estruturar as páginas do sistema, definindo os elementos visuais como menus, botões e formulários.

### 🔹 CSS3 (Cascading Style Sheets)
Utilizado para a estilização dos elementos HTML. Define cores, fontes, layouts e responsividade da interface.

### 🔹 JavaScript (JS)
Adiciona interatividade ao sistema, como:
- Abertura e fechamento dos popups.
- Filtros de pesquisa
- Confirmação de ações como exclusão de registros

### 🔹 Node.js
Permite usar JavaScript no backend (lado do servidor), fora do navegador.
Você pode criar APIs, bancos de dados, autenticação, lógica de negócio etc.

### 🔹 Express.js
É um framework para Node.js que facilita a criação de servidores e APIs.
Deixa tudo mais rápido e organizado, com rotas, middlewares e respostas HTTP simples.

### 🔹 Estrutura Modular
Cada funcionalidade possui sua própria página HTML (`index.html`, `entradas.html`, `gerenciar_usuarios.html`), facilitando a organização do código.

---

## ⚙️ Explicação Técnica do Funcionamento

### 🧭 Navegação e Estrutura
As páginas são independentes e conectadas via links no menu. Isso permite maior organização e facilita a expansão do sistema.

### 🎛️ Interatividade com JavaScript

- **Menu :** alternância de classes para expandir/recolher.
- **Filtro de busca:** aplicação de filtro em tempo real sem recarregar a página.
- **Confirmação de ações:** uso de `confirm()` para validar ações sensíveis.

### 📄 Organização do Código
O projeto utiliza IDs e classes bem definidos, possibilitando manipulação precisa via CSS e JS.

### 💾 Armazenamento
Conectado diretamente no banco de dados MySQLS, utilizando o Node.js.

### 📈 Escalabilidade
A arquitetura modular e o uso de padrões claros permitem que novas funcionalidades sejam adicionadas com facilidade.

---

## 📂 Estrutura de Diretórios

```
TCC-main/
│
├── index.html
├── entradas.html
├── gerenciar_usuarios.html
├── README.md
└── (outros arquivos de estilo e imagem)
```

---

## 📌 Observações Finais

Este projeto foi desenvolvido com foco didático e pode servir como base para sistemas maiores com integração a banco de dados e autenticação de usuários.
