const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mailRouter = require("./routes/mail.route");

const app = express();

const defaultAllowedOrigins = [
  "https://madhuraecc.com",
  "https://www.madhuraecc.com",
  "http://madhuraecc.com",
  "http://www.madhuraecc.com",
  "https://api.madhuraecc.com",
  "http://185.199.53.201",
  "http://localhost:3000",
  "http://localhost:3001",
];

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api", mailRouter);

// Only start listening when run directly (not during tests)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
