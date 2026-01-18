import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

app.get('/books', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM books');
  res.json(rows);
});

app.listen(3000, () => console.log('API rodando na porta 3000'));