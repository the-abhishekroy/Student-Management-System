"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CourseList from "@/components/course-list"
import CourseForm from "@/components/course-form"

export default function CoursesPage() {
  const [showForm, setShowForm] = useState(false)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedCourse(null)
    setShowForm(true)
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchCourses()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Courses</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Management</CardTitle>
          <Button onClick={handleAddNew}>Add New Course</Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <CourseForm course={selectedCourse} onClose={handleFormClose} />
          ) : (
            <CourseList courses={courses} onEdit={handleEdit} onRefresh={fetchCourses} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
