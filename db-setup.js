import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
}

async function setupDatabase() {
  let connection

  try {
    // Create connection
    console.log("Connecting to MySQL...")
    connection = await mysql.createConnection(dbConfig)

    // Create database if it doesn't exist
    console.log("Creating database if not exists...")
    await connection.query("CREATE DATABASE IF NOT EXISTS student_management")

    // Use the database
    console.log("Using student_management database...")
    await connection.query("USE student_management")

    // Create students table if it doesn't exist
    console.log("Creating students table...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create courses table
    console.log("Creating courses table...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        course_id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(100) NOT NULL,
        course_code VARCHAR(20) NOT NULL UNIQUE,
        credits INT NOT NULL,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create enrollment table
    console.log("Creating enrollment table...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        grade VARCHAR(5),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        UNIQUE KEY (student_id, course_id)
      )
    `)

    // Create attendance table
    console.log("Creating attendance table...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        UNIQUE KEY (student_id, course_id, date)
      )
    `)

    // Create fees table
    console.log("Creating fees table...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fees (
        fee_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('Paid', 'Unpaid', 'Partial') NOT NULL DEFAULT 'Unpaid',
        payment_date DATE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `)

    // Insert sample data if tables are empty
    const [studentRows] = await connection.query("SELECT COUNT(*) as count FROM students")
    if (studentRows[0].count === 0) {
      console.log("Inserting sample student data...")
      await connection.query(`
        INSERT INTO students (name, email, phone, address) VALUES
        ('John Doe', 'john@example.com', '123-456-7890', '123 Main St'),
        ('Jane Smith', 'jane@example.com', '987-654-3210', '456 Oak Ave'),
        ('Bob Johnson', 'bob@example.com', '555-123-4567', '789 Pine Rd'),
        ('Alice Williams', 'alice@example.com', '555-987-6543', '101 Maple Dr'),
        ('Charlie Brown', 'charlie@example.com', '555-555-5555', '202 Elm St')
      `)
    }

    const [courseRows] = await connection.query("SELECT COUNT(*) as count FROM courses")
    if (courseRows[0].count === 0) {
      console.log("Inserting sample course data...")
      await connection.query(`
        INSERT INTO courses (course_name, course_code, credits, department) VALUES
        ('Introduction to Computer Science', 'CS101', 3, 'Computer Science'),
        ('Calculus I', 'MATH101', 4, 'Mathematics'),
        ('Physics for Engineers', 'PHYS201', 4, 'Physics'),
        ('Database Systems', 'CS305', 3, 'Computer Science'),
        ('English Composition', 'ENG101', 3, 'English')
      `)
    }

    // Continue with other inserts AFTER students and courses are inserted
    const [enrollmentRows] = await connection.query("SELECT COUNT(*) as count FROM enrollments")
    if (enrollmentRows[0].count === 0) {
      console.log("Inserting sample enrollment data...")
      await connection.query(`
        INSERT INTO enrollments (student_id, course_id, enrollment_date, grade, status) VALUES
        (1, 1, '2023-09-01', 'A', 'Active'),
        (1, 2, '2023-09-01', 'B+', 'Active'),
        (2, 1, '2023-09-02', 'A-', 'Active'),
        (2, 3, '2023-09-02', NULL, 'Active'),
        (3, 2, '2023-09-03', 'B', 'Active'),
        (3, 4, '2023-09-03', NULL, 'Active'),
        (4, 5, '2023-09-04', 'A', 'Active'),
        (5, 3, '2023-09-05', 'C+', 'Active')
      `)
    }

    const [attendanceRows] = await connection.query("SELECT COUNT(*) as count FROM attendance")
    if (attendanceRows[0].count === 0) {
      console.log("Inserting sample attendance data...")
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      await connection.query(`
        INSERT INTO attendance (student_id, course_id, date, status) VALUES
        (1, 1, '${yesterday}', 'Present'),
        (1, 2, '${yesterday}', 'Present'),
        (2, 1, '${yesterday}', 'Absent'),
        (2, 3, '${yesterday}', 'Present'),
        (3, 2, '${yesterday}', 'Present'),
        (1, 1, '${today}', 'Present'),
        (1, 2, '${today}', 'Late'),
        (2, 1, '${today}', 'Present'),
        (2, 3, '${today}', 'Present'),
        (3, 2, '${today}', 'Absent')
      `)
    }

    const [feesRows] = await connection.query("SELECT COUNT(*) as count FROM fees")
    if (feesRows[0].count === 0) {
      console.log("Inserting sample fees data...")
      await connection.query(`
        INSERT INTO fees (student_id, amount, due_date, status, payment_date, description) VALUES
        (1, 1500.00, '2023-09-15', 'Paid', '2023-09-10', 'Tuition Fee - Fall 2023'),
        (2, 1500.00, '2023-09-15', 'Paid', '2023-09-12', 'Tuition Fee - Fall 2023'),
        (3, 1500.00, '2023-09-15', 'Unpaid', NULL, 'Tuition Fee - Fall 2023'),
        (4, 1500.00, '2023-09-15', 'Partial', '2023-09-14', 'Tuition Fee - Fall 2023'),
        (5, 1500.00, '2023-09-15', 'Unpaid', NULL, 'Tuition Fee - Fall 2023'),
        (1, 200.00, '2023-10-15', 'Unpaid', NULL, 'Lab Fee - Fall 2023'),
        (2, 200.00, '2023-10-15', 'Unpaid', NULL, 'Lab Fee - Fall 2023')
      `)
    }

    console.log("Database setup completed successfully!")
    console.log("\nTo start the application:")
    console.log("1. Make sure XAMPP MySQL service is running")
    console.log('2. Run "npm run dev" to start the Next.js application')
    console.log("3. Open http://localhost:3000 in your browser")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

setupDatabase()
