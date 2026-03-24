import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET por paciente
router.get('/:pacienteId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        paciente_id, 
        medicamento_nome AS nome, 
        dosagem AS dose,
        data_prescricao AS data_inicio,
        vezes_tomado
       FROM public.prescricoes 
       WHERE paciente_id = $1 
       ORDER BY medicamento_nome`,
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
    const result = await pool.query(
      `UPDATE public.prescricoes
       SET 
         vezes_tomado = COALESCE(vezes_tomado, 0) + 1,
         data_prescricao = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]); // retorna atualizado
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