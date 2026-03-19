import { useEffect, useState } from "react";
import { getPacientes } from "../services/api";

interface Paciente {
  id: string;
  nome: string;
  contato: string;
  data_nascimento: string;
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getPacientes();
      setPacientes(data);
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>Pacientes</h1>

      <ul>
        {pacientes.map((p) => (
          <li key={p.id}>
            <strong>{p.nome}</strong> - {p.contato}
          </li>
        ))}
      </ul>
    </div>
  );
}