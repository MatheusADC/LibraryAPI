import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

app.get("/books", async (req, res) => {
  const { author_id, publisher_id, genre_id } = req.query;

  const conditions = [];
  const values = [];

  if (author_id) {
    conditions.push(`author_id = $${values.length + 1}`);
    values.push(author_id);
  }

  if (publisher_id) {
    conditions.push(`publisher_id = $${values.length + 1}`);
    values.push(publisher_id);
  }

  if (genre_id) {
    conditions.push(`genre_id = $${values.length + 1}`);
    values.push(genre_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM books ${whereClause}`;

  const { rows } = await pool.query(query, values);
  res.json(rows);
});

app.post("/books", async (req, res) => {
  const { title, author_id, publisher_id, genre_id, pub_year, isbn } = req.body;

  const query = `
    INSERT INTO books (title, author_id, publisher_id, genre_id, pub_year, isbn)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [title, author_id, publisher_id, genre_id, pub_year, isbn];
  const { rows } = await pool.query(query, values);

  res.status(201).json(rows[0]);
});

app.put("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author_id, publisher_id, genre_id, pub_year, isbn } = req.body;

  const query = `
    UPDATE books
    SET title = $1,
        author_id = $2,
        publisher_id = $3,
        genre_id = $4,
        pub_year = $5,
        isbn = $6
    WHERE book_id = $7
    RETURNING *;
  `;

  const values = [title, author_id, publisher_id, genre_id, pub_year, isbn, id];
  const { rows } = await pool.query(query, values);

  if (rows.length === 0)
    return res.status(404).json({ error: "Book not found" });
  res.json(rows[0]);
});

app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM books WHERE book_id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0)
    return res.status(404).json({ error: "Book not found" });

  res.json({ message: "Book successfully deleted", livro: rows[0] });
});

app.listen(3000, () => console.log("The API is running on port 3000"));
