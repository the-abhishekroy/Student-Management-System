"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FeesList from "@/components/fees-list"
import FeesForm from "@/components/fees-form"

export default function FeesPage() {
  const [showForm, setShowForm] = useState(false)
  const [fees, setFees] = useState([])
  const [selectedFee, setSelectedFee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/fees")
      const data = await response.json()
      setFees(data)
    } catch (error) {
      console.error("Error fetching fees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedFee(null)
    setShowForm(true)
  }

  const handleEdit = (fee) => {
    setSelectedFee(fee)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchFees()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Fees</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Management</CardTitle>
          <Button onClick={handleAddNew}>Add New Fee</Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <FeesForm fee={selectedFee} onClose={handleFormClose} />
          ) : (
            <FeesList fees={fees} onEdit={handleEdit} onRefresh={fetchFees} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
