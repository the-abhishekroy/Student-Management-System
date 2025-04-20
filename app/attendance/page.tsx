"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import AttendanceTable from "@/components/attendance-table"

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [courseId, setCourseId] = useState("")
  const [courses, setCourses] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingCourses, setFetchingCourses] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (courseId) {
      fetchAttendance()
    }
  }, [courseId, date])

  const fetchCourses = async () => {
    try {
      setFetchingCourses(true)
      const response = await fetch("/api/courses")
      const data = await response.json()
      setCourses(data)
      if (data.length > 0) {
        setCourseId(data[0].course_id.toString())
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setFetchingCourses(false)
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/attendance?courseId=${courseId}&date=${date}`)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttendance = async (updatedAttendance) => {
    try {
      setLoading(true)
      const response = await fetch("/api/attendance/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          date,
          attendance: updatedAttendance,
        }),
      })

      if (response.ok) {
        fetchAttendance()
      } else {
        console.error("Failed to save attendance")
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              {fetchingCourses ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading courses...</span>
                </div>
              ) : (
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.course_id} value={course.course_id.toString()}>
                        {course.course_name} ({course.course_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {courseId ? (
            <AttendanceTable attendance={attendance} loading={loading} onSave={handleSaveAttendance} />
          ) : (
            <div className="text-center py-8 text-gray-500">Please select a course to view attendance.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
