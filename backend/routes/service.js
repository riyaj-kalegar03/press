const express = require("express");
const router = express.Router();
const Service = require("../model/service"); // Import the Service model
const multer = require("multer");

// Configure multer
const upload = multer();

// Create a new service (POST)
router.post("/add", upload.none(), async (req, res) => {
  console.log(req.body);
  const { title, description, image } = req.body;

  // Validate request body
  if (!title || !description || !image) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const newService = new Service({ title, description, image });
    await newService.save();

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: newService, // Send back the created document
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
});

// Get all services (GET)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services); // Send back all services
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get a single service by ID (GET)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received ID:", id);

  try {
    const service = await Service.findById(id);
    console.log("Fetched service:", service); // Log the result from MongoDB

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, content: service });
  } catch (err) {
    console.error("Error fetching service:", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
});

// Update a service by ID (PUT)
router.put("/:id", upload.none(), async (req, res) => {
  const { id } = req.params;
  const { title, description, image } = req.body;

  console.log("Title:", title, "Description:", description, "Image:", image);

  // Validate request body
  if (!title || !description || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { title, description, image },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ success: true, content: updatedService });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Delete a service by ID (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
