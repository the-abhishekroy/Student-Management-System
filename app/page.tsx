"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, ClipboardList, Calendar, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"

// Chart color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    studentChartData: [],
    courses: 0,
    courseChartData: [],
    enrollments: 0,
    enrollmentChartData: [],
    attendance: { present: 0, absent: 0, late: 0 },
    attendanceChartData: [],
    fees: { paid: 0, unpaid: 0, partial: 0 },
    feesChartData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats.students}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats.courses}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.enrollments}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Student Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.studentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="location"
                  >
                    {stats.studentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Courses Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Courses by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.courseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#00C49F" name="Number of Courses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Enrollments Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Popular Courses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.enrollmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="course_name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FFBB28" name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">7-Day Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stackId="1" stroke="#00C49F" fill="#00C49F" name="Present" />
                  <Area type="monotone" dataKey="absent" stackId="1" stroke="#FF8042" fill="#FF8042" name="Absent" />
                  <Area type="monotone" dataKey="late" stackId="1" stroke="#FFBB28" fill="#FFBB28" name="Late" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fees Chart */}
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Fee Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.feesChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    <Cell fill="#00C49F" name="Paid" />
                    <Cell fill="#FF8042" name="Unpaid" />
                    <Cell fill="#FFBB28" name="Partial" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Present:</span>
                  <span className="font-medium text-green-600">{stats.attendance.present}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Absent:</span>
                  <span className="font-medium text-red-600">{stats.attendance.absent}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Late:</span>
                  <span className="font-medium text-amber-600">{stats.attendance.late}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Paid:</span>
                  <span className="font-medium text-green-600">{stats.fees.paid}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Unpaid:</span>
                  <span className="font-medium text-red-600">{stats.fees.unpaid}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Partial:</span>
                  <span className="font-medium text-amber-600">{stats.fees.partial}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
