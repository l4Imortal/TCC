document.getElementById("loginButton").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      document.getElementById("errorMessage").textContent = errorData.error || 'Erro ao fazer login';
      return;
    }

    const data = await response.json();
    localStorage.setItem("loggedIn", "true"); // Salva o estado de login
    localStorage.setItem("user", JSON.stringify(data.user)); // Salva os dados do usuário
    window.location.href = "index.html"; // Redireciona para a página inicial
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    document.getElementById("errorMessage").textContent = 'Erro no servidor. Tente novamente mais tarde.';
  }
});
