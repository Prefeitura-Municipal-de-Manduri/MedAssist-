const API_URL = "http://localhost:3001";

export async function getPacientes() {
  const res = await fetch(`${API_URL}/pacientes`);
  return res.json();
}

export async function getMedicamentos() {
  const res = await fetch(`${API_URL}/medicamentos`);
  return res.json();
}