document.addEventListener("DOMContentLoaded", function () {
  const tabelaBody = document.querySelector("table tbody");
  let usuarios = []; // Variável global para armazenar os usuários

  // Função para atualizar a contagem de usuários
  function atualizarContagemUsuarios() {
    const contadorElement = document.getElementById("contador-usuarios");
    if (contadorElement) {
      contadorElement.textContent = usuarios.length;
    }
  }

  // Função para carregar e exibir os usuários
  function carregarUsuarios() {
    // Limpar tabela antes de carregar novos dados
    tabelaBody.innerHTML =
      '<tr><td colspan="4">Carregando usuários...</td></tr>';

    // Buscar usuários do backend
    fetch("http://localhost:3000/api/usuarios")
      .then((response) => response.json())
      .then((data) => {
        usuarios = data; // Armazena os usuários na variável global
        tabelaBody.innerHTML = ""; // Limpa a mensagem de carregamento

        if (usuarios.length === 0) {
          tabelaBody.innerHTML =
            '<tr><td colspan="4">Nenhum usuário cadastrado</td></tr>';
          return;
        }

        usuarios.forEach((usuario, index) => {
          const row = tabelaBody.insertRow();
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${usuario.login}</td>
            <td>${usuario.email}</td>
            <td>
              <button class="edit-button" data-id="${
                usuario.id_usuario
              }">Editar</button>
              <button class="btn-excluir" data-id="${
                usuario.id_usuario
              }">Excluir</button>
            </td>
          `;
        });

        // Atualiza a contagem de usuários
        atualizarContagemUsuarios();
      })
      .catch(() => {
        tabelaBody.innerHTML =
          '<tr><td colspan="4">Erro ao carregar usuários</td></tr>';
      });
  }

  // Carrega os usuários quando a página é carregada
  carregarUsuarios();

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

  // Event listeners para os ícones de mostrar/ocultar senha
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const inputId = this.closest(".input-group").querySelector("input").id;
      togglePasswordVisibility(inputId);
    });
  });

  // Abrir popup de edição
  tabelaBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-button")) {
      const userId = e.target.getAttribute("data-id");
      const usuario = usuarios.find((u) => u.id_usuario == userId);

      if (!usuario) return;

      // Preencher o popup com os dados do usuário
      document.getElementById("editNome").value = usuario.nome || "";
      document.getElementById("editEmail").value = usuario.email;
      document.getElementById("editUsername").value = usuario.login;
      document.getElementById("editPassword").value = "";
      document.getElementById("editConfirmPassword").value = "";

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

        if (updatedPassword && updatedPassword !== confirmPassword) {
          alert("As senhas não coincidem!");
          return;
        }

        // Preparar os dados para atualização
        const updateData = {
          nome: updatedNome,
          email: updatedEmail,
          username: updatedUsername,
        };

        // Incluir a senha apenas se foi alterada
        if (updatedPassword) {
          updateData.password = updatedPassword;
        }

        // Envie para o backend
        fetch(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.error) {
              alert(result.error);
            } else {
              // Atualiza a lista de usuários e a tabela
              carregarUsuarios();
              document.getElementById("editPopup").style.display = "none";
            }
          })
          .catch((error) => {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao atualizar usuário");
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
      const userId = e.target.getAttribute("data-id");
      const usuario = usuarios.find((u) => u.id_usuario == userId);

      if (!usuario) return;

      document.getElementById("usuarioNome").textContent = usuario.login;
      document.getElementById("confirmPopup").style.display = "flex";

      // Configurar o botão de confirmação
      const confirmBtn = document.getElementById("confirmDeleteBtn");
      confirmBtn.disabled = false;

      // Remover event listeners anteriores para evitar múltiplas chamadas
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      const newConfirmBtn = document.getElementById("confirmDeleteBtn");

      newConfirmBtn.onclick = function () {
        fetch(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`, {
          method: "DELETE",
        })
          .then((res) => {
            if (!res.ok) throw new Error("Erro ao excluir usuário");
            return res.json();
          })
          .then(() => {
            // Recarrega a lista de usuários
            carregarUsuarios();
            document.getElementById("confirmPopup").style.display = "none";
          })
          .catch((error) => {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro ao excluir usuário");
          });
      };
    }
  });

  // Botão cancelar fecha o popup
  document.getElementById("cancelBtn").onclick = function () {
    document.getElementById("confirmPopup").style.display = "none";
  };
});
