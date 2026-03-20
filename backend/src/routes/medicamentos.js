import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET por paciente
router.get('/:pacienteId', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM medicamentos WHERE paciente_id=$1 ORDER BY nome',
    [req.params.pacienteId]
  );

  res.json(result.rows);
});

// POST
router.post('/', async (req, res) => {
  const { paciente_id, nome, data_inicio, data_validade, datas_retirada, vezes_tomado, dose } = req.body;

  const result = await pool.query(
    `INSERT INTO medicamentos 
    (paciente_id, nome, data_inicio, data_validade, datas_retirada, vezes_tomado, dose)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [paciente_id, nome, data_inicio, data_validade, datas_retirada, vezes_tomado, dose || null]
  );

  res.json(result.rows[0]);
});

// PUT
router.put('/:id', async (req, res) => {
  const { nome, data_inicio, data_validade, vezes_tomado, dose } = req.body;

  await pool.query(
    `UPDATE medicamentos 
     SET nome=$1, data_inicio=$2, data_validade=$3, vezes_tomado=$4, dose=$5
     WHERE id=$6`,
    [nome, data_inicio, data_validade, vezes_tomado, dose || null, req.params.id]
  );

  res.sendStatus(200);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM medicamentos WHERE id=$1', [req.params.id]);
  res.sendStatus(200);
});

// REGISTRAR RETIRADA
router.put('/:id/retirada', async (req, res) => {
  const { novaData, datasAtuais, vezesAtual } = req.body;

  await pool.query(
    `UPDATE medicamentos 
     SET datas_retirada=$1, vezes_tomado=$2 
     WHERE id=$3`,
    [[...datasAtuais, novaData], vezesAtual + 1, req.params.id]
  );

  res.sendStatus(200);
});

export default router;