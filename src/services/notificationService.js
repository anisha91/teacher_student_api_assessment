const pool = require("../config/database"); // Ensure correct path to database connection

const sendNotification = async (teacherEmail, message) => {
    try {
        // Find teacher ID
        const [teacherRow] = await pool.execute("SELECT id FROM teachers WHERE email = ?", [teacherEmail]);
        if (teacherRow.length === 0) {
            return { error: "Teacher not found" };
        }
        const teacherId = teacherRow[0].id;

        // Extract @mentioned students
        const mentionedStudents = (message.match(/@([\w.-]+@[\w.-]+)/g) || []).map((s) => s.replace("@", ""));

        // Check if mentioned students exist in the `students` table
        if (mentionedStudents.length > 0) {
            const placeholders = mentionedStudents.map(() => "?").join(", ");
            const [existingStudents] = await pool.execute(
                `SELECT email FROM students WHERE email IN (${placeholders})`, mentionedStudents
            );

            const existingEmails = existingStudents.map(s => s.email);
            const nonExistingEmails = mentionedStudents.filter(email => !existingEmails.includes(email));

            if (nonExistingEmails.length > 0) {
                return { error: `The following students do not exist: ${nonExistingEmails.join(", ")}` };
            }
        }

        // Get students linked to the teacher (registered & not suspended) OR mentioned students
        let query = `
            SELECT DISTINCT s.id, s.email 
            FROM students s
            LEFT JOIN teacher_students ts ON s.id = ts.student_id
            LEFT JOIN teachers t ON ts.teacher_id = t.id
            WHERE (t.email = ? AND s.suspended = FALSE)
        `; 

        let queryParams = [teacherEmail];

        if (mentionedStudents.length > 0) {
            const placeholders = mentionedStudents.map(() => "?").join(", ");
            query += ` OR (s.email IN (${placeholders}) AND s.suspended = FALSE)`;
            queryParams.push(...mentionedStudents);
        }

        const [recipients] = await pool.execute(query, queryParams);

        // Check if all mentioned students are actually linked to the teacher
        const recipientEmails = recipients.map(s => s.email);
        const unrelatedEmails = mentionedStudents.filter(email => !recipientEmails.includes(email));

        if (unrelatedEmails.length > 0) {
            return { error: `The following students are not registered under this teacher: ${unrelatedEmails.join(", ")}` };
        }

        // If no students are eligible
        if (recipients.length === 0) { 
            return { error: "No students linked to this teacher or mentioned in the message." };
        }

        // Store separate records for each student in notifications table
        const notificationPromises = recipients.map(student =>
            pool.execute(
                "INSERT INTO notifications (teacher_id, student_id, message) VALUES (?, ?, ?)",
                [teacherId, student.id, message]
            )
        );
        await Promise.all(notificationPromises);

        return { recipients: recipients.map(s => s.email) };

    } catch (error) {
        console.error("Error in sendNotification:", error);
        throw error;
    }
};

module.exports = {
    sendNotification
};
