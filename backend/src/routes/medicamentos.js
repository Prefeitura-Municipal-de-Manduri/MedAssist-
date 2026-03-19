import express from 'express'
import pool from '../db.js'

const router = express.Router()

// GET todos medicamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.nome as paciente_nome
      FROM medicamentos m
      JOIN pacientes p ON m.paciente_id = p.id
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar medicamentos' })
  }
})

// POST criar medicamento
router.post('/', async (req, res) => {
  const {
    paciente_id,
    nome,
    data_inicio,
    data_validade
  } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO medicamentos 
       (paciente_id, nome, data_inicio, data_validade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [paciente_id, nome, data_inicio, data_validade]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar medicamento' })
  }
})

export default router