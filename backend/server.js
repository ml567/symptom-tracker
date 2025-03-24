require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Symptom Schema
const symptomSchema = new mongoose.Schema({
  date: String,
  symptoms: [
    {
      symptom: String,
      time: String,
      intensity: Number,
    },
  ],
});

const Symptom = mongoose.model("Symptom", symptomSchema);

// Route to save symptoms
app.post("/symptoms", async (req, res) => {
  try {
    const { date, symptoms } = req.body;

    if (!date || !symptoms) {
      return res.status(400).json({ msg: "Invalid input" });
    }

    // Save symptoms to MongoDB
    const newSymptomEntry = new Symptom({ date, symptoms });
    await newSymptomEntry.save();

    res.status(201).json({ msg: "✅ Symptom added successfully!" });
  } catch (error) {
    console.error("❌ Error saving symptom:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Route to fetch symptoms for a specific date
app.get("/symptoms", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ msg: "Date is required" });
    }

    const symptomEntry = await Symptom.findOne({ date });
    if (!symptomEntry) {
      return res.status(200).json({ symptoms: [] });
    }

    res.status(200).json({ symptoms: symptomEntry.symptoms });
  } catch (error) {
    console.error("❌ Error fetching symptoms:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));