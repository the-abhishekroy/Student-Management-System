"use client"

import { useState, useEffect } from "react"
import { Search, Plus, RefreshCw, FileDown, Filter, PieChart } from "lucide-react"
import StudentList from "@/components/student-list"
import StudentForm from "@/components/student-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Define TypeScript interfaces for better type safety
interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  enrollmentDate: string;
  [key: string]: any; // Allow for additional properties
}

export default function Home() {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<string>("name-asc")
  const [showStats, setShowStats] = useState<boolean>(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students")
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setStudents(data as Student[])
      toast({
        title: "Students loaded",
        description: `Successfully loaded ${data.length} students`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedStudent(null)
    setShowForm(true)
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchStudents()
  }

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Course", "Enrollment Date"]
    const csvData = students.map(student => 
      [student.id, student.name, student.email, student.course, student.enrollmentDate]
    )
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `student_data_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    
    // Clean up by revoking object URL
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const filteredStudents = students.filter(student => {
    // Safely handle potentially undefined values with optional chaining and nullish coalescing
    const studentName = student.name?.toLowerCase() || '';
    const studentEmail = student.email?.toLowerCase() || '';
    const studentCourse = student.course?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return studentName.includes(searchTermLower) || 
           studentEmail.includes(searchTermLower) ||
           studentCourse.includes(searchTermLower);
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortOrder === "name-asc") return (a.name || '').localeCompare(b.name || '')
    if (sortOrder === "name-desc") return (b.name || '').localeCompare(a.name || '')
    return 0
  })

  // Calculate stats for the dashboard
  const totalStudents = students.length
  
  // Group students by course for stats
  const courseStats = students.reduce((acc, student) => {
    const course = student.course || 'Unknown'
    acc[course] = (acc[course] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Management System</h1>
                <p className="text-muted-foreground mt-1">Manage your students and their enrollment information</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowStats(!showStats)} variant="outline" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span className="hidden sm:inline">{showStats ? "Hide Stats" : "Show Stats"}</span>
                </Button>
                <Button onClick={fetchStudents} variant="outline" size="icon" title="Refresh data">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
                <Button onClick={handleAddNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Student</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showStats && (
          <Card>
            <CardHeader>
              <CardTitle>Student Statistics</CardTitle>
              <CardDescription>Overview of student enrollment data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-blue-700">Across all courses</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                  <p className="text-sm font-medium text-purple-600">Average Enrollment</p>
                  <p className="text-2xl font-bold">
                    {Object.keys(courseStats).length > 0 
                      ? (totalStudents / Object.keys(courseStats).length).toFixed(1) 
                      : '0'}
                  </p>
                  <p className="text-sm text-purple-700">Students per course</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Enrollment by Course</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(courseStats).map(([course, count]) => (
                    <Badge key={course} variant="outline" className="text-xs py-1">
                      {course}: {count} student{count !== 1 ? 's' : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm ? (
          <Card className="shadow-md border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle>{selectedStudent ? "Edit Student" : "Add New Student"}</CardTitle>
              <CardDescription>
                {selectedStudent 
                  ? "Update the student information below" 
                  : "Fill in the details to add a new student"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentForm student={selectedStudent} onClose={handleFormClose} />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or course..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sort:</span>
                  </div>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <StudentList 
                  students={sortedStudents} 
                  onEdit={handleEdit} 
                  onRefresh={fetchStudents} 
                  loading={loading} 
                />
              )}
              
              {sortedStudents.length === 0 && !loading && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                  <h3 className="text-lg font-medium">No students found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm 
                      ? "Try adjusting your search query" 
                      : "Add a student to get started"}
                  </p>
                  <Button onClick={handleAddNew} className="mt-4 bg-indigo-600 hover:bg-indigo-700">Add Student</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
