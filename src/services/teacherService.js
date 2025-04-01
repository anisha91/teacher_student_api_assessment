const pool = require("../config/database");

const getTeacherId = async (email) => {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email provided");
    }

    const [rows] = await pool.execute("SELECT id FROM teachers WHERE email = ?", [email]);
    if (rows.length > 0) return rows[0].id;

    const [result] = await pool.execute("INSERT INTO teachers (email) VALUES (?)", [email]);
    return result.insertId;
  } catch (error) {
    console.error("Database error in getTeacherId:", error.message);
    throw new Error("Database error while fetching or inserting teacher");
  }
};

const getStudentIds = async (emails) => {
  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error("Invalid student email list provided");
    }

    const studentIds = [];
    for (const email of emails) {
      const [rows] = await pool.execute("SELECT id FROM students WHERE email = ?", [email]);
      if (rows.length > 0) {
        studentIds.push(rows[0].id);
      } else {
        const [result] = await pool.execute("INSERT INTO students (email) VALUES (?)", [email]);
        studentIds.push(result.insertId);
      }
    }
    return studentIds;
  } catch (error) {
    console.error("Database error in getStudentIds:", error.message);
    throw new Error("Database error while fetching or inserting students");
  }
};

const registerTeacherStudent = async (teacherId, studentIds) => {
  try {
    if (!teacherId || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("Invalid teacher ID or student ID list");
    }

    for (const studentId of studentIds) {
      await pool.execute("INSERT IGNORE INTO teacher_students (teacher_id, student_id) VALUES (?, ?)", [teacherId, studentId]);
    }
  } catch (error) {
    console.error("Database error in registerTeacherStudent:", error.message);
    throw new Error("Database error while registering students");
  }
};

const findCommonStudents = async (teacherEmails) => {
  try {
    if (!teacherEmails || !Array.isArray(teacherEmails) || teacherEmails.length === 0) {
      throw new Error("At least one teacher email must be provided.");
    }

    // Get teacher IDs from emails
    const placeholders = teacherEmails.map(() => "?").join(",");
    const [teachers] = await pool.execute(
      `SELECT id FROM teachers WHERE email IN (${placeholders})`,
      teacherEmails
    );

    if (teachers.length !== teacherEmails.length) {
      throw new Error("One or more teachers not found.");
    }

    const teacherIds = teachers.map((t) => t.id);

    // Query students who are registered under ALL given teachers (including suspended students)
    const query = `
      SELECT s.email 
      FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id IN (${placeholders})
      GROUP BY s.id
      HAVING COUNT(DISTINCT ts.teacher_id) = ?
    `;

    const [students] = await pool.execute(query, [...teacherIds, teacherIds.length]);

    return students.map((s) => s.email);
  } catch (error) {
    console.error("Error in findCommonStudents:", error.message);
    throw new Error("Database error while retrieving common students.");
  }
};

const suspendStudentByEmail = async (email) => {
  try {
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email provided");
    }

    const [student] = await pool.execute("SELECT id FROM students WHERE email = ?", [email]);
    if (student.length === 0) return false;

    await pool.execute("UPDATE students SET suspended = TRUE WHERE email = ?", [email]);
    return true;
  } catch (error) {
    console.error("Database error in suspendStudentByEmail:", error.message);
    throw new Error("Database error while suspending student");
  }
};

module.exports = { getTeacherId, getStudentIds, registerTeacherStudent, findCommonStudents, suspendStudentByEmail };