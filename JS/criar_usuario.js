async function salvarUsuario() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return false;
  }

  try {
    const response = await fetch("http://localhost:3000/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, username, password }),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Usuário criado com sucesso!");
      window.location.href = "gerenciar_usuarios.html";
    } else {
      alert(result.error || "Erro ao criar usuário");
    }
  } catch (error) {
    alert("Erro ao conectar ao servidor");
  }

  return false; // Impede o submit padrão do formulário
}
