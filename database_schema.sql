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
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_student (teacher_id, student_id) -- Unique constraint
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
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


INSERT INTO notifications (teacher_id, student_id, message) VALUES
(1, 1, 'Hello students!'),
(1, 2, 'Hello students!'),
(1, 3, 'Hello students!'),
(2, 5, 'Meeting at 3 PM'),
(3, 6, 'Exam on Friday');


SELECT * FROM teachers;
SELECT * FROM students;
SELECT * FROM teacher_students;
SELECT * FROM notifications;

