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

// GET a single student by ID
export async function GET(request, { params }) {
  try {
    const id = params.id
    const students = await query("SELECT * FROM students WHERE id = ?", [id])

    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(students[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

// PUT (update) a student
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, email, course, phone, address } = body

    // Validate required fields
    if (!name || !email || !course) {
      return NextResponse.json({ error: "Name, email, and course are required" }, { status: 400 })
    }

    // Check if student exists
    const students = await query("SELECT * FROM students WHERE id = ?", [id])
    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    await query("UPDATE students SET name = ?, email = ?, course = ?, phone = ?, address = ? WHERE id = ?", [
      name,
      email,
      course,
      phone || null,
      address || null,
      id,
    ])

    return NextResponse.json({ id: Number(id), ...body })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
  }
}

// DELETE a student
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if student exists
    const students = await query("SELECT * FROM students WHERE id = ?", [id])
    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    await query("DELETE FROM students WHERE id = ?", [id])

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
