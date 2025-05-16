document.addEventListener("DOMContentLoaded", function () {
  const tabelaBody = document.querySelector("table tbody");

  // Buscar usuários do backend
  fetch("http://localhost:3000/api/usuarios")
    .then((response) => response.json())
    .then((usuarios) => {
      usuarios.forEach((usuario, index) => {
        const row = tabelaBody.insertRow(); // <-- Cria a linha corretamente
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
    })
    .catch(() => {
      tabelaBody.innerHTML =
        '<tr><td colspan="4">Erro ao carregar usuários</td></tr>';
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
      document.getElementById("editPassword").value =
        usuarios[index].password || "";
      document.getElementById("editConfirmPassword").value =
        usuarios[index].password || "";

      // Exibir o popup
      document.getElementById("editPopup").style.display = "flex";

      // Salvar alterações
      document.getElementById("saveEditBtn").onclick = function () {
        const updatedNome = document.getElementById("editNome").value;
        const updatedEmail = document.getElementById("editEmail").value;
        const updatedUsername = document.getElementById("editUsername").value;
        const updatedPassword = document.getElementById("editPassword").value;
        const confirmPassword = document.getElementById(
          "editConfirmPassword"
        ).value;

        if (updatedPassword !== confirmPassword) {
          alert("As senhas não coincidem!");
          return;
        }

        // Envie para o backend
        fetch(
          `http://localhost:3000/api/usuarios/${usuarios[index].id_usuario}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: updatedNome,
              email: updatedEmail,
              username: updatedUsername,
              password: updatedPassword,
            }),
          }
        )
          .then((res) => res.json())
          .then((result) => {
            if (result.error) {
              alert(result.error);
            } else {
              // Atualize a tabela na tela
              row.children[1].textContent = updatedUsername;
              row.children[2].textContent = updatedEmail;
              document.getElementById("editPopup").style.display = "none";
            }
          });
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
        fetch(
          `http://localhost:3000/api/usuarios/${usuarios[index].id_usuario}`,
          {
            method: "DELETE",
          }
        )
          .then((res) => res.json())
          .then((result) => {
            if (result.error) {
              alert(result.error);
            } else {
              row.remove();
              document.getElementById("confirmPopup").style.display = "none";
            }
          });
      };
    }
  });

  // Botão cancelar fecha o popup
  document.getElementById("cancelBtn").onclick = function () {
    document.getElementById("confirmPopup").style.display = "none";
  };
});
