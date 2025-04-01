const pool = require("../config/database");
const {
  getTeacherId,
  getStudentIds,
  registerTeacherStudent,
  findCommonStudents,
  suspendStudentByEmail,
} = require("../services/teacherService");

// Handles the registration of students under a teacher
const registerTeachersAndStudents = async (req, res) => {
  try {
    const { teacher, students } = req.body;

    if (!teacher || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Invalid request format. 'teacher' and 'students' must be provided." });
    }

    const teacherId = await getTeacherId(teacher);
    const studentIds = await getStudentIds(students);
    await registerTeacherStudent(teacherId, studentIds);

    return res.status(204).send();
  } catch (error) {
    console.error("Error in registerTeachersAndStudents:", error);
    return handleError(res, error);
  }
};

// Retrieves common students taught by the specified teachers
const getCommonStudents = async (req, res) => {
  try {
    let { teacher } = req.query;

    if (!teacher) {
      return res.status(400).json({ message: "Teacher parameter is required." });
    }

    const teachers = Array.isArray(teacher) ? teacher : [teacher];
    const students = await findCommonStudents(teachers);

    return res.status(200).json({ students });
  } catch (error) {
    console.error("Error in getCommonStudents:", error);
    return handleError(res, error);
  }
};

// Suspends a student by email
const suspendStudent = async (req, res) => {
  try {
    const { student } = req.body;
    if (!student) {
      return res.status(400).json({ message: "Student email is required." });
    }

    const result = await suspendStudentByEmail(student);
    if (!result) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error in suspendStudent:", error);
    return handleError(res, error);
  }
};

// Handles notifications and retrieves recipients
const notification = async (req, res) => {
  try {
    const { teacher, notification } = req.body;

    if (!teacher || !notification) {
      console.log("DEBUG: Missing required fields!"); // ✅ Debugging log
      return res.status(400).json({ message: "Missing required fields" }); // ✅ Exact expected message
    }

    // Extract @mentioned students
    const mentionedStudents = (notification.match(/@([\w.-]+@[\w.-]+)/g) || []).map((s) => s.replace("@", ""));

    // Find teacher ID
    const [teacherRow] = await pool.execute("SELECT id FROM teachers WHERE email = ?", [teacher]);
    if (teacherRow.length === 0) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const teacherId = teacherRow[0].id;

    // Get registered students
    let query = `
      SELECT DISTINCT s.email 
      FROM students s
      LEFT JOIN teacher_students ts ON s.id = ts.student_id
      LEFT JOIN teachers t ON ts.teacher_id = t.id
      WHERE t.email = ? AND s.suspended = FALSE
    `;
    let queryParams = [teacher];

    if (mentionedStudents.length > 0) {
      const placeholders = mentionedStudents.map(() => "?").join(", ");
      query += ` OR s.email IN (${placeholders})`;
      queryParams.push(...mentionedStudents);
    }

    const [recipients] = await pool.execute(query, queryParams);

    // Store the notification in the database
    await pool.execute("INSERT INTO notifications (teacher_id, message) VALUES (?, ?)", [teacherId, notification]);

    return res.status(200).json({ recipients: recipients.map((s) => s.email) });
  } catch (error) {
    console.error("Error in notification:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Centralized Error Handling Middleware
const handleError = (res, error) => {
  if (error.message.includes("not found")) {
    return res.status(404).json({ message: error.message });
  }
  if (error.message.includes("Invalid") || error.message.includes("required")) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = { registerTeachersAndStudents, getCommonStudents, suspendStudent, notification };