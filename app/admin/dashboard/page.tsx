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

      const bookingsResponse = await fetch("/api/bookings?isPaid=true&limit=10")
      const bookingsData = await bookingsResponse.json()
      setBookings(bookingsData.bookings || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#3C2317] mb-2">Dashboard Overview</h1>
              <p className="text-[#3C2317]/80 text-base">
                Welcome back, {session?.user?.username}. Here's what's happening with your bookings.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3C2317] to-[#5D4037] rounded-xl flex items-center justify-center shadow-lg">
                <Tent className="w-6 h-6 text-[#FBF9D9]" />
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-[#3C2317]">NOMADIC</div>
                <div className="text-sm text-[#3C2317]/60">Glamping Admin</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#FBF9D9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#3C2317]">Total Bookings</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#3C2317] to-[#5D4037] rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-[#FBF9D9]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#3C2317]">{stats.totalBookings}</div>
              <p className="text-xs text-[#3C2317]/60 mt-1">Confirmed paid bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FBF9D9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#3C2317]">Confirmed Bookings</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#84cc16] to-[#65a30d] rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#84cc16]">{stats.paidBookings}</div>
              <p className="text-xs text-[#3C2317]/60 mt-1">Paid and confirmed</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FBF9D9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#3C2317]">Total Revenue</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0891b2]">AED {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-[#3C2317]/60 mt-1">From confirmed bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FBF9D9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#3C2317]">Monthly Average</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#be123c] to-[#9f1239] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#be123c]">
                {stats.totalBookings > 0
                  ? Math.round(stats.totalRevenue / Math.max(1, Math.ceil(stats.totalBookings / 12)))
                  : 0}
              </div>
              <p className="text-xs text-[#3C2317]/60 mt-1">AED per month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-[#FBF9D9]/90 to-[#E6CFA9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-[#D3B88C]/50">
              <CardTitle className="flex items-center text-[#3C2317] text-lg font-semibold">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div>Monthly Bookings & Revenue</div>
                  <p className="text-sm text-[#3C2317]/60 font-normal mt-1">Track your monthly performance trends</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  bookings: {
                    label: "Bookings",
                    color: "#0891b2",
                  },
                  revenue: {
                    label: "Revenue (AED)",
                    color: "#84cc16",
                  },
                }}
                className="h-[320px] w-full"
              >
                <BarChart data={chartData.monthlyBookings} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3B88C" strokeOpacity={0.3} />
                  <XAxis dataKey="month" stroke="#3C2317" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#3C2317" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#D3B88C", opacity: 0.1 }} />
                  <Bar dataKey="bookings" fill="url(#bookingsGradient)" radius={[6, 6, 0, 0]} strokeWidth={0} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FBF9D9]/90 to-[#E6CFA9]/80 backdrop-blur-sm border-[#D3B88C]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-[#D3B88C]/50">
              <CardTitle className="flex items-center text-[#3C2317] text-lg font-semibold">
                <div className="w-12 h-12 bg-gradient-to-br from-[#84cc16] to-[#65a30d] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div>Bookings by Location</div>
                  <p className="text-sm text-[#3C2317]/60 font-normal mt-1">Popular destinations breakdown</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  bookings: {
                    label: "Bookings",
                    color: "#84cc16",
                  },
                }}
                className="h-[320px] w-full"
              >
                <BarChart
                  data={chartData.locationStats}
                  layout="horizontal"
                  margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="locationGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#84cc16" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#84cc16" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3B88C" strokeOpacity={0.3} />
                  <XAxis type="number" stroke="#3C2317" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="location"
                    type="category"
                    width={80}
                    stroke="#3C2317"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#D3B88C", opacity: 0.1 }} />
                  <Bar dataKey="bookings" fill="url(#locationGradient)" radius={[0, 6, 6, 0]} strokeWidth={0} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-[#D3B88C]/30 shadow-xl">
          <CardHeader className="border-b border-[#D3B88C]/20 p-6">
            <CardTitle className="text-[#3C2317] text-xl font-semibold flex items-center">
              <Star className="w-6 h-6 mr-3 text-[#D3B88C]" />
              Recent Paid Orders (Last 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-[#3C2317]/20 rounded-full animate-spin">
                    <div className="absolute inset-0 w-10 h-10 border-4 border-t-[#3C2317] rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#D3B88C]/30 bg-gradient-to-r from-[#3C2317]/90 to-[#5D4037]/90">
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6">Customer</TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6">Date</TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6 hidden sm:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6 hidden md:table-cell">Tents</TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6">Total</TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6">Status</TableHead>
                      <TableHead className="text-[#FBF9D9] font-bold py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking, index) => (
                      <TableRow
                        key={booking._id}
                        className={`border-[#D3B88C]/20 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-[#FBF9D9]/30"
                        }`}
                      >
                        <TableCell className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-[#3C2317]">{booking.customerName}</div>
                            <div className="text-sm text-[#3C2317]/60 hidden sm:block mt-1">
                              {booking.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#3C2317] py-4 px-6">{formatDate(booking.bookingDate)}</TableCell>
                        <TableCell className="text-[#3C2317] hidden sm:table-cell py-4 px-6">
                          {booking.location}
                        </TableCell>
                        <TableCell className="text-[#3C2317] hidden md:table-cell py-4 px-6">
                          {booking.numberOfTents}
                        </TableCell>
                        <TableCell className="font-bold text-[#0891b2] py-4 px-6">
                          AED {booking.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-4 px-6">{getStatusBadge(booking)}</TableCell>
                        <TableCell className="py-4 px-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                className="border-[#D3B88C] text-[#3C2317] bg-white h-9 px-3"
                              >
                                <Eye className="w-4 h-4 mr-2" />
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
