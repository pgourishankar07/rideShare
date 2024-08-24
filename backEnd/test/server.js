require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); // Import Mongoose
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Import JSON Web Token

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(express.json()); // To parse JSON data
console.log();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// Define Mongoose models
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key"; // Replace with your secret key

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Store user data in request object
    next();
  });
};

app.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const admins = await Admin.find(); // Fetch all admins
    res.json({ users, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;

    if (email.includes("@hexaware.admin")) {
      user = await Admin.findOne({ email, password });
    } else if (email.includes("@hexaware.user")) {
      user = await User.findOne({ email, password });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: email.includes("@hexaware.admin") ? "admin" : "user",
      },
      JWT_SECRET,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let newUserOrAdmin;

  if (email.includes("@hexaware.admin")) {
    newUserOrAdmin = new Admin({ name, email, password });
  } else if (email.includes("@hexaware.user")) {
    newUserOrAdmin = new User({ name, email, password });
  } else {
    return res.status(400).json({ message: "Invalid email domain." });
  }

  try {
    await newUserOrAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        email: newUserOrAdmin.email,
        role: email.includes("@hexaware.admin") ? "admin" : "user",
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(201).json({ token }); // Return the token
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(9000, () => {
  console.log("Server listening at port:", 9000);
});
