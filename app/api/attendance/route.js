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

// GET attendance for a specific course and date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const date = searchParams.get("date")

    if (!courseId || !date) {
      return NextResponse.json({ error: "Course ID and date are required" }, { status: 400 })
    }

    // Get all students enrolled in the course
    const enrolledStudents = await query(
      `
      SELECT s.id as student_id, s.name as student_name
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = ? AND e.status = 'Active'
      ORDER BY s.name
    `,
      [courseId],
    )

    // Get attendance records for the specified date and course
    const attendanceRecords = await query(
      `
      SELECT a.student_id, a.status
      FROM attendance a
      WHERE a.course_id = ? AND a.date = ?
    `,
      [courseId, date],
    )

    // Merge the data
    const attendanceData = enrolledStudents.map((student) => {
      const record = attendanceRecords.find((r) => r.student_id === student.student_id)
      return {
        ...student,
        status: record ? record.status : "Present", // Default to Present if no record exists
        attendance_id: record ? record.attendance_id : null,
      }
    })

    return NextResponse.json(attendanceData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
