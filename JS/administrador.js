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
    `;
  });
});