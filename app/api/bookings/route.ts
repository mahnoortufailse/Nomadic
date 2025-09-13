import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Booking, BookingFormData } from "@/lib/types"
import { calculateBookingPrice, fetchPricingSettings } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const data: BookingFormData & { selectedCustomAddOns?: string[] } = await request.json()

    // Validate required fields
    if (
      !data.customerName ||
      !data.customerEmail ||
      !data.customerPhone ||
      !data.bookingDate ||
      !data.location ||
      !data.numberOfTents
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate business rules
    if (data.numberOfTents < 1 || data.numberOfTents > 5) {
      return NextResponse.json({ error: "Number of tents must be between 1 and 5" }, { status: 400 })
    }

    if (data.location === "Wadi" && data.numberOfTents < 2) {
      return NextResponse.json({ error: "Wadi location requires at least 2 tents" }, { status: 400 })
    }

    // Validate phone number (+971)
    if (!data.customerPhone.startsWith("+971")) {
      return NextResponse.json({ error: "Phone number must start with +971" }, { status: 400 })
    }

    // Validate booking date (minimum today + 2)
    const bookingDate = new Date(data.bookingDate)
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 2)

    if (bookingDate < minDate) {
      return NextResponse.json({ error: "Booking date must be at least 2 days from today" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check date/location lock
    const existingLock = await db.collection("dateLocationLocks").findOne({
      date: bookingDate,
    })

    if (existingLock && existingLock.lockedLocation !== data.location) {
      return NextResponse.json(
        { error: `This date is already booked for ${existingLock.lockedLocation} location` },
        { status: 400 },
      )
    }

    const settings = await fetchPricingSettings()

    const customAddOnsWithSelection = (settings.customAddOns || []).map((addon: any) => ({
      ...addon,
      selected: data.selectedCustomAddOns?.includes(addon.id) || false,
    }))

    // Calculate pricing with current settings
    const pricing = calculateBookingPrice(
      data.numberOfTents,
      data.location,
      data.addOns,
      data.hasChildren,
      customAddOnsWithSelection,
      settings,
    )

    // Create booking
    const booking: Omit<Booking, "_id"> = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      bookingDate,
      location: data.location,
      numberOfTents: data.numberOfTents,
      addOns: data.addOns,
      hasChildren: data.hasChildren,
      notes: data.notes,
      subtotal: pricing.subtotal,
      vat: pricing.vat,
      total: pricing.total,
      selectedCustomAddOns: data.selectedCustomAddOns || [],
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("bookings").insertOne(booking)

    return NextResponse.json({
      bookingId: result.insertedId,
      pricing,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const isPaid = searchParams.get("isPaid")

    const db = await getDatabase()

    // Build filter
    const filter: any = {}

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ]
    }

    if (location) {
      filter.location = location
    }

    if (isPaid !== null) {
      filter.isPaid = isPaid === "true"
    }

    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      db.collection("bookings").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("bookings").countDocuments(filter),
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
