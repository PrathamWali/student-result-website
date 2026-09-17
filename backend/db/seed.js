const { loadStudents } = require("./database");

const students = loadStudents();

if (!Array.isArray(students) || students.length === 0) {
  throw new Error("No student records found in db/students.json");
}

for (const student of students) {
  const required = ["usn", "name", "passwordHash", "passwordSalt", "subjects"];
  for (const field of required) {
    if (student[field] === undefined || student[field] === null) {
      throw new Error(`Student ${student.usn || "(unknown)"} is missing ${field}`);
    }
  }
  console.log(`Loaded student: ${student.usn} (${student.name})`);
}

console.log(`Student data is ready. ${students.length} record(s) available.`);
