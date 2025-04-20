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

// GET all fees with student details
export async function GET() {
  try {
    const fees = await query(`
      SELECT f.*, s.name as student_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      ORDER BY f.fee_id DESC
    `)
    return NextResponse.json(fees)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

// POST a new fee
export async function POST(request) {
  try {
    const body = await request.json()
    const { student_id, amount, due_date, status, payment_date, description } = body

    // Validate required fields
    if (!student_id || !amount || !due_date || !status) {
      return NextResponse.json({ error: "Student, amount, due date, and status are required" }, { status: 400 })
    }

    // Check if student exists
    const students = await query("SELECT * FROM students WHERE id = ?", [student_id])
    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const result = await query(
      "INSERT INTO fees (student_id, amount, due_date, status, payment_date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [student_id, amount, due_date, status, payment_date || null, description || null],
    )

    return NextResponse.json({ fee_id: result.insertId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 })
  }
}
