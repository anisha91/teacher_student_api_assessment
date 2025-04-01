create database teacher_student_db;

USE teacher_student_db;

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    suspended BOOLEAN DEFAULT FALSE
);

CREATE TABLE teacher_students (
    teacher_id INT,
    student_id INT,
    PRIMARY KEY (teacher_id, student_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_email VARCHAR(255),
    student_email VARCHAR(255),
    FOREIGN KEY (teacher_email) REFERENCES teachers(email),
    FOREIGN KEY (student_email) REFERENCES students(email),
    UNIQUE (teacher_email, student_email)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);


INSERT INTO teachers (email) VALUES
('teacherken@gmail.com'),
('teacherjoe@gmail.com'),
('teacheremma@gmail.com');


INSERT INTO students (email, suspended) VALUES
('commonstudent1@gmail.com', FALSE),
('commonstudent2@gmail.com', FALSE),
('studentbob@gmail.com', FALSE),
('studentmary@gmail.com', TRUE), -- Suspended student
('studentagnes@gmail.com', FALSE),
('studentmiche@gmail.com', FALSE),
('studenthon@gmail.com', FALSE),
('studentjon@gmail.com', FALSE);


INSERT INTO teacher_students (teacher_id, student_id) VALUES
-- Teacher Ken's students
(1, 1), -- commonstudent1
(1, 2), -- commonstudent2
(1, 3), -- studentbob
(1, 7), -- studenthon
(1, 8), -- studentjon

-- Teacher Joe's students
(2, 1), -- commonstudent1
(2, 2), -- commonstudent2
(2, 4), -- studentmary (Suspended)
(2, 5), -- studentagnes

-- Teacher Emma's students
(3, 6), -- studentmiche
(3, 7), -- studenthon
(3, 8); -- studentjon

INSERT INTO registrations (teacher_email, student_email) VALUES
-- Teacher Ken's students
('teacherken@gmail.com', 'commonstudent1@gmail.com'),
('teacherken@gmail.com', 'commonstudent2@gmail.com'),
('teacherken@gmail.com', 'studentbob@gmail.com'),
('teacherken@gmail.com', 'studenthon@gmail.com'),
('teacherken@gmail.com', 'studentjon@gmail.com'),

-- Teacher Joe's students
('teacherjoe@gmail.com', 'commonstudent1@gmail.com'),
('teacherjoe@gmail.com', 'commonstudent2@gmail.com'),
('teacherjoe@gmail.com', 'studentmary@gmail.com'), -- Suspended student
('teacherjoe@gmail.com', 'studentagnes@gmail.com'),

-- Teacher Emma's students
('teacheremma@gmail.com', 'studentmiche@gmail.com'),
('teacheremma@gmail.com', 'studenthon@gmail.com'),
('teacheremma@gmail.com', 'studentjon@gmail.com');


INSERT INTO notifications (teacher_id, message) VALUES
(1, 'Hello students! @studentjon@gmail.com @studenthon@gmail.com'),
(1, 'Reminder: Exam is on Monday.'),
(2, 'Team meeting at 5 PM today.'),
(3, 'Please submit your projects by Friday.');

SELECT * FROM teachers;
SELECT * FROM students;
SELECT * FROM teacher_students;
SELECT * FROM registrations;
SELECT * FROM notifications;

