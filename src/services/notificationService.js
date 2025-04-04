const pool = require("../config/database"); // Ensure correct path to database connection

const sendNotification = async (teacherEmail, message) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validate teacher exists
    const [teacher] = await connection.execute(
      "SELECT id FROM teachers WHERE email = ?",
      [teacherEmail.toLowerCase()]
    );
    if (teacher.length === 0) {
      throw new Error("Teacher not found");
    }
    const teacherId = teacher[0].id;

    // Validate required fields
    if (!message) {
      throw new Error("Missing required fields");
    }

    // Extract mentioned students
    const mentionedStudents = (message.match(/@([\w.-]+@[\w.-]+)/g) || [])
      .map(s => s.replace("@", "").toLowerCase());

    // First check if any mentioned students don't exist
    if (mentionedStudents.length > 0) {
      const placeholders = mentionedStudents.map(() => '?').join(', ');
      const [existingStudents] = await connection.execute(
        `SELECT email FROM students WHERE email IN (${placeholders})`,
        mentionedStudents
      );

      const existingEmails = existingStudents.map(s => s.email);
      const invalidStudents = mentionedStudents.filter(email => !existingEmails.includes(email));

      if (invalidStudents.length > 0) {
        throw new Error(`These students do not exist: ${invalidStudents.join(", ")}`);
      }
    }

    // Get eligible recipients in two parts:
    //    a) Students registered with this teacher
    //    b) Mentioned students (regardless of registration)
    const queryRegistered = `
      SELECT DISTINCT s.email
      FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ? AND s.suspended = FALSE
    `;

    // Get registered students
    const [registeredStudents] = await connection.execute(queryRegistered, [teacherId]);
    let allRecipients = registeredStudents.map(s => s.email);

    // Add mentioned students if any
    if (mentionedStudents.length > 0) {
      const placeholders = mentionedStudents.map(() => '?').join(', ');
      const queryMentioned = `
        SELECT DISTINCT s.email
        FROM students s
        WHERE s.email IN (${placeholders}) AND s.suspended = FALSE
      `;
      
      const [mentionedStudentsResult] = await connection.execute(
        queryMentioned,
        mentionedStudents  // Already an array of values
      );
      
      const mentionedEmails = mentionedStudentsResult.map(s => s.email);
      allRecipients = [...new Set([...allRecipients, ...mentionedEmails])]; // Remove duplicates
    }

    if (allRecipients.length === 0) {
      throw new Error("No eligible recipients found");
    }

    // Store notifications
    await Promise.all(
      allRecipients.map(email =>
        connection.execute(
          `INSERT INTO notifications (teacher_id, student_id, message)
           SELECT ?, s.id, ? FROM students s WHERE s.email = ?`,
          [teacherId, message, email]
        )
      )
    );

    await connection.commit();
    return { recipients: allRecipients.sort() }; // Sort for consistent output

  } catch (error) {
    await connection.rollback();
    console.error("Notification error:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
    sendNotification
};
