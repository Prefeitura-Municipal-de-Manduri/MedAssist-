
<p align="center">
  <img src="/src/imgs/logo.png" alt="logo" width="500" style="max-width:100%;height:auto;" />
</p>

Sistema de gerenciamento de pacientes e medicamentos voltado para controle de assistência farmacêutica e social.

---

## 📌 Descrição

O **MedAssist+** é uma aplicação full-stack que permite:

- Cadastro e gerenciamento de pacientes
- Controle de medicamentos por paciente
- Registro de retiradas de medicamentos
- Consulta de histórico
- Integração entre frontend e backend via API REST
- Armazenamento de dados em PostgreSQL

---

## 🚀 Tecnologias utilizadas

### 🔹 Backend
- Node.js
- Express
- PostgreSQL
- pg (node-postgres)
- dotenv
- cors

### 🔹 Frontend
- React
- TypeScript (TSX)
- Vite
- React Router DOM
- React Query (TanStack Query)
- ShadCN UI
- Axios

---

## 📁 Estrutura do projeto

```bash
backend/
 ├── src/
 │   ├── db.js
 │   ├── server.js
 │   ├── routes/
 │   │    ├── pacientes.js
 │   │    └── medicamentos.js
 ├── .env
 └── package.json
```

## ⚙️ Instalação e execução

### 🔧 Backend

cd backend
npm install

Configure o arquivo .env:

DB_HOST=localhost
DB_PORT=5431
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=medassist
PORT=3001

Inicie o servidor:

npm run dev

Backend rodará em:

http://localhost:3001

---

### 💻 Frontend

cd frontend
npm install
npm run dev

Frontend rodará em:

http://localhost:8080

---

## 🔗 Endpoints da API

### Pacientes

- GET /pacientes → Lista todos os pacientes
- GET /pacientes/:id → Detalhes de um paciente

### Medicamentos

- GET /medicamentos → Lista todos os medicamentos
- GET /medicamentos/:id → Detalhes de um medicamento

---

## 🧠 Funcionalidades

- Listagem de pacientes
- Visualização de medicamentos por paciente
- Relacionamento entre pacientes e medicamentos
- Registro de datas de retirada
- Controle de validade de medicamentos

---

## 🔮 Próximas melhorias

- Autenticação de usuários (login)
- Cadastro e edição via interface
- Exclusão de registros
- Filtros e busca
- Dashboard com métricas
- Controle de permissões (admin/usuário)

---

## 👨‍💻 Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/MatheusMarcelo1">
        <img src="https://github.com/MatheusMarcelo1.png" width="100" /><br>
        <sub><b>Matheus Marcelo</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/JoaoDiogo89">
        <img src="https://github.com/JoaoDiogo89.png" width="100" /><br>
        <sub><b>João Diogo</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/BrunoAkT">
        <img src="https://github.com/BrunoAkT.png" width="100" /><br>
        <sub><b>Bruno Aoki Tenorio</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 Licença

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
