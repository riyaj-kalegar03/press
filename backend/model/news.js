const mongoose = require("mongoose");

// Define the schema for news articles
const newsSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true }, // Headline of the news
    content: { type: String, required: true }, // Content of the news article
    author: { type: String }, // Author of the news article
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a model using the schema
const News = mongoose.model("News", newsSchema);

module.exports = News;
