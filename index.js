// Load environment variables from a .env file
require("dotenv").config();
// const cors = require("cors");
// Import necessary modules
const express = require("express");
const { split, join } = require("shamir");
const { randomBytes } = require("crypto");

// Initialize Express app
const app = express();
// Set the port from environment variable or default to 5000
const port = process.env.PORT || 5000;

// Middleware for parsing JSON bodies
app.use(express.json());
// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware for enabling CORS
// enable cors from secretslices.com
// app.use(cors({ origin: "https://secretslices.com" }));
// Serve static files from the "public" directory
app.use(express.static("public"));

// Function to split a secret message into parts
function splitMessage(secret, numParts, quorum) {
  // Encode the secret as UTF-8
  const utf8Encoder = new TextEncoder();
  const secretBytes = utf8Encoder.encode(secret);

  // Split the secret into parts
  const parts = split(randomBytes, numParts, quorum, secretBytes);

  // Convert each part into a string representation
  const partStrings = Object.entries(parts).map(([part, value]) => ({
    part,
    value: Array.from(value).toString(),
  }));

  return partStrings;
}

// Function to join parts of a secret message
function joinParts(partStrings) {
  // Convert string representations back to Uint8Array
  const parts = partStrings.reduce((acc, { part, value }) => {
    acc[part] = Uint8Array.from(value.split(",").map(Number));
    return acc;
  }, {});

  // Join the parts to reconstruct the secret
  const secretBytes = join(parts);

  // Decode the secret from UTF-8
  const utf8Decoder = new TextDecoder();
  return utf8Decoder.decode(secretBytes);
}

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// Route to split a secret message
app.post("/split", (req, res) => {
  try {
    const { secret, numParts, quorum } = req.body;
    if (
      secret === undefined ||
      numParts === undefined ||
      quorum === undefined
    ) {
      return res.status(400).json({ error: "Missing required parameter" });
    }
    try {
      const parts = splitMessage(secret, parseInt(numParts), parseInt(quorum));
      res.status(200).json({ parts });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to join parts of a secret message
app.post("/join", (req, res) => {
  try {
    const { parts } = req.body;
    if (parts === undefined) {
      return res.status(400).json({ error: "Missing required parameter" });
    }
    try {
      const secret = joinParts(parts);
      res.status(200).json({ secret });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
