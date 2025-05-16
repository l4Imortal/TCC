document.addEventListener("DOMContentLoaded", function () {
  const tabelaBody = document.querySelector("table tbody");

  // Buscar usuários do backend
  fetch("http://localhost:3000/api/usuarios")
    .then((response) => response.json())
    .then((usuarios) => {
      usuarios.forEach((usuario, index) => {
        const row = tabelaBody.insertRow();
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${usuario.username}</td>
          <td>${usuario.email}</td>
        `;
      });
    })
    .catch(() => {
      tabelaBody.innerHTML =
        '<tr><td colspan="3">Erro ao carregar usuários</td></tr>';
    });
});
