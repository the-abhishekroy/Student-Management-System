"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function CourseForm({ course, onClose }) {
  const [formData, setFormData] = useState({
    course_name: course?.course_name || "",
    course_code: course?.course_code || "",
    credits: course?.credits || "",
    department: course?.department || "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.course_name.trim()) newErrors.course_name = "Course name is required"
    if (!formData.course_code.trim()) newErrors.course_code = "Course code is required"
    if (!formData.credits) newErrors.credits = "Credits are required"
    if (isNaN(formData.credits) || Number.parseInt(formData.credits) <= 0) {
      newErrors.credits = "Credits must be a positive number"
    }
    if (!formData.department.trim()) newErrors.department = "Department is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)

      const url = course ? `/api/courses/${course.course_id}` : "/api/courses"
      const method = course ? "PUT" : "POST"

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
        console.error("Error saving course:", data.error)
      }
    } catch (error) {
      console.error("Error saving course:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{course ? "Edit Course" : "Add New Course"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course_name">Course Name</Label>
          <Input
            id="course_name"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            className={errors.course_name ? "border-red-500" : ""}
          />
          {errors.course_name && <p className="text-red-500 text-sm">{errors.course_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_code">Course Code</Label>
          <Input
            id="course_code"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            className={errors.course_code ? "border-red-500" : ""}
          />
          {errors.course_code && <p className="text-red-500 text-sm">{errors.course_code}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleChange}
            className={errors.credits ? "border-red-500" : ""}
          />
          {errors.credits && <p className="text-red-500 text-sm">{errors.credits}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={errors.department ? "border-red-500" : ""}
          />
          {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {course ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  )
}
