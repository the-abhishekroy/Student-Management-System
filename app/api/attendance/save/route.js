import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_management",
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Helper function to execute queries
async function query(sql, params) {
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(sql, params)
    return results
  } finally {
    connection.release()
  }
}

// POST to save attendance records
export async function POST(request) {
  try {
    const body = await request.json()
    const { courseId, date, attendance } = body

    if (!courseId || !date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Start a transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      for (const record of attendance) {
        const { student_id, status } = record

        // Check if a record already exists
        const existingRecords = await connection.execute(
          "SELECT * FROM attendance WHERE student_id = ? AND course_id = ? AND date = ?",
          [student_id, courseId, date],
        )

        if (existingRecords[0].length > 0) {
          // Update existing record
          await connection.execute(
            "UPDATE attendance SET status = ? WHERE student_id = ? AND course_id = ? AND date = ?",
            [status, student_id, courseId, date],
          )
        } else {
          // Insert new record
          await connection.execute("INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)", [
            student_id,
            courseId,
            date,
            status,
          ])
        }
      }

      // Commit the transaction
      await connection.commit()
      connection.release()

      return NextResponse.json({ message: "Attendance saved successfully" })
    } catch (error) {
      // Rollback in case of error
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
