const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getStudent } = require("../db/database");

const router = express.Router();

function verifyPassword(password, student) {
  const salt = Buffer.from(student.passwordSalt, "hex");
  const expected = Buffer.from(student.passwordHash, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { usn, password } = req.body || {};

  if (typeof usn !== "string" || typeof password !== "string" || !usn.trim() || !password) {
    return res.status(400).json({ error: "USN and password are required" });
  }

  const student = getStudent(usn);

  if (!student) {
    return res.status(401).json({ error: "Invalid USN. Please check and try again." });
  }

  if (!verifyPassword(password, student)) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  const token = jwt.sign(
    { usn: student.usn, name: student.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  return res.json({ token, usn: student.usn, name: student.name });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
