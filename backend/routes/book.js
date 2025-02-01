const express = require("express");
const router = express.Router();
const multer = require("multer");
const Book = require("../model/book"); // Import the Book model

// Configure multer
const upload = multer();

// Create a new book (POST)
router.post("/add", upload.none(), async (req, res) => {
  console.log(req.body);
  const { title, description, price, image } = req.body;

  if (!title || !description || !price || !image) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const newBook = new Book({ title, description, price, image });
    await newBook.save();

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
});

// Get all books (GET)
router.get("/", async (req, res) => {
  try {
    const bookList = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(bookList);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get a single book by ID (GET)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received ID:", id);

  try {
    const book = await Book.findById(id);
    console.log("Fetched book:", book);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, content: book });
  } catch (err) {
    console.error("Error fetching book:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
});

// Update a book by ID (PUT)
router.put("/:id", upload.none(), async (req, res) => {
  const { id } = req.params;
  const { title, description, price, image } = req.body;

  if (!title || !description || !price || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, description, price, image },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ success: true, content: updatedBook });
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Delete a book by ID (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
