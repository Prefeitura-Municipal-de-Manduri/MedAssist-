import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pacientesRoutes from './routes/pacientes.js';
import medicamentosRoutes from './routes/medicamentos.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/pacientes', pacientesRoutes);
app.use('/medicamentos', medicamentosRoutes);

app.listen(3000, () => {
  console.log('🔥 Backend rodando em http://localhost:3000');
});