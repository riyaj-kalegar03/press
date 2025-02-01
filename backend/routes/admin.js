const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/data", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome to the protected admin route", user: req.user });
});

module.exports = router;
