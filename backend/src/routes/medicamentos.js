import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET por paciente
router.get('/:pacienteId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, 
        p.paciente_id, 
        p.medicamento_nome AS nome, 
        p.dosagem AS dose,
        p.data_prescricao AS data_inicio,
        COUNT(r.id) AS retiradas,
        ARRAY_AGG(r.data_retirada) AS datas_retirada
       FROM public.prescricoes p
       LEFT JOIN retiradas r ON r.prescricao_id = p.id
       WHERE p.paciente_id = $1 
       GROUP BY p.id
       ORDER BY p.medicamento_nome`,
      [req.params.pacienteId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar medicamentos" });
  }
});

// POST - Criar
router.post('/', async (req, res) => {
  const { paciente_id, nome, dose } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO public.prescricoes 
       (paciente_id, medicamento_nome, dosagem)
       VALUES ($1, $2, $3) 
       RETURNING id, paciente_id, medicamento_nome AS nome, dosagem AS dose, vezes_tomado`,
      [paciente_id, nome, dose]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar medicamento" });
  }
});

// PUT - Editar
router.put('/:id', async (req, res) => {
  const { nome, dose } = req.body;

  try {
    await pool.query(
      `UPDATE public.prescricoes 
       SET medicamento_nome = $1, dosagem = $2
       WHERE id = $3`,
      [nome, dose, req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar medicamento" });
  }
});


// 🔥 NOVA ROTA - RETIRADA
router.put('/:id/retirada', async (req, res) => {
  const { id } = req.params;

  try {
    // registra retirada
    await pool.query(
      `INSERT INTO retiradas (prescricao_id)
       VALUES ($1)`,
      [id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar retirada" });
  }
});


// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM public.prescricoes WHERE id = $1',
      [req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar medicamento" });
  }
});

export default router;