require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); // Import Mongoose
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Import JSON Web Token
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(express.json()); // To parse JSON data
console.log();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL1, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Check for connection success
db.on("connected", () => {
  console.log("MongoDB connection established successfully");
});

// Check for connection error
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
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
      JWT_SECRET
    );

    try {
      const response = await axios.post(
        "http://3.111.198.198:5000/getJWT",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const apiToken = response.data; // Ensure this is the correct field you want from the response

      console.log("API token received:", apiToken); // Log the response data

      // Return both tokens to the client
      res.status(201).json({ token, apiToken });
    } catch (axiosError) {
      console.error(
        "Error fetching API token:",
        axiosError.response?.data || axiosError.message
      );
      // You may choose to return a different response if fetching the API token fails
      res
        .status(500)
        .json({ message: "User registered, but failed to fetch API token." });
    }

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let data = await User.findOne({ email });
  console.log(data);

  if (data) {
    return res.status(403).json({ message: "User already registered" });
  }

  let newUserOrAdmin;
  let _id;

  if (email.includes("@hexaware.admin")) {
    newUserOrAdmin = new Admin({ name, email, password });
  } else if (email.includes("@hexaware.user")) {
    newUserOrAdmin = new User({ name, email, password });

    // if (role == "driver") {
    //   try {
    //     const response = await axios.post(
    //       "http://3.111.198.198:5000/getJWT",
    //       requestData,
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );

    //     const apiToken = response.data; // Ensure this is the correct field you want from the response

    //     console.log("API token received:", apiToken); // Log the response data

    //     // Return both tokens to the client
    //     res.status(201).json({ token, apiToken });
    //   } catch (axiosError) {
    //     console.error(
    //       "Error fetching API token:",
    //       axiosError.response?.data || axiosError.message
    //     );
    //     // You may choose to return a different response if fetching the API token fails
    //     res
    //       .status(500)
    //       .json({ message: "User registered, but failed to fetch API token." });
    //   }
    //   try {
    //     axios
    //       .post("http://3.111.198.198:5050/driver/addDriver",data, {
    //         headers: {
    //           Authorization: `Bearer ${apiToken}`, // Use the new API token here
    //         },
    //       })
    //       .then();
    //   } catch (error) {
    //     console.log(error);
    //   }
    // } else if (role == "rider") {
    //   try {
    //     axios
    //       .post("http://3.111.198.198:5050/rider/addRider", {
    //         headers: {
    //           Authorization: `Bearer ${apiToken}`, // Use the new API token here
    //         },
    //       })
    //       .then();
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  } else {
    return res.status(400).json({ message: "Invalid email domain." });
  }

  try {
    await newUserOrAdmin.save();
    data = await User.findOne({ email, password });
    console.log(data);

    // Generate JWT token
    const token = jwt.sign(
      {
        email: newUserOrAdmin.email,
        role: email.includes("@hexaware.admin") ? "admin" : "user",
      },
      JWT_SECRET
    );

    res.status(201).json({ token, data });

    // Send a request to get another token (apiToken)
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(400).json({ message: err.message });
  }
});

app.listen(9000, () => {
  console.log("Server listening at port:", 9000);
});
