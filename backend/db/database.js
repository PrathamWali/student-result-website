const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "students.json");

function loadStudents() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (error) {
    throw new Error(`Unable to load student data: ${error.message}`);
  }
}

function getStudent(usn) {
  const normalized = String(usn || "").trim().toUpperCase();
  return loadStudents().find((student) => student.usn === normalized) || null;
}

module.exports = { loadStudents, getStudent };
