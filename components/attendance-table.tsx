"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function AttendanceTable({ attendance, loading, onSave }) {
  const [attendanceData, setAttendanceData] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAttendanceData(attendance)
  }, [attendance])

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => prev.map((item) => (item.student_id === studentId ? { ...item, status } : item)))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(attendanceData)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (attendanceData.length === 0) {
    return <div className="text-center py-8 text-gray-500">No students enrolled in this course.</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.map((item) => (
              <TableRow key={item.student_id}>
                <TableCell>{item.student_id}</TableCell>
                <TableCell>{item.student_name}</TableCell>
                <TableCell>
                  <Select
                    value={item.status || "Present"}
                    onValueChange={(value) => handleStatusChange(item.student_id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Attendance
        </Button>
      </div>
    </div>
  )
}
