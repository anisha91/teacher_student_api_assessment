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

    // Get all student statuses
    let studentStatus = [];
    if (mentionedStudents.length > 0) {
      const placeholders = mentionedStudents.map(() => '?').join(', ');
      const [students] = await connection.execute(
        `SELECT s.email, s.suspended, 
         EXISTS(
           SELECT 1 FROM teacher_students ts 
           WHERE ts.student_id = s.id AND ts.teacher_id = ?
         ) AS is_registered
         FROM students s WHERE email IN (${placeholders})`,
        [teacherId, ...mentionedStudents]
      );
      studentStatus = students;
    }

    //  Prepare detailed status messages
    let statusMessages = [];
    const recipients = [];
    
    studentStatus.forEach(student => {
      if (student.suspended) {
        statusMessages.push(`${student.email} is suspended`);
      } else if (!student.is_registered) {
        statusMessages.push(`${student.email} is not registered under ${teacherEmail}`);
      } else {
        recipients.push(student.email);
      }
    });

    // Check for non-existent students
    const existingEmails = studentStatus.map(s => s.email);
    const invalidStudents = mentionedStudents.filter(email => !existingEmails.includes(email));
    if (invalidStudents.length > 0) {
      statusMessages.push(`These students do not exist: ${invalidStudents.join(", ")}`);
    }

    //  Prepare response
    if (recipients.length === 0 && statusMessages.length > 0) {
      throw new Error(statusMessages.join(". "));
    }

    //  Get teacher's non-suspended students
    const [teachersStudents] = await connection.execute(
      `SELECT s.email FROM students s
       JOIN teacher_students ts ON s.id = ts.student_id
       WHERE ts.teacher_id = ? AND s.suspended = FALSE`,
      [teacherId]
    );

    const allRecipients = [
      ...recipients,
      ...teachersStudents.map(s => s.email)
    ].filter((v, i, a) => a.indexOf(v) === i); // Unique values

    if (allRecipients.length === 0) {
      throw new Error("No eligible recipients found");
    }

    //  Store notifications
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
    
    // Include status messages in successful response
    return { 
      recipients: allRecipients,
      ...(statusMessages.length > 0 && { messages: statusMessages })
    };

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
