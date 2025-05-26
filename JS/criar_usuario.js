// Função para mostrar/ocultar senha
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const toggleBtn = field.parentElement.querySelector('.toggle-password');
  const icon = toggleBtn.querySelector('i');
  
  if (field.type === "password") {
    field.type = "text";
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    field.type = "password";
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Validação em tempo real da senha
document.addEventListener('DOMContentLoaded', function() {
  const confirmPasswordField = document.getElementById("confirmPassword");
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener("input", function() {
      const password = document.getElementById("password").value;
      const confirmPassword = this.value;
      const mismatchElement = document.getElementById("password-mismatch");
      
      if (password && confirmPassword && password !== confirmPassword) {
        mismatchElement.textContent = "As senhas não coincidem!";
        mismatchElement.style.display = "block";
      } else {
        mismatchElement.textContent = "";
        mismatchElement.style.display = "none";
      }
    });
  }
});

// Função para resetar o botão de submit
function resetSubmitButton() {
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  const submitSpinner = document.getElementById("submitSpinner");
  
  if (submitBtn) submitBtn.disabled = false;
  if (submitText) submitText.innerHTML = '<i class="fas fa-save"></i> Criar Usuário';
  if (submitSpinner) submitSpinner.style.display = "none";
}

// Função principal para salvar usuário
async function salvarUsuario(event) {
  event.preventDefault();
  
  // Obter elementos
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  const submitSpinner = document.getElementById("submitSpinner");
  
  // Mostrar spinner e desabilitar botão
  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
  if (submitSpinner) submitSpinner.style.display = "inline-block";
  
  // Validações
  if (nome.length < 3) {
    alert("O nome deve ter pelo menos 3 caracteres!");
    resetSubmitButton();
    return false;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Por favor, insira um email válido!");
    resetSubmitButton();
    return false;
  }
  
  if (!/^\S{4,}$/.test(username)) {
    alert("O nome de usuário deve ter pelo menos 4 caracteres e não pode conter espaços!");
    resetSubmitButton();
    return false;
  }
  
  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    resetSubmitButton();
    return false;
  }
  
  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    resetSubmitButton();
    return false;
  }
  
  try {
    console.log('Enviando dados:', { nome, email, username, password });
    
    const response = await fetch("http://localhost:3000/api/usuarios", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        username,
        password,
      }),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Erro da API:', error);
      throw new Error(error.error || error.message || "Erro ao criar usuário");
    }
    
    const result = await response.json();
    console.log('Usuário criado com sucesso:', result);
    
    // Exibir popup de confirmação
    const popup = document.getElementById("confirmCadastroPopup");
    if (popup) {
      popup.style.display = "flex";
      
      const okBtn = document.getElementById("okConfirmBtn");
      if (okBtn) {
        okBtn.onclick = function() {
          window.location.href = "gerenciar_usuarios.html";
        };
      }
    } else {
      // Fallback se o popup não existir
      alert("Usuário criado com sucesso!");
      window.location.href = "gerenciar_usuarios.html";
    }
    
  } catch (error) {
    console.error("Erro completo:", error);
    alert("Erro ao criar usuário: " + error.message);
    resetSubmitButton();
    return false;
  }
}

// Fechar popup ao clicar fora dele
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById("confirmCadastroPopup");
  if (popup) {
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        popup.style.display = "none";
      }
    });
  }
});
