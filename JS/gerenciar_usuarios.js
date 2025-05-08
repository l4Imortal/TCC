document.addEventListener("DOMContentLoaded", function () {
  // Seleciona todos os botões de excluir
  document.querySelectorAll(".delete-button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      // Pegue o nome do usuário da mesma linha da tabela
      const row = btn.closest("tr");
      const nomeUsuario = row ? row.children[1].textContent : "";
      document.getElementById("usuarioNome").textContent = nomeUsuario;
      document.getElementById("confirmPopup").style.display = "flex";
      // Salva a linha para exclusão posterior
      document.getElementById("confirmDeleteBtn").onclick = function () {
        // Aqui você pode adicionar a lógica para excluir o usuário
        row.remove();
        document.getElementById("confirmPopup").style.display = "none";
      };
    });
  });

  // Botão cancelar fecha o popup
  document.getElementById("cancelBtn").onclick = function () {
    document.getElementById("confirmPopup").style.display = "none";
  };
});
