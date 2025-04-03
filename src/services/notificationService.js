const pool = require("../config/database"); // Ensure correct path to database connection

const sendNotification = async (teacherEmail, message) => {
    try {
        // 🔹 Find teacher ID
        const [teacherRow] = await pool.execute("SELECT id FROM teachers WHERE email = ?", [teacherEmail]);
        if (teacherRow.length === 0) {
            return { error: "Teacher not found" }; // Proper error message
        }
        const teacherId = teacherRow[0].id;

        // 🔹 Extract @mentioned students
        const mentionedStudents = (message.match(/@([\w.-]+@[\w.-]+)/g) || []).map((s) => s.replace("@", ""));

        // 🔹 Check if the teacher has any registered students
        const [teacherStudents] = await pool.execute(
            `SELECT s.id, s.email 
            FROM students s
            INNER JOIN teacher_students ts ON s.id = ts.student_id
            INNER JOIN teachers t ON ts.teacher_id = t.id
            WHERE t.email = ? AND s.suspended = FALSE`,
            [teacherId]
        );

        //  If the teacher has no students and no students are mentioned
        if (teacherStudents.length === 0 && mentionedStudents.length === 0) {
            return { error: "Teacher has no students and no mentioned students." };
        }

        //  Check if mentioned students exist in the `students` table
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

        //  Get students linked to the teacher (registered & not suspended)
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
            query += ` OR s.email IN (${placeholders})`;
            queryParams.push(...mentionedStudents);
        }

        const [recipients] = await pool.execute(query, queryParams);

        // Check if all mentioned students are actually linked to the teacher
        const recipientEmails = recipients.map(s => s.email);
        const unrelatedEmails = mentionedStudents.filter(email => !recipientEmails.includes(email));

        if (unrelatedEmails.length > 0) {
            return { error: `The following students are not registered under this teacher: ${unrelatedEmails.join(", ")}` };
        }

        // If no students are eligible, return a meaningful response
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
        throw error; // Let the calling function handle errors
    }
};

module.exports = {
    sendNotification
};
