import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get all bookings
    const bookings = await db.collection("bookings").find({}).toArray()

    // Calculate stats
    const totalBookings = bookings.length
    const paidBookings = bookings.filter((booking) => booking.status === "paid").length
    const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
    const totalRevenue = bookings
      .filter((booking) => booking.status === "paid")
      .reduce((sum, booking) => sum + (booking.total || 0), 0)

    // Calculate additional metrics
    const averageBookingValue = paidBookings > 0 ? totalRevenue / paidBookings : 0
    const conversionRate = totalBookings > 0 ? (paidBookings / totalBookings) * 100 : 0

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentBookings = bookings.filter((booking) => new Date(booking.createdAt) >= thirtyDaysAgo).length

    const stats = {
      totalBookings,
      paidBookings,
      pendingBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentBookings,
    }

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
