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

// GET a single enrollment by ID
export async function GET(request, { params }) {
  try {
    const id = params.id
    const enrollments = await query(
      `
      SELECT e.*, s.name as student_name, c.course_name, c.course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.enrollment_id = ?
    `,
      [id],
    )

    if (enrollments.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json(enrollments[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollment" }, { status: 500 })
  }
}

// PUT (update) an enrollment
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { student_id, course_id, enrollment_date, grade, status } = body

    // Validate required fields
    if (!student_id || !course_id || !enrollment_date) {
      return NextResponse.json({ error: "Student, course, and enrollment date are required" }, { status: 400 })
    }

    // Check if enrollment exists
    const enrollments = await query("SELECT * FROM enrollments WHERE enrollment_id = ?", [id])
    if (enrollments.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
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

    // Check if enrollment already exists for another record
    if (student_id != enrollments[0].student_id || course_id != enrollments[0].course_id) {
      const existingEnrollments = await query(
        "SELECT * FROM enrollments WHERE student_id = ? AND course_id = ? AND enrollment_id != ?",
        [student_id, course_id, id],
      )
      if (existingEnrollments.length > 0) {
        return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 400 })
      }
    }

    await query(
      "UPDATE enrollments SET student_id = ?, course_id = ?, enrollment_date = ?, grade = ?, status = ? WHERE enrollment_id = ?",
      [student_id, course_id, enrollment_date, grade || null, status || "Active", id],
    )

    return NextResponse.json({ enrollment_id: Number(id), ...body })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 })
  }
}

// DELETE an enrollment
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if enrollment exists
    const enrollments = await query("SELECT * FROM enrollments WHERE enrollment_id = ?", [id])
    if (enrollments.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    await query("DELETE FROM enrollments WHERE enrollment_id = ?", [id])

    return NextResponse.json({ message: "Enrollment deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 })
  }
}
