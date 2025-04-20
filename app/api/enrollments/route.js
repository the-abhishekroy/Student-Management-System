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

// GET all enrollments with student and course details
export async function GET() {
  try {
    const enrollments = await query(`
      SELECT e.*, s.name as student_name, c.course_name, c.course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.course_id
      ORDER BY e.enrollment_id DESC
    `)
    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

// POST a new enrollment
export async function POST(request) {
  try {
    const body = await request.json()
    const { student_id, course_id, enrollment_date, grade, status } = body

    // Validate required fields
    if (!student_id || !course_id || !enrollment_date) {
      return NextResponse.json({ error: "Student, course, and enrollment date are required" }, { status: 400 })
    }

    // Check if student exists
    const students = await query("SELECT * FROM students WHERE id = ?", [student_id])
    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if course exists
    const courses = await query("SELECT * FROM courses WHERE course_id = ?", [course_id])
    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if enrollment already exists
    const existingEnrollments = await query("SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?", [
      student_id,
      course_id,
    ])
    if (existingEnrollments.length > 0) {
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 400 })
    }

    const result = await query(
      "INSERT INTO enrollments (student_id, course_id, enrollment_date, grade, status) VALUES (?, ?, ?, ?, ?)",
      [student_id, course_id, enrollment_date, grade || null, status || "Active"],
    )

    return NextResponse.json({ enrollment_id: result.insertId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}
