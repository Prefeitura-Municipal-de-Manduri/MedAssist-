import express from 'express'
import cors from 'cors'
import pacientesRoutes from './routes/pacientes.js'
import medicamentosRoutes from './routes/medicamentos.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/pacientes', pacientesRoutes)
app.use('/medicamentos', medicamentosRoutes)

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001')
})