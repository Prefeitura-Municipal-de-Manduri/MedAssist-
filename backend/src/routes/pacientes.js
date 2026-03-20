import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET - Listar todos com busca opcional
router.get('/', async (req, res) => {
  const { busca } = req.query;
  let query = 'SELECT * FROM pacientes ORDER BY nome';
  let values = [];

  if (busca) {
    query = 'SELECT * FROM pacientes WHERE nome ILIKE $1 ORDER BY nome';
    values = [`%${busca}%`];
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
});

// GET por ID - Detalhes do paciente
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar detalhes" });
  }
});

// POST - Registrar Consulta Social (6 meses)
router.post('/:id/registrar-consulta-social', async (req, res) => {
  const { id } = req.params;
  try {
    const hoje = new Date();
    const proxima = new Date();
    proxima.setMonth(hoje.getMonth() + 6);

    const query = `
      UPDATE pacientes 
      SET ultima_consulta_social = $1, 
          proxima_consulta_social = $2 
      WHERE id = $3 
      RETURNING *`;
    
    const result = await pool.query(query, [hoje, proxima, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar consulta social" });
  }
});

// POST - Criar novo paciente
router.post('/', async (req, res) => {
  const { nome, contato, data_nascimento } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (nome, contato, data_nascimento) VALUES ($1,$2,$3) RETURNING *',
      [nome, contato, data_nascimento]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar paciente" });
  }
});

// PUT - Editar paciente
router.put('/:id', async (req, res) => {
  const { nome, contato, data_nascimento } = req.body;
  try {
    await pool.query(
      'UPDATE pacientes SET nome=$1, contato=$2, data_nascimento=$3 WHERE id=$4',
      [nome, contato, data_nascimento, req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pacientes WHERE id=$1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar paciente" });
  }
});

export default router;