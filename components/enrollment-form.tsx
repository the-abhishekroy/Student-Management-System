"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function EnrollmentForm({ enrollment, onClose }) {
  const [formData, setFormData] = useState({
    student_id: enrollment?.student_id || "",
    course_id: enrollment?.course_id || "",
    enrollment_date: enrollment?.enrollment_date
      ? new Date(enrollment.enrollment_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    grade: enrollment?.grade || "",
    status: enrollment?.status || "Active",
  })

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function fetchData() {
      try {
        setFetchingData(true)

        // Fetch students
        const studentsResponse = await fetch("/api/students")
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)

        // Fetch courses
        const coursesResponse = await fetch("/api/courses")
        const coursesData = await coursesResponse.json()
        setCourses(coursesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setFetchingData(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.student_id) newErrors.student_id = "Student is required"
    if (!formData.course_id) newErrors.course_id = "Course is required"
    if (!formData.enrollment_date) newErrors.enrollment_date = "Enrollment date is required"
    if (!formData.status) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)

      const url = enrollment ? `/api/enrollments/${enrollment.enrollment_id}` : "/api/enrollments"
      const method = enrollment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose()
      } else {
        const data = await response.json()
        console.error("Error saving enrollment:", data.error)
      }
    } catch (error) {
      console.error("Error saving enrollment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{enrollment ? "Edit Enrollment" : "Add New Enrollment"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student_id">Student</Label>
          <Select value={formData.student_id.toString()} onValueChange={(value) => handleChange("student_id", value)}>
            <SelectTrigger className={errors.student_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.student_id && <p className="text-red-500 text-sm">{errors.student_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_id">Course</Label>
          <Select value={formData.course_id.toString()} onValueChange={(value) => handleChange("course_id", value)}>
            <SelectTrigger className={errors.course_id ? "border-red-500" : ""}>
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
          {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input
            id="enrollment_date"
            type="date"
            value={formData.enrollment_date}
            onChange={(e) => handleChange("enrollment_date", e.target.value)}
            className={errors.enrollment_date ? "border-red-500" : ""}
          />
          {errors.enrollment_date && <p className="text-red-500 text-sm">{errors.enrollment_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={formData.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger className={errors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {enrollment ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  )
}
