// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Debug: print MongoDB URI to ensure .env is working
console.log("🧩 Mongo URI:", process.env.MONGO_URI);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  resumeCount: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

// ✅ API endpoint to update resume usage count
app.post("/api/updateResumeCount", async (req, res) => {
  const { name, email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.resumeCount += 1;
      await user.save();
      console.log(`🔁 Updated count for ${email}: ${user.resumeCount}`);
    } else {
      user = new User({ name, email, resumeCount: 1 });
      await user.save();
      console.log(`🆕 New user added: ${email}`);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ Error updating resume count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Simple test route
app.get("/", (req, res) => {
  res.send("Backend working fine!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
