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

// GET a single fee by ID
export async function GET(request, { params }) {
  try {
    const id = params.id
    const fees = await query(
      `
      SELECT f.*, s.name as student_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      WHERE f.fee_id = ?
    `,
      [id],
    )

    if (fees.length === 0) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    return NextResponse.json(fees[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch fee" }, { status: 500 })
  }
}

// PUT (update) a fee
export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { student_id, amount, due_date, status, payment_date, description } = body

    // Validate required fields
    if (!student_id || !amount || !due_date || !status) {
      return NextResponse.json({ error: "Student, amount, due date, and status are required" }, { status: 400 })
    }

    // Check if fee exists
    const fees = await query("SELECT * FROM fees WHERE fee_id = ?", [id])
    if (fees.length === 0) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    // Check if student exists
    const students = await query("SELECT * FROM students WHERE id = ?", [student_id])
    if (students.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    await query(
      "UPDATE fees SET student_id = ?, amount = ?, due_date = ?, status = ?, payment_date = ?, description = ? WHERE fee_id = ?",
      [student_id, amount, due_date, status, payment_date || null, description || null, id],
    )

    return NextResponse.json({ fee_id: Number(id), ...body })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 })
  }
}

// DELETE a fee
export async function DELETE(request, { params }) {
  try {
    const id = params.id

    // Check if fee exists
    const fees = await query("SELECT * FROM fees WHERE fee_id = ?", [id])
    if (fees.length === 0) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    await query("DELETE FROM fees WHERE fee_id = ?", [id])

    return NextResponse.json({ message: "Fee deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete fee" }, { status: 500 })
  }
}
