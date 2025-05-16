document.getElementById("loginButton").addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok && result.user) {
      // Login bem-sucedido
      window.location.href = "index.html";
    } else {
      errorMessage.textContent = result.error || "Usuário ou senha inválidos!";
    }
  } catch (error) {
    errorMessage.textContent = "Erro ao conectar ao servidor!";
  }
});
