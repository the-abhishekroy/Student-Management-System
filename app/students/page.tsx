"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StudentList from "@/components/student-list"
import StudentForm from "@/components/student-form"

export default function StudentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedStudent(null)
    setShowForm(true)
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchStudents()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Students</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Management</CardTitle>
          <Button onClick={handleAddNew}>Add New Student</Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <StudentForm student={selectedStudent} onClose={handleFormClose} />
          ) : (
            <StudentList students={students} onEdit={handleEdit} onRefresh={fetchStudents} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
