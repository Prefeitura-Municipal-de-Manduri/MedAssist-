import express from 'express'
import pool from '../db.js'

const router = express.Router()

// GET todos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar pacientes' })
  }
})

// POST criar paciente
router.post('/', async (req, res) => {
  const { nome, contato } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO pacientes (nome, contato) VALUES ($1, $2) RETURNING *',
      [nome, contato]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar paciente' })
  }
})

export default router