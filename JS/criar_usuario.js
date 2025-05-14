function salvarUsuario() {
  // Obter os valores do formulário
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validar senhas
  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return false;
  }

  // Obter os usuários existentes no Local Storage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Adicionar o novo usuário
  usuarios.push({ nome, email, username, password });

  // Salvar no Local Storage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // Redirecionar para a página de gerenciamento de usuários
  window.location.href = "gerenciar_usuarios.html";

  return false; // Impede o envio padrão do formulário
}