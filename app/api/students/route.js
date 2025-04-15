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

// GET all students
export async function GET() {
  try {
    const students = await query("SELECT * FROM students ORDER BY id DESC")
    return NextResponse.json(students)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST a new student
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, course, phone, address } = body

    // Validate required fields
    if (!name || !email || !course) {
      return NextResponse.json({ error: "Name, email, and course are required" }, { status: 400 })
    }

    const result = await query("INSERT INTO students (name, email, course, phone, address) VALUES (?, ?, ?, ?, ?)", [
      name,
      email,
      course,
      phone || null,
      address || null,
    ])

    return NextResponse.json({ id: result.insertId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
