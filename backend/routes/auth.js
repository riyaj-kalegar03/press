const express = require("express");
const passport = require("passport");
const User = require("../model/user");
const config = require("../config");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("Request Body: ", req.body); // Log the incoming request body
    const { username, password, email } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    user = new User({
      username,

      email, // Ensure email is saved in the model
      role: "admin",
    });

    await User.register(user, password);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error: ", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error in registration", error: error.message });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error in login", error: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error during login", error: err.message });
      }
      return res.json({
        message: "Login successful",
        user: { id: user._id, username: user.username, role: user.role },
      });
    });
  })(req, res, next);
});
// Route to check if the user is authenticated
router.get("/status", (req, res) => {
  console.log("getting request");
  if (req.session && req.session.user) {
    return res.json({
      authenticated: true, // User is logged in
    });
  } else {
    return res.json({
      authenticated: false, // User is not logged in
    });
  }
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error logging out", error: err.message });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // Clear session cookie
      res.status(200).json({ message: "Logged out successfully" });
      console.log("Logged out");
    });
  });
});

module.exports = router;
