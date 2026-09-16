const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { getStudent } = require("../db/database");

const router = express.Router();

// GET /api/results/:usn — protected route
router.get("/:usn", authenticate, (req, res) => {
  const usn = String(req.params.usn || "").trim().toUpperCase();

  if (req.user.usn !== usn) {
    return res.status(403).json({ error: "Access denied. You can only view your own result." });
  }

  const student = getStudent(usn);

  if (!student) {
    return res.status(404).json({ error: "Student record not found." });
  }

  return res.json({
    usn: student.usn,
    name: student.name,
    college: student.college,
    examMonth: student.examMonth,
    examType: student.examType,
    programLevel: student.programLevel,
    programName: student.programName,
    semester: student.semester,
    publishedAt: student.publishedAt,
    result: student.result,
    sgpa: student.sgpa,
    cgpa: student.cgpa,
    termGrade: student.termGrade,
    promotionStatus: student.promotionStatus,
    subjects: student.subjects,
  });
});

module.exports = router;
