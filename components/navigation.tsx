"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BookOpen, ClipboardList, Calendar, DollarSign, LayoutDashboard } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/students", label: "Students", icon: <Users className="h-5 w-5" /> },
    { href: "/courses", label: "Courses", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/enrollments", label: "Enrollments", icon: <ClipboardList className="h-5 w-5" /> },
    { href: "/attendance", label: "Attendance", icon: <Calendar className="h-5 w-5" /> },
    { href: "/fees", label: "Fees", icon: <DollarSign className="h-5 w-5" /> },
  ]

  return (
    <nav className="bg-gradient-to-b from-blue-800 to-blue-900 p-4 md:p-6 h-full min-h-screen shadow-lg">
      <div className="mb-8">
        <h1 className="text-white text-xl font-bold">Student Manager</h1>
      </div>
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-md transition-all duration-200 ${
                isActive 
                  ? "bg-white text-blue-900 font-medium shadow-md" 
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
