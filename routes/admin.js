const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

var fetchadmin = require("../middleware/fetchadmin");
router.get("/allnotes", async (req, res) => {
  try {
    const notesWithUsers = await Note.find().populate("user", "name email");
    res.json(notesWithUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/allusers", fetchadmin, async (req, res) => {
  try {
    const users = await User.find({}, "name email Date");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/notes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const notesForUser = await Note.find({ user: userId });

    if (!notesForUser || notesForUser.length === 0) {
      return res.status(404).json({ error: "Notes not found for the user" });
    }

    res.json(notesForUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/onlynotes",  async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

////create new admin///
router.post(
  "/createadmin",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password", "password must have at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let admin = await Admin.findOne({ email: req.body.email });
      if (admin) {
        return res
          .status(400)
          .json({ success, errors: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        admin: {
          id: admin.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);

/// admin login ////
router.post(
  "/adminlogin",
  [
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ errors: "Invalid credentials!!" });
      }
      const passwordCompare = await bcrypt.compare(password, admin.password);
      if (!passwordCompare) {
        return res.status(400).json({ errors: "Invalid credentials!!" });
      }
      const data = {
        admin: {
          id: admin.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//getadmin//
router.post("/getadmin", fetchadmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select("-password");
    res.send(admin);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// admin delete notes//
router.delete("/notes/:noteId", fetchadmin, async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await Note.findByIdAndDelete(noteId);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update admin's password and name
router.put(
  "/updateadmin",
  fetchadmin,
  [
    body("name").isLength({ min: 3 }),
    body("password", "password must have at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const { name, password } = req.body;
    const adminId = req.admin.id;

    try {
      let admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      // Update name if provided
      if (name) {
        admin.name = name;
      }

      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        admin.password = secPass;
      }

      await admin.save();
      res.json({ message: "Admin details updated successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
// Delete user by ID
router.delete("/users/:userId", fetchadmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;// Delete user by ID
router.delete("/users/:userId", fetchadmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
