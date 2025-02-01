const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const config = require("./config"); // Assuming config contains mongoURI
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const newsRoutes = require("./routes/news");
const bookRoutes = require("./routes/book");
const serviceRoutes = require("./routes/service");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./model/user");
// Import the books routes

const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
const corsOptions = {
  origin: "http://localhost:3000", // Frontend URL
  credentials: true, // Allow credentials (cookies, HTTP authentication)
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Static folder for image access

const store = MongoStore.create({
  mongoUrl: config.mongoURI,
  crypto: {
    secret: "mysupersecret",
  },
  touchAfter: 24 * 60 * 60, // time period in seconds for updating session expiration
});

store.on("error", () => {
  console.error("Error connecting to MongoDB session store ", err);
});
const sessionOptions = {
  store,
  secret: "mysupersecret",
  reverse: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "None", // required for cross-origin requests
    secure: true, // required for HTTPS
  },
};

app.use(session(sessionOptions));

//passport implementation
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/news", newsRoutes);
app.use("/book", bookRoutes);
app.use("/service", serviceRoutes);

// Start server
const port = 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
