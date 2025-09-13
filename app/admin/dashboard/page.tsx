//@ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { MapPin, Calendar, Users, DollarSign, Eye, TrendingUp, Tent, Star } from "lucide-react"
import type { Booking } from "@/lib/types"

function formatDate(date: string | Date) {
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

function getStatusBadge(booking: Booking) {
  const status = booking?.status?.toLowerCase()
  if (status === "paid") {
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Paid</span>
  }
  if (status === "pending") {
    return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">Pending</span>
  }
  return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Unknown</span>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    paidBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  })
  const [chartData, setChartData] = useState({
    monthlyBookings: [] as Array<{
      month: string
      bookings: number
      revenue: number
    }>,
    locationStats: [] as Array<{
      location: string
      bookings: number
      revenue: number
    }>,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await fetch("/api/stats")
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch chart data from charts API
      const chartResponse = await fetch("/api/charts")
      const chartDataResponse = await chartResponse.json()
      setChartData({
        monthlyBookings: chartDataResponse.monthlyBookings,
        locationStats: chartDataResponse.locationStats,
      })

      // Fetch bookings for table
      const bookingsResponse = await fetch("/api/bookings")
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.bookings || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
              <p className="text-muted-foreground">
                Welcome back, {session?.user?.username}. Here's what's happening with your bookings.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Tent className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">NOMADIC</div>
                <div className="text-xs text-muted-foreground">Glamping Admin</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Confirmed Bookings</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.paidBookings}</div>
              <p className="text-xs text-muted-foreground">Paid and confirmed</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">AED {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From confirmed bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-card-foreground text-lg font-semibold">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Monthly Bookings & Revenue
              </CardTitle>
              <p className="text-sm text-muted-foreground ml-13">Track your monthly performance trends</p>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer
                config={{
                  bookings: {
                    label: "Bookings",
                    color: "hsl(217, 91%, 60%)",
                  },
                  revenue: {
                    label: "Revenue (AED)",
                    color: "hsl(142, 76%, 36%)",
                  },
                }}
                className="h-[320px] w-full"
              >
                <BarChart data={chartData.monthlyBookings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  />
                  <Bar dataKey="bookings" fill="url(#bookingsGradient)" radius={[6, 6, 0, 0]} strokeWidth={0} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-card-foreground text-lg font-semibold">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Bookings by Location
              </CardTitle>
              <p className="text-sm text-muted-foreground ml-13">Popular destinations breakdown</p>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer
                config={{
                  bookings: {
                    label: "Bookings",
                    color: "hsl(142, 76%, 36%)",
                  },
                }}
                className="h-[320px] w-full"
              >
                <BarChart
                  data={chartData.locationStats}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="locationGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="location"
                    type="category"
                    width={80}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  />
                  <Bar dataKey="bookings" fill="url(#locationGradient)" radius={[0, 6, 6, 0]} strokeWidth={0} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Star className="w-5 h-5 mr-2 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-card-foreground">Customer</TableHead>
                      <TableHead className="text-card-foreground">Date</TableHead>
                      <TableHead className="text-card-foreground hidden sm:table-cell">Location</TableHead>
                      <TableHead className="text-card-foreground hidden md:table-cell">Tents</TableHead>
                      <TableHead className="text-card-foreground">Total</TableHead>
                      <TableHead className="text-card-foreground">Status</TableHead>
                      <TableHead className="text-card-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking) => (
                      <TableRow key={booking._id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-card-foreground">{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground hidden sm:block">{booking.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-card-foreground">{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell className="text-card-foreground hidden sm:table-cell">{booking.location}</TableCell>
                        <TableCell className="text-card-foreground hidden md:table-cell">
                          {booking.numberOfTents}
                        </TableCell>
                        <TableCell className="font-medium text-accent">AED {booking.total.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(booking)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                className="border-border text-card-foreground hover:bg-muted"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
