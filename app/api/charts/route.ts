import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Fetch all bookings
    const bookings = await db.collection("bookings").find({}).toArray()

    // Generate monthly bookings data
    const monthlyData = bookings.reduce((acc: any, booking: any) => {
      const month = new Date(booking.bookingDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
      if (!acc[month]) {
        acc[month] = { month, bookings: 0, revenue: 0 }
      }
      acc[month].bookings += 1
      if (booking.isPaid) {
        acc[month].revenue += booking.total
      }
      return acc
    }, {})

    // Generate location stats data
    const locationData = bookings.reduce((acc: any, booking: any) => {
      if (!acc[booking.location]) {
        acc[booking.location] = {
          location: booking.location,
          bookings: 0,
          revenue: 0,
        }
      }
      acc[booking.location].bookings += 1
      if (booking.isPaid) {
        acc[booking.location].revenue += booking.total
      }
      return acc
    }, {})

    // Calculate summary stats
    const totalBookings = bookings.length
    const paidBookings = bookings.filter((b: any) => b.isPaid).length
    const totalRevenue = bookings.filter((b: any) => b.isPaid).reduce((sum: number, b: any) => sum + b.total, 0)
    const pendingBookings = totalBookings - paidBookings

    const chartData = {
      monthlyBookings: Object.values(monthlyData),
      locationStats: Object.values(locationData),
      stats: {
        totalBookings,
        paidBookings,
        totalRevenue,
        pendingBookings,
      },
    }

    return NextResponse.json(chartData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
