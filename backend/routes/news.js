const express = require("express");
const router = express.Router();
const News = require("../model/news"); // Import the news model

// Create a new news article (POST)
const multer = require("multer");

// Configure multer
const upload = multer();

router.post("/add", upload.none(), async (req, res) => {
  console.log(req.user);
  const { headline, content, author } = req.body;

  // Validate request body
  if (!headline || !content || !author) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const newNews = new News({ headline, content, author });
    await newNews.save();

    // Include a success field in the response
    res.status(201).json({
      success: true,
      message: "News added successfully",
      data: newNews, // Optional: Send back the created document
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
});

// Get all news articles (GET)
router.get("/", async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });

    res.status(200).json(newsList); // Send back the list of all news articles
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get a single news article by ID (GET)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received ID:", id);

  try {
    const news = await News.findById(id);
    console.log("Fetched news:", news); // Log the result from MongoDB

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }

    // Return the news directly without wrapping in 'content'
    res.status(200).json({ success: true, data: news }); // Send back the news directly
  } catch (err) {
    console.error("Error fetching news:", err); // Log the error if any
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
});

// Update a news article by ID (PUT)
router.put("/:id", upload.none(), async (req, res) => {
  const { id } = req.params;
  const { headline, content, author } = req.body;

  // Log incoming data to verify it's received
  console.log("Headline:", headline, "Content:", content, "Author:", author);

  // Validate request body
  if (!headline || !content || !author) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Update the news article in the database
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { headline, content, author },
      { new: true } // Ensure the updated document is returned
    );

    // If no article was found with the given ID, return 404
    if (!updatedNews) {
      return res.status(404).json({ message: "News article not found" });
    }

    // Return the updated article along with a success flag
    res.status(200).json({ success: true, content: updatedNews });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Delete a news article by ID (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) {
      return res.status(404).json({ message: "News article not found" });
    }
    res.status(200).json({ message: "News article deleted successfully" }); // Confirmation of deletion
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
