document.getElementById("loginButton").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Verifica se o usuário e senha são "admin"
  if (username === "admin" && password === "admin") {
    localStorage.setItem("loggedIn", "true"); // Salva o estado de login
    window.location.href = "index.html"; // Redireciona para a página inicial
  } else {
    document.getElementById("errorMessage").textContent =
      "Usuário ou senha inválidos!";
  }
});
