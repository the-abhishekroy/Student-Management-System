"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function FeesForm({ fee, onClose }) {
  const [formData, setFormData] = useState({
    student_id: fee?.student_id || "",
    amount: fee?.amount || "",
    due_date: fee?.due_date
      ? new Date(fee.due_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: fee?.status || "Unpaid",
    payment_date: fee?.payment_date ? new Date(fee.payment_date).toISOString().split("T")[0] : "",
    description: fee?.description || "",
  })

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function fetchStudents() {
      try {
        setFetchingStudents(true)
        const response = await fetch("/api/students")
        const data = await response.json()
        setStudents(data)
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setFetchingStudents(false)
      }
    }

    fetchStudents()
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
    if (!formData.amount) newErrors.amount = "Amount is required"
    if (isNaN(formData.amount) || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }
    if (!formData.due_date) newErrors.due_date = "Due date is required"
    if (!formData.status) newErrors.status = "Status is required"

    // If status is Paid or Partial, payment date is required
    if ((formData.status === "Paid" || formData.status === "Partial") && !formData.payment_date) {
      newErrors.payment_date = "Payment date is required for Paid or Partial status"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)

      const url = fee ? `/api/fees/${fee.fee_id}` : "/api/fees"
      const method = fee ? "PUT" : "POST"

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
        console.error("Error saving fee:", data.error)
      }
    } catch (error) {
      console.error("Error saving fee:", error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingStudents) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{fee ? "Edit Fee" : "Add New Fee"}</h2>

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
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange("due_date", e.target.value)}
            className={errors.due_date ? "border-red-500" : ""}
          />
          {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger className={errors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => handleChange("payment_date", e.target.value)}
            disabled={formData.status === "Unpaid"}
            className={errors.payment_date ? "border-red-500" : ""}
          />
          {errors.payment_date && <p className="text-red-500 text-sm">{errors.payment_date}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Fee description"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {fee ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  )
}
