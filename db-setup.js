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
    console.log("Creating students table if not exists...")
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Insert sample data if table is empty
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM students")

    if (rows[0].count === 0) {
      console.log("Inserting sample data...")
      await connection.query(`
        INSERT INTO students (name, email, course, phone, address) VALUES
        ('John Doe', 'john@example.com', 'Computer Science', '123-456-7890', '123 Main St'),
        ('Jane Smith', 'jane@example.com', 'Mathematics', '987-654-3210', '456 Oak Ave'),
        ('Bob Johnson', 'bob@example.com', 'Physics', '555-123-4567', '789 Pine Rd')
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
