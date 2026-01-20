import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author_id: { type: String, required: true },
  publisher_id: { type: String, required: true },
  genre_id: { type: String, required: true },
  pub_year: Number,
  isbn: { type: String, unique: true },
});

const Book = mongoose.model("Book", bookSchema);

app.get("/books", async (req, res) => {
  const { author_id, publisher_id, genre_id } = req.query;

  const filter = {};
  if (author_id) filter.author_id = author_id;
  if (publisher_id) filter.publisher_id = publisher_id;
  if (genre_id) filter.genre_id = genre_id;

  const books = await Book.find(filter);
  res.json(books);
});

app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ error: "Failed to save book", details: err });
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) return res.status(404).json({ error: "Book not found" });

    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: "Failed to update book", details: err });
  }
});

app.delete("/books/:id", async (req, res) => {
  const deletedBook = await Book.findByIdAndDelete(req.params.id);

  if (!deletedBook) return res.status(404).json({ error: "Book not found" });

  res.json({ message: "Book successfully removed", livro: deletedBook });
});

app.listen(3000, () => console.log("AThe API is running on port 3000"));
