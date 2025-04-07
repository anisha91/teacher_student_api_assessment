const pool = require("../config/database");
const {
  getTeacherId,
  getStudentIds,
  registerTeacherStudent,
  findCommonStudents,
  suspendStudentByEmail,
} = require("../services/teacherService");
// Handles notifications and retrieves recipients
const { sendNotification } = require("../services/notificationService");

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
    // Validate if all teachers exist in the database
    const [existingTeachers] = await pool.execute(
      `SELECT email FROM teachers WHERE email IN (${teachers.map(() => "?").join(", ")})`,
      teachers
    );

    const existingTeacherEmails = existingTeachers.map((t) => t.email);
    const missingTeachers = teachers.filter((email) => !existingTeacherEmails.includes(email));

    if (missingTeachers.length > 0) {
      return res.status(404).json({ message: `Teacher(s) not found: ${missingTeachers.join(", ")}` });
    }

     // Proceed only if all teachers exist
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

const notification = async (req, res) => {
  try {
      const { teacher, notification } = req.body;
      if (!teacher || !notification) {
          return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await sendNotification(teacher, notification);

      if (result.error) {
          return res.status(400).json({ message: result.error });
      }

      return res.status(200).json(result);
  } catch (error) {
      console.error("Error in notification:", error);
      return res.status(500).json({ message: "Error" + error.message });
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