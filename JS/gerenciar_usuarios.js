document.addEventListener("DOMContentLoaded", function () {
  const tabelaBody = document.querySelector("table tbody");

  // Carregar usuários do Local Storage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Preencher a tabela com os usuários
  usuarios.forEach((usuario, index) => {
    const row = tabelaBody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${usuario.username}</td>
      <td>${usuario.email}</td>
      <td>
        <button class="edit-button">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </td>
    `;
  });

  // Função para alternar a visibilidade da senha
  function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }

  // Abrir popup de edição
  tabelaBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-button")) {
      const row = e.target.closest("tr");
      const index = Array.from(row.parentNode.children).indexOf(row);

      // Preencher o popup com os dados do usuário
      document.getElementById("editNome").value = usuarios[index].nome || "";
      document.getElementById("editEmail").value = usuarios[index].email;
      document.getElementById("editUsername").value = usuarios[index].username;
      document.getElementById("editPassword").value = usuarios[index].password || "";
      document.getElementById("editConfirmPassword").value = usuarios[index].password || "";

      // Exibir o popup
      document.getElementById("editPopup").style.display = "flex";

      // Salvar alterações
      document.getElementById("saveEditBtn").onclick = function () {
        const updatedNome = document.getElementById("editNome").value;
        const updatedEmail = document.getElementById("editEmail").value;
        const updatedUsername = document.getElementById("editUsername").value;
        const updatedPassword = document.getElementById("editPassword").value;
        const confirmPassword = document.getElementById("editConfirmPassword").value;

        // Validar senhas
        if (updatedPassword !== confirmPassword) {
          alert("As senhas não coincidem!");
          return;
        }

        // Atualizar os dados no array e no Local Storage
        usuarios[index].nome = updatedNome;
        usuarios[index].email = updatedEmail;
        usuarios[index].username = updatedUsername;
        usuarios[index].password = updatedPassword;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Atualizar a tabela
        row.children[1].textContent = updatedUsername;
        row.children[2].textContent = updatedEmail;

        // Fechar o popup
        document.getElementById("editPopup").style.display = "none";
      };

      // Cancelar edição
      document.getElementById("cancelEditBtn").onclick = function () {
        document.getElementById("editPopup").style.display = "none";
      };
    }
  });

  // Delegação de eventos para botões de exclusão
  tabelaBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-excluir")) {
      e.preventDefault();
      const row = e.target.closest("tr");
      const nomeUsuario = row ? row.children[1].textContent : "";
      document.getElementById("usuarioNome").textContent = nomeUsuario;
      document.getElementById("confirmPopup").style.display = "flex";

      // Excluir usuário ao confirmar
      document.getElementById("confirmDeleteBtn").disabled = false; // Certifique-se de que o botão está habilitado
      document.getElementById("confirmDeleteBtn").onclick = function () {
        const index = Array.from(row.parentNode.children).indexOf(row);
        usuarios.splice(index, 1); // Remove do array
        localStorage.setItem("usuarios", JSON.stringify(usuarios)); // Atualiza o Local Storage
        row.remove();
        document.getElementById("confirmPopup").style.display = "none";
      };
    }
  });

  // Botão cancelar fecha o popup
  document.getElementById("cancelBtn").onclick = function () {
    document.getElementById("confirmPopup").style.display = "none";
  };
});
