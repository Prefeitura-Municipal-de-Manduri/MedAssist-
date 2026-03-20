import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET
router.get('/', async (req, res) => {
  const { busca } = req.query;

  let query = 'SELECT * FROM pacientes ORDER BY nome';
  let values = [];

  if (busca) {
    query = 'SELECT * FROM pacientes WHERE nome ILIKE $1 ORDER BY nome';
    values = [`%${busca}%`];
  }

  const result = await pool.query(query, values);
  res.json(result.rows);
});

// GET por ID
router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM pacientes WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

// POST
router.post('/', async (req, res) => {
  const { nome, contato, data_nascimento } = req.body;

  const result = await pool.query(
    'INSERT INTO pacientes (nome, contato, data_nascimento) VALUES ($1,$2,$3) RETURNING *',
    [nome, contato, data_nascimento]
  );

  res.json(result.rows[0]);
});

// PUT
router.put('/:id', async (req, res) => {
  const { nome, contato, data_nascimento } = req.body;

  await pool.query(
    'UPDATE pacientes SET nome=$1, contato=$2, data_nascimento=$3 WHERE id=$4',
    [nome, contato, data_nascimento, req.params.id]
  );

  res.sendStatus(200);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM pacientes WHERE id=$1', [req.params.id]);
  res.sendStatus(200);
});

export default router;