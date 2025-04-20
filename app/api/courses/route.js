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

// GET all courses
export async function GET() {
  try {
    const courses = await query("SELECT * FROM courses ORDER BY course_id DESC")
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST a new course
export async function POST(request) {
  try {
    const body = await request.json()
    const { course_name, course_code, credits, department } = body

    // Validate required fields
    if (!course_name || !course_code || !credits) {
      return NextResponse.json({ error: "Course name, code, and credits are required" }, { status: 400 })
    }

    const result = await query(
      "INSERT INTO courses (course_name, course_code, credits, department) VALUES (?, ?, ?, ?)",
      [course_name, course_code, credits, department || null],
    )

    return NextResponse.json({ course_id: result.insertId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
