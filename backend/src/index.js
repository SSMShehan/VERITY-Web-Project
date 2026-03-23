const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const tasksRoute = require("./routes/tasksRoutes");
const authRoutes = require("./routes/auth");
const academicRoutes = require("./routes/academic");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/tasks", tasksRoute);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Verity API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
