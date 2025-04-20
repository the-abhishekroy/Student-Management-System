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

export async function GET() {
  try {
    // Get total students
    const students = await query("SELECT COUNT(*) as count FROM students")
    
    // Get student data for chart - by address (example)
    const studentsByAddress = await query(`
      SELECT 
        CASE 
          WHEN address LIKE '%St%' THEN 'Street'
          WHEN address LIKE '%Ave%' THEN 'Avenue'
          WHEN address LIKE '%Rd%' THEN 'Road'
          WHEN address LIKE '%Dr%' THEN 'Drive'
          ELSE 'Other'
        END as location,
        COUNT(*) as count
      FROM students
      GROUP BY location
    `)

    // Get total courses
    const courses = await query("SELECT COUNT(*) as count FROM courses")
    
    // Get course data for chart - by department
    const coursesByDepartment = await query(`
      SELECT 
        department, 
        COUNT(*) as count 
      FROM courses 
      GROUP BY department
    `)

    // Get active enrollments
    const enrollments = await query("SELECT COUNT(*) as count FROM enrollments WHERE status = 'Active'")
    
    // Get enrollment data for chart - by course
    const enrollmentsByCourse = await query(`
      SELECT 
        c.course_name,
        COUNT(e.enrollment_id) as count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.status = 'Active'
      GROUP BY c.course_name
      ORDER BY count DESC
      LIMIT 5
    `)

    // Get today's attendance
    const today = new Date().toISOString().split("T")[0]
    const attendance = await query(
      `
      SELECT status, COUNT(*) as count 
      FROM attendance 
      WHERE date = ? 
      GROUP BY status
    `,
      [today],
    )
    
    // Get attendance data for chart - last 7 days
    const last7Days = await query(`
      SELECT 
        date, 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late
      FROM attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date
      ORDER BY date
    `)

    // Get fee status
    const fees = await query(`
      SELECT status, COUNT(*) as count 
      FROM fees 
      GROUP BY status
    `)

    // Format attendance data
    const attendanceStats = {
      present: 0,
      absent: 0,
      late: 0,
    }

    attendance.forEach((item) => {
      if (item.status === "Present") attendanceStats.present = item.count
      if (item.status === "Absent") attendanceStats.absent = item.count
      if (item.status === "Late") attendanceStats.late = item.count
    })

    // Format fees data
    const feesStats = {
      paid: 0,
      unpaid: 0,
      partial: 0,
    }

    fees.forEach((item) => {
      if (item.status === "Paid") feesStats.paid = item.count
      if (item.status === "Unpaid") feesStats.unpaid = item.count
      if (item.status === "Partial") feesStats.partial = item.count
    })

    return NextResponse.json({
      students: students[0].count,
      studentChartData: studentsByAddress,
      courses: courses[0].count,
      courseChartData: coursesByDepartment,
      enrollments: enrollments[0].count,
      enrollmentChartData: enrollmentsByCourse,
      attendance: attendanceStats,
      attendanceChartData: last7Days,
      fees: feesStats,
      feesChartData: fees,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
