async function salvarUsuario() {
  // Obter elementos
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validações
  if (nome.length < 3) {
    alert("O nome deve ter pelo menos 3 caracteres!");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Por favor, insira um email válido!");
    return false;
  }

  if (!/^\S{4,}$/.test(username)) {
    alert(
      "O nome de usuário deve ter pelo menos 4 caracteres e não pode conter espaços!"
    );
    return false;
  }

  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    return false;
  }

  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return false;
  }

  try {
    const response = await fetch("http://localhost:3000/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        username,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao criar usuário");
    }

    // Exibir popup de confirmação
    document.getElementById("confirmCadastroPopup").style.display = "flex";
    document.getElementById("okConfirmBtn").onclick = function () {
      window.location.href = "gerenciar_usuarios.html";
    };
  } catch (error) {
    alert(error.message);
    console.error("Erro:", error);
  }

  return false;
}

// Validação em tempo real da senha (opcional)
document
  .getElementById("confirmPassword")
  ?.addEventListener("input", function () {
    const password = document.getElementById("password").value;
    const confirmPassword = this.value;
    const mismatchElement =
      document.getElementById("password-mismatch") ||
      document.createElement("small");

    if (!mismatchElement.id) {
      mismatchElement.id = "password-mismatch";
      mismatchElement.style.color = "red";
      this.parentNode.appendChild(mismatchElement);
    }

    mismatchElement.textContent =
      password && confirmPassword && password !== confirmPassword
        ? "As senhas não coincidem!"
        : "";
  });
