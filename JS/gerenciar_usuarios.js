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
        tabelaBody.innerHTML = '<tr><td colspan="4">Carregando usuários...</td></tr>';

        // Buscar usuários do backend
        fetch("http://localhost:3000/api/usuarios")
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar usuários');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Dados recebidos do backend:", data);
                usuarios = data;
                renderizarUsuarios();
                atualizarContagemUsuarios();
            })
            .catch((error) => {
                console.error("Erro:", error);
                tabelaBody.innerHTML = '<tr><td colspan="4">Erro ao carregar usuários</td></tr>';
            });
    }

    // Função para renderizar usuários na tabela
    function renderizarUsuarios() {
        tabelaBody.innerHTML = "";
        if (usuarios.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="4">Nenhum usuário cadastrado</td></tr>';
            return;
        }

        usuarios.forEach((usuario, index) => {
            const row = tabelaBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${usuario.login || usuario.username || ''}</td>
                <td>${usuario.email || ''}</td>
                <td>
                    <button class="edit-button" data-id="${usuario.id_usuario || usuario.id}">Editar</button>
                    <button class="btn-excluir" data-id="${usuario.id_usuario || usuario.id}">Excluir</button>
                </td>
            `;
        });
    }

    // Função para alternar visibilidade da senha
    function togglePasswordVisibility(button) {
        const passwordContainer = button.closest('.password-container');
        const field = passwordContainer.querySelector('input');
        const icon = button.querySelector('i');

        if (field.type === "password") {
            field.type = "text";
            if (icon) {
                icon.classList.replace("fa-eye", "fa-eye-slash");
            }
            // Se for o campo de senha atual, mostrar o valor real temporariamente
            if (field.id === 'currentPasswordDisplay') {
                const realPassword = field.dataset.realPassword;
                if (realPassword) {
                    field.value = realPassword;
                }
            }
        } else {
            field.type = "password";
            if (icon) {
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
            // Se for o campo de senha atual, voltar ao placeholder
            if (field.id === 'currentPasswordDisplay') {
                field.value = "••••••••";
            }
        }
    }

    // Delegar eventos de clique para os botões de visualização
    document.addEventListener("click", function(e) {
        if (e.target.closest(".toggle-password")) {
            const button = e.target.closest(".toggle-password");
            togglePasswordVisibility(button);
        }
    });

    // Abrir popup de edição
    tabelaBody.addEventListener("click", function(e) {
        if (e.target.classList.contains("edit-button")) {
            abrirPopupEdicao(e.target.dataset.id);
        } else if (e.target.classList.contains("btn-excluir")) {
            abrirPopupExclusao(e.target.dataset.id);
        }
    });

    // Função para abrir popup de edição
    function abrirPopupEdicao(userId) {
        const usuario = usuarios.find((u) => (u.id_usuario || u.id) == userId);
        if (!usuario) {
            console.error("Usuário não encontrado:", userId);
            return;
        }

        console.log("Editando usuário:", usuario);

        // Preencher o popup com os dados do usuário
        document.getElementById("editEmail").value = usuario.email || '';
        document.getElementById("editUsername").value = usuario.login || usuario.username || '';

        // Configurar campo de senha atual
        const currentPassField = document.getElementById("currentPasswordDisplay");
        currentPassField.value = "••••••••";
        currentPassField.dataset.realPassword = usuario.password || '';

        // Limpar campos de nova senha
        document.getElementById("editPassword").value = "";
        document.getElementById("editConfirmPassword").value = "";

        // Armazenar o ID do usuário no formulário
        document.getElementById("editForm").dataset.userId = userId;

        // Exibir o popup
        document.getElementById("editPopup").style.display = "flex";
    }

    // Função para salvar edição do usuário
    function salvarEdicaoUsuario() {
        const userId = document.getElementById("editForm").dataset.userId;
        const updatedEmail = document.getElementById("editEmail").value.trim();
        const updatedUsername = document.getElementById("editUsername").value.trim();
        const updatedPassword = document.getElementById("editPassword").value;
        const confirmPassword = document.getElementById("editConfirmPassword").value;

        // Validações
        if (!updatedEmail || !updatedUsername) {
            alert("Email e nome de usuário são obrigatórios!");
            return;
        }

        if (updatedPassword && updatedPassword !== confirmPassword) {
            alert("As novas senhas não coincidem!");
            return;
        }

        if (updatedPassword && updatedPassword.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres!");
            return;
        }

        // Preparar dados para atualização
        const updateData = {
            email: updatedEmail,
            login: updatedUsername, // Usar 'login' se for esse o campo no backend
            username: updatedUsername // Incluir ambos para compatibilidade
        };

        // Incluir a senha apenas se foi alterada
        if (updatedPassword) {
            updateData.password = updatedPassword;
        }

        console.log("Enviando dados para atualização:", updateData);

        // Enviar para o backend
        fetch(`http://localhost:3000/api/usuarios/${userId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(updateData),
        })
        .then((response) => {
            console.log("Status da resposta:", response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    let errorMessage;
                    try {
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.message || errorData.error || `Erro HTTP ${response.status}`;
                    } catch {
                        errorMessage = text || `Erro HTTP ${response.status}`;
                    }
                    throw new Error(errorMessage);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log("Resposta do servidor:", data);
            alert("Usuário atualizado com sucesso!");
            carregarUsuarios();
            document.getElementById("editPopup").style.display = "none";
        })
        .catch((error) => {
            console.error("Erro ao atualizar usuário:", error);
            alert(`Erro ao atualizar usuário: ${error.message}`);
        });
    }

    // Função para abrir popup de exclusão
    function abrirPopupExclusao(userId) {
        const usuario = usuarios.find((u) => (u.id_usuario || u.id) == userId);
        if (!usuario) return;

        document.getElementById("usuarioNome").textContent = usuario.login || usuario.username || '';
        document.getElementById("confirmPopup").style.display = "flex";

        // Configurar o botão de confirmação
        const confirmBtn = document.getElementById("confirmDeleteBtn");
        confirmBtn.onclick = function() {
            excluirUsuario(userId);
        };
    }

    // Função para excluir usuário
    function excluirUsuario(userId) {
        fetch(`http://localhost:3000/api/usuarios/${userId}`, {
            method: "DELETE",
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao excluir usuário");
            }
            return response.json();
        })
        .then(() => {
            alert("Usuário excluído com sucesso!");
            carregarUsuarios();
            document.getElementById("confirmPopup").style.display = "none";
        })
        .catch((error) => {
            console.error("Erro ao excluir usuário:", error);
            alert(error.message || "Erro ao excluir usuário");
        });
    }

    // Event listeners para os botões do popup de edição
    document.getElementById("saveEditBtn").addEventListener("click", salvarEdicaoUsuario);
    
    document.getElementById("cancelEditBtn").addEventListener("click", function() {
        document.getElementById("editPopup").style.display = "none";
    });

    // Botão cancelar fecha o popup de exclusão
    document.getElementById("cancelBtn").addEventListener("click", function() {
        document.getElementById("confirmPopup").style.display = "none";
    });

    // Carregar usuários ao iniciar
    carregarUsuarios();
});
