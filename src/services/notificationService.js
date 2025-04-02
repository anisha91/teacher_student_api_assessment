const pool = require("../config/database"); // Ensure correct path to database connection

const sendNotification = async (teacherEmail, message) => {
    try {
        // Find teacher ID
        const [teacherRow] = await pool.execute("SELECT id FROM teachers WHERE email = ?", [teacherEmail]);
        if (teacherRow.length === 0) {
            throw new Error("Teacher not found");
        }
        const teacherId = teacherRow[0].id;

        // Extract @mentioned students
        const mentionedStudents = (message.match(/@([\w.-]+@[\w.-]+)/g) || []).map((s) => s.replace("@", ""));

        // Get eligible students (registered & not suspended)
        let query = `
            SELECT DISTINCT s.id, s.email 
            FROM students s
            LEFT JOIN teacher_students ts ON s.id = ts.student_id
            LEFT JOIN teachers t ON ts.teacher_id = t.id
            WHERE t.email = ? AND s.suspended = FALSE
        `;
        let queryParams = [teacherEmail];

        if (mentionedStudents.length > 0) {
            const placeholders = mentionedStudents.map(() => "?").join(", ");
            query += ` OR s.email IN (${placeholders})`;
            queryParams.push(...mentionedStudents);
        }

        const [recipients] = await pool.execute(query, queryParams);

        // If no students are eligible, return an empty recipient list
        if (recipients.length === 0) {
            return { recipients: [] };
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
