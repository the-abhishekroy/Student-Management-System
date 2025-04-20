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

// GET a single course by ID
export async function GET(request, { params }) {
  try {
    const id = params.id
    const courses = await query("SELECT * FROM courses WHERE course_id = ?", [id])

    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(courses[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

// PUT (update) a course
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { course_name, course_code, credits, department } = body

    // Validate required fields
    if (!course_name || !course_code || !credits) {
      return NextResponse.json({ error: "Course name, code, and credits are required" }, { status: 400 })
    }

    // Check if course exists
    const courses = await query("SELECT * FROM courses WHERE course_id = ?", [id])
    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    await query(
      "UPDATE courses SET course_name = ?, course_code = ?, credits = ?, department = ? WHERE course_id = ?",
      [course_name, course_code, credits, department || null, id],
    )

    return NextResponse.json({ course_id: Number(id), ...body })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

// DELETE a course
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if course exists
    const courses = await query("SELECT * FROM courses WHERE course_id = ?", [id])
    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    await query("DELETE FROM courses WHERE course_id = ?", [id])

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
