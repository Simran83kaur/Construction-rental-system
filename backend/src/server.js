import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// example API route
app.get("/api/rentals", (req, res) => {
  res.json([
    { id: 1, name: "House A" },
    { id: 2, name: "House B" },
  ]);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});