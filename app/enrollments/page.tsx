"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EnrollmentList from "@/components/enrollment-list"
import EnrollmentForm from "@/components/enrollment-form"

export default function EnrollmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/enrollments")
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedEnrollment(null)
    setShowForm(true)
  }

  const handleEdit = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchEnrollments()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Enrollments</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enrollment Management</CardTitle>
          <Button onClick={handleAddNew}>Add New Enrollment</Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <EnrollmentForm enrollment={selectedEnrollment} onClose={handleFormClose} />
          ) : (
            <EnrollmentList
              enrollments={enrollments}
              onEdit={handleEdit}
              onRefresh={fetchEnrollments}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
