"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Loader2 } from "lucide-react"

export default function FeesList({ fees, onEdit, onRefresh, loading }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/fees/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
      } else {
        console.error("Failed to delete fee")
      }
    } catch (error) {
      console.error("Error deleting fee:", error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-500"
      case "Unpaid":
        return "bg-red-500"
      case "Partial":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (fees.length === 0) {
    return <div className="text-center py-8 text-gray-500">No fees found. Add a new fee to get started.</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee.fee_id}>
                <TableCell>{fee.fee_id}</TableCell>
                <TableCell>{fee.student_name}</TableCell>
                <TableCell>{formatCurrency(fee.amount)}</TableCell>
                <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                </TableCell>
                <TableCell>{fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>{fee.description}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(fee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setDeleteId(fee.fee_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
