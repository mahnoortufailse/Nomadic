"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, Trash2, Calendar, MapPin, Users, DollarSign, Tent } from "lucide-react"
import { toast } from "sonner"
import type { Booking } from "@/lib/types"

export default function OrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, locationFilter, statusFilter])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (locationFilter !== "all") params.append("location", locationFilter)
      if (statusFilter !== "all") params.append("isPaid", statusFilter)

      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    setDeleteLoading(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBookings(bookings.filter((booking) => booking._id !== bookingId))
        toast.success("Booking deleted successfully")
      } else {
        toast.error("Failed to delete booking")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast.error("Failed to delete booking")
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (booking: Booking) => {
    if (booking.isPaid) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
    }
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Tent className="w-8 h-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
              <p className="text-muted-foreground">Manage all booking orders with detailed view and actions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground">Search & Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border focus:border-primary"
                  />
                </div>
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48 border-border">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Desert">Desert</SelectItem>
                  <SelectItem value="Mountain">Mountain</SelectItem>
                  <SelectItem value="Wadi">Wadi</SelectItem>
                  <SelectItem value="Private Events">Private Events</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Paid</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-card-foreground">Order ID</TableHead>
                      <TableHead className="text-card-foreground">Customer</TableHead>
                      <TableHead className="text-card-foreground hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-card-foreground hidden md:table-cell">Location</TableHead>
                      <TableHead className="text-card-foreground hidden lg:table-cell">Tents</TableHead>
                      <TableHead className="text-card-foreground">Total</TableHead>
                      <TableHead className="text-card-foreground">Status</TableHead>
                      <TableHead className="text-card-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking._id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-mono text-sm text-card-foreground">
                          #{booking._id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-card-foreground">{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground hidden sm:block">{booking.customerEmail}</div>
                            <div className="text-sm text-muted-foreground sm:hidden">{booking.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground hidden sm:table-cell">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-primary" />
                            {formatDate(booking.bookingDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground hidden md:table-cell">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-primary" />
                            {booking.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground hidden lg:table-cell">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-primary" />
                            {booking.numberOfTents}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-accent">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            AED {booking.total.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* View Detail Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                  className="border-border text-card-foreground hover:bg-muted"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden sm:inline ml-1">View</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-card-foreground">
                                    Order Details - #{selectedBooking?._id.slice(-6).toUpperCase()}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedBooking && (
                                  <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                            Customer Information
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Name:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.customerName}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Email:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.customerEmail}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Phone:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.customerPhone}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                            Booking Details
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Date:</span>
                                              <span className="font-medium text-card-foreground">
                                                {formatDate(selectedBooking.bookingDate)}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Location:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.location}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tents:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.numberOfTents}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Children:</span>
                                              <span className="font-medium text-card-foreground">
                                                {selectedBooking.hasChildren ? "Yes" : "No"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Standard Add-ons */}
                                    {(selectedBooking.addOns.charcoal ||
                                      selectedBooking.addOns.firewood ||
                                      selectedBooking.addOns.portableToilet) && (
                                      <div>
                                        <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                          Standard Add-ons
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          {selectedBooking.addOns.charcoal && (
                                            <div className="flex items-center text-card-foreground">
                                              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                              Charcoal
                                            </div>
                                          )}
                                          {selectedBooking.addOns.firewood && (
                                            <div className="flex items-center text-card-foreground">
                                              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                              Firewood
                                            </div>
                                          )}
                                          {selectedBooking.addOns.portableToilet && (
                                            <div className="flex items-center text-card-foreground">
                                              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                              Portable Toilet
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {selectedBooking.selectedCustomAddOns &&
                                      selectedBooking.selectedCustomAddOns.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                            Additional Services
                                          </h4>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            {selectedBooking.selectedCustomAddOns.map((addOnId: string) => (
                                              <div key={addOnId} className="flex items-center text-card-foreground">
                                                <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                                                Custom Service #{addOnId.slice(-4)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                    {selectedBooking.notes && (
                                      <div>
                                        <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                          Special Notes
                                        </h4>
                                        <p className="text-sm text-card-foreground bg-muted p-3 rounded-lg">
                                          {selectedBooking.notes}
                                        </p>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="font-medium mb-3 text-card-foreground border-b border-border pb-2">
                                        Payment Summary
                                      </h4>
                                      <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Subtotal:</span>
                                          <span className="font-medium text-card-foreground">
                                            AED {selectedBooking.subtotal.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">VAT (5%):</span>
                                          <span className="font-medium text-card-foreground">
                                            AED {selectedBooking.vat.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2">
                                          <span className="font-medium text-card-foreground">Total:</span>
                                          <span className="font-bold text-accent">
                                            AED {selectedBooking.total.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span>{getStatusBadge(selectedBooking)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Delete Action */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent"
                                  disabled={deleteLoading === booking._id}
                                >
                                  {deleteLoading === booking._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                  <span className="hidden sm:inline ml-1">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-destructive">Delete Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this order? This action cannot be undone.
                                    <br />
                                    <br />
                                    <strong>Order:</strong> #{booking._id.slice(-6).toUpperCase()}
                                    <br />
                                    <strong>Customer:</strong> {booking.customerName}
                                    <br />
                                    <strong>Total:</strong> AED {booking.total.toFixed(2)}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border text-muted-foreground">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBooking(booking._id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground mb-2">No orders found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
