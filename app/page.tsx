//@ts-nocheck
"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Users, Plus, Minus, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { calculateBookingPrice, fetchPricingSettings } from "@/lib/pricing"
import type { BookingFormData, Settings } from "@/lib/types"

export default function BookingPage() {
  const [guestCount, setGuestCount] = useState(2)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const isUserInteracting = useRef(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const interactionTimeoutRef = useRef<NodeJS.Timeout>()
  const isRefreshing = useRef(false)

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "+971",
    bookingDate: "",
    location: "Desert",
    numberOfTents: 1,
    addOns: {
      charcoal: false,
      firewood: false,
      portableToilet: false,
    },
    hasChildren: false,
    notes: "",
  })

  const [selectedCustomAddOns, setSelectedCustomAddOns] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [pricing, setPricing] = useState(calculateBookingPrice(1, "Desert", formData.addOns, false))
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const campingImages = [
    {
      src: "/desert-camping-with-tents-under-starry-sky.jpg",
      alt: "Desert camping with tents under starry sky",
    },
    {
      src: "/desert-landscape-with-sand-dunes-and-warm-golden-l.jpg",
      alt: "Desert landscape with sand dunes",
    },
    {
      src: "/wadi-valley-camping-with-water-pools-and-palm-tree.jpg",
      alt: "Wadi valley camping with water pools",
    },
    {
      src: "/mountain-camping-with-rocky-peaks-and-tents.jpg",
      alt: "Mountain camping with rocky peaks",
    },
    {
      src: "/desert-landscape-with-sand-dunes-and-warm-golden-l.jpg",
      alt: "Private event camping setup",
    },
  ]

  useEffect(() => {
    const loadSettings = async () => {
      if (isRefreshing.current) return

      try {
        setLoadingSettings(true)
        isRefreshing.current = true
        const settingsData = await fetchPricingSettings()
        setSettings(settingsData)
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoadingSettings(false)
        isRefreshing.current = false
      }
    }
    loadSettings()
  }, [])

  const refreshSettings = useCallback(async () => {
    if (!isUserInteracting.current && !isRefreshing.current) {
      console.log("[v0] Refreshing settings - user not interacting")
      try {
        isRefreshing.current = true
        const settingsData = await fetchPricingSettings()
        setSettings(settingsData)
      } catch (error) {
        console.error("Failed to refresh settings:", error)
      } finally {
        isRefreshing.current = false
      }
    } else {
      console.log("[v0] Skipping refresh - user is interacting or already refreshing")
    }
  }, [])

  useEffect(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshSettings()
        scheduleRefresh()
      }, 30000)
    }

    scheduleRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [refreshSettings])

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 2)

  useEffect(() => {
    if (!settings) return

    const customAddOnsWithSelection = (settings.customAddOns || []).map((addon) => ({
      ...addon,
      selected: selectedCustomAddOns.includes(addon.id),
    }))

    const newPricing = calculateBookingPrice(
      formData.numberOfTents,
      formData.location,
      formData.addOns,
      formData.hasChildren,
      customAddOnsWithSelection,
      settings,
    )
    setPricing(newPricing)
  }, [formData.numberOfTents, formData.location, formData.addOns, formData.hasChildren, selectedCustomAddOns, settings])

  const setUserInteracting = useCallback((interacting: boolean, duration = 5000) => {
    console.log(`[v0] Setting user interaction: ${interacting}`)
    isUserInteracting.current = interacting

    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
    }

    if (interacting) {
      interactionTimeoutRef.current = setTimeout(() => {
        console.log("[v0] User interaction timeout - setting to false")
        isUserInteracting.current = false
      }, duration)
    }
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    setUserInteracting(true)
    setSelectedDate(date)
    setFormData((prev) => ({
      ...prev,
      bookingDate: date ? date.toISOString().split("T")[0] : "",
    }))
    setTouched((prev) => ({ ...prev, bookingDate: true }))

    if (date) {
      const newErrors = { ...errors }
      delete newErrors.bookingDate
      setErrors(newErrors)
    }
  }

  const handleTentChange = (increment: boolean) => {
    setUserInteracting(true)
    const newCount = increment ? formData.numberOfTents + 1 : formData.numberOfTents - 1
    if (newCount >= 1 && newCount <= 5) {
      setFormData((prev) => ({ ...prev, numberOfTents: newCount }))
      setTouched((prev) => ({ ...prev, numberOfTents: true }))

      if (formData.location === "Wadi") {
        const newErrors = { ...errors }
        if (newCount < 2) {
          newErrors.numberOfTents = "Wadi location requires at least 2 tents"
        } else {
          delete newErrors.numberOfTents
        }
        setErrors(newErrors)
      }
    }
  }

  const handleGuestChange = (increment: boolean) => {
    setUserInteracting(true, 3000) // Shorter timeout for guest count
    const newCount = increment ? guestCount + 1 : guestCount - 1
    if (newCount >= 1 && newCount <= 20) {
      setGuestCount(newCount)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string | boolean) => {
    setUserInteracting(true)
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))

    if (typeof value === "string") {
      validateField(field, value)
    }
  }

  const handleAddOnChange = (addOn: keyof typeof formData.addOns, checked: boolean) => {
    setUserInteracting(true)
    setFormData((prev) => ({
      ...prev,
      addOns: { ...prev.addOns, [addOn]: checked },
    }))
  }

  const handleCustomAddOnChange = (addOnId: string, checked: boolean) => {
    setUserInteracting(true)
    setSelectedCustomAddOns((prev) => (checked ? [...prev, addOnId] : prev.filter((id) => id !== addOnId)))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) newErrors.customerName = "Name is required"
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }

    if (!formData.customerPhone.startsWith("+971") || formData.customerPhone.length < 12) {
      newErrors.customerPhone = "Valid UAE phone number required (+971501234567)"
    }
    if (!formData.bookingDate) newErrors.bookingDate = "Booking date is required"
    if (formData.location === "Wadi" && formData.numberOfTents < 2) {
      newErrors.numberOfTents = "Wadi location requires at least 2 tents"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "customerName":
        if (!value.trim()) {
          newErrors.customerName = "Name is required"
        } else {
          delete newErrors.customerName
        }
        break
      case "customerEmail":
        if (!value.trim()) {
          newErrors.customerEmail = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.customerEmail = "Please enter a valid email address"
        } else {
          delete newErrors.customerEmail
        }
        break
      case "customerPhone":
        if (!value.startsWith("+971") || value.length < 12) {
          newErrors.customerPhone = "Valid UAE phone number required (+971501234567)"
        } else {
          delete newErrors.customerPhone
        }
        break
      case "bookingDate":
        if (!value) {
          newErrors.bookingDate = "Booking date is required"
        } else {
          delete newErrors.bookingDate
        }
        break
      case "numberOfTents":
        if (formData.location === "Wadi" && formData.numberOfTents < 2) {
          newErrors.numberOfTents = "Wadi location requires at least 2 tents"
        } else {
          delete newErrors.numberOfTents
        }
        break
    }

    setErrors(newErrors)
  }

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, value)
    setUserInteracting(true, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched = {
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      bookingDate: true,
      numberOfTents: true,
    }
    setTouched(allTouched)

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const element = document.getElementById(firstError)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
      return
    }

    if (formData.numberOfTents > 5) {
      alert("For bookings with more than 5 tents, please contact us directly for a custom quote.")
      return
    }

    setIsLoading(true)

    try {
      const bookingData = {
        ...formData,
        selectedCustomAddOns,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create booking")
      }

      const { bookingId } = await response.json()

      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          ...formData,
          selectedCustomAddOns,
          pricing,
        }),
      })

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await checkoutResponse.json()
      window.location.href = url
    } catch (error) {
      console.error("Booking error:", error)
      alert(error instanceof Error ? error.message : "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    console.log("[v0] Manual refresh triggered")
    isUserInteracting.current = false
    await refreshSettings()
  }

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading booking system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold tracking-wide text-slate-800">NOMADIC</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={campingImages[currentImageIndex].src || "/placeholder.svg"}
                  alt={campingImages[currentImageIndex].alt}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm" className="bg-white/90 text-slate-800 hover:bg-white">
                    View Photos
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {campingImages.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative h-44 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setCurrentImageIndex(index + 1)}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Nomadic ⭐ Camping Setup</h1>
            <div className="flex items-center space-x-4 text-slate-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Desert • Wadi • Mountain
              </span>
              <span>★★★★★ Private</span>
            </div>
            <p className="text-slate-700 mt-2">The UAE's most luxurious camping experience</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="">
                <CardTitle className="text-slate-800">Who's going?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-700 mb-4">
                  Each tent can sleep up to 4 pax, let us know your group size so we can recommend the perfect setup for
                  your camping experience.
                </p>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(false)}
                    disabled={guestCount <= 1}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-lg font-medium text-slate-800">{guestCount} guests</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(true)}
                    disabled={guestCount >= 20}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="">
                <CardTitle className="text-slate-800">Choose a date</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-2">
                  <Label htmlFor="bookingDate" className="text-slate-700">
                    Select Date *
                  </Label>
                </div>

                <Input
                  id="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => {
                    handleInputChange("bookingDate", e.target.value)
                    if (e.target.value) {
                      setSelectedDate(new Date(e.target.value))
                    }
                  }}
                  onBlur={(e) => handleBlur("bookingDate", e.target.value)}
                  min={minDate.toISOString().split("T")[0]}
                  className={cn(
                    "border-slate-200 focus:border-blue-400",
                    errors.bookingDate && touched.bookingDate && "border-red-400",
                  )}
                />

                {errors.bookingDate && touched.bookingDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.bookingDate}</p>
                )}
                <p className="text-sm text-slate-500 mt-2">Minimum 2 days advance booking required</p>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="">
                  <CardTitle className="text-slate-800">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label htmlFor="customerName" className="text-slate-700 mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      onBlur={(e) => handleBlur("customerName", e.target.value)}
                      className={cn(
                        "border-slate-200 focus:border-blue-400",
                        errors.customerName && touched.customerName && "border-red-400",
                      )}
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && touched.customerName && (
                      <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerEmail" className="text-slate-700 mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      onBlur={(e) => handleBlur("customerEmail", e.target.value)}
                      className={cn(
                        "border-slate-200 focus:border-blue-400",
                        errors.customerEmail && touched.customerEmail && "border-red-400",
                      )}
                      placeholder="your.email@example.com"
                    />
                    {errors.customerEmail && touched.customerEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerPhone" className="text-slate-700 mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      onBlur={(e) => handleBlur("customerPhone", e.target.value)}
                      placeholder="+971501234567"
                      className={cn(
                        "border-slate-200 focus:border-blue-400",
                        errors.customerPhone && touched.customerPhone && "border-red-400",
                      )}
                    />
                    {errors.customerPhone && touched.customerPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="">
                  <CardTitle className="text-slate-800">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-slate-700 mb-2 block">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value: "Desert" | "Mountain" | "Wadi") => {
                        handleInputChange("location", value)
                        validateField("numberOfTents", formData.numberOfTents.toString())
                      }}
                    >
                      <SelectTrigger className="border-slate-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Desert">Desert - Classic dune experience</SelectItem>
                        <SelectItem value="Mountain">Mountain - Elevated adventure</SelectItem>
                        <SelectItem value="Wadi">Wadi - Oasis experience (min. 2 tents)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-700 mb-2 block">Number of Tents *</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleTentChange(false)}
                        disabled={formData.numberOfTents <= 1}
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-lg font-medium text-slate-800">{formData.numberOfTents}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleTentChange(true)}
                        disabled={formData.numberOfTents >= 5}
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.numberOfTents && touched.numberOfTents && (
                      <p className="text-sm text-red-600 mt-1">{errors.numberOfTents}</p>
                    )}
                    {formData.numberOfTents >= 5 && (
                      <p className="text-sm text-slate-500 mt-1">For more than 5 tents, please contact us directly</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="">
                  <CardTitle className="text-slate-800">Standard Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id="charcoal"
                      checked={formData.addOns.charcoal}
                      onCheckedChange={(checked) => handleAddOnChange("charcoal", checked as boolean)}
                      className="border-blue-400 data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="charcoal" className="flex-1 text-slate-700 cursor-pointer">
                      Charcoal
                      <span className="text-blue-500 ml-2 font-medium">
                        AED {settings?.addOnPrices?.charcoal || 60}
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id="firewood"
                      checked={formData.addOns.firewood}
                      onCheckedChange={(checked) => handleAddOnChange("firewood", checked as boolean)}
                      className="border-blue-400 data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="firewood" className="flex-1 text-slate-700 cursor-pointer">
                      Firewood
                      <span className="text-blue-500 ml-2 font-medium">
                        AED {settings?.addOnPrices?.firewood || 75}
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id="portableToilet"
                      checked={formData.addOns.portableToilet}
                      onCheckedChange={(checked) => handleAddOnChange("portableToilet", checked as boolean)}
                      className="border-blue-400 data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="portableToilet" className="flex-1 text-slate-700 cursor-pointer">
                      Portable Toilet
                      <span className="text-blue-500 ml-2 font-medium">
                        {formData.hasChildren
                          ? "FREE with children"
                          : `AED ${settings?.addOnPrices?.portableToilet || 200}`}
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id="hasChildren"
                      checked={formData.hasChildren}
                      onCheckedChange={(checked) => handleInputChange("hasChildren", checked as boolean)}
                      className="border-blue-400 data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="hasChildren" className="text-slate-700 cursor-pointer">
                      Children in group (makes portable toilet free)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {settings?.customAddOns && settings.customAddOns.length > 0 && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="">
                    <CardTitle className="text-slate-800 flex items-center justify-between">
                      Additional Services
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleManualRefresh}
                        disabled={loadingSettings}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {loadingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {settings.customAddOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Checkbox
                          id={`custom-${addon.id}`}
                          checked={selectedCustomAddOns.includes(addon.id)}
                          onCheckedChange={(checked) => handleCustomAddOnChange(addon.id, checked as boolean)}
                          className="border-blue-400 data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor={`custom-${addon.id}`} className="flex-1 text-slate-700 cursor-pointer">
                          <div>
                            <span>{addon.name}</span>
                            <span className="text-blue-500 ml-2 font-medium">AED {addon.price}</span>
                          </div>
                          {addon.description && <div className="text-sm text-slate-500 mt-1">{addon.description}</div>}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="">
                  <CardTitle className="text-slate-800">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Label htmlFor="notes" className="text-slate-700 mb-2 block">
                    Special Requests
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or dietary requirements..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="border-slate-200 focus:border-blue-400"
                  />
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <CardTitle className="text-green-800 flex items-center">
                      <Check className="w-5 h-5 mr-2 py-5" />
                      What's Included?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Tent setup for up to 4 persons</li>
                      <li>• Bed Blankets & Sleeping pillows</li>
                      <li>• All bedding and blankets (winter set up)</li>
                      <li>• Fire pit</li>
                      <li>• Fire extinguisher on fuel</li>
                      <li>• Foldable chairs</li>
                      <li>• Foldable table</li>
                      <li>• Rugged Plates</li>
                      <li>• Telephone & Lights</li>
                      <li>• Gas Burner Stove with Butane Gas</li>
                      <li>• Cooking pots</li>
                      <li>• Rugged Plates</li>
                      <li>• Cutlery</li>
                      <li>• Cooking utensils</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-red-100 to-pink-100">
                    <CardTitle className="text-red-800 flex items-center">
                      <X className="w-5 h-5 mr-2 py-5" />
                      Exclusions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm text-red-700">
                      <li>• Water & Food</li>
                      <li>• Fuel & Charcoal</li>
                      <li>
                        • Towel & toiletries (we included, you can have a BBQ & provisions to cook as part of your
                        social experience)
                      </li>
                      <li>• Charged (50 AED)</li>
                    </ul>
                    <p className="text-xs text-red-600 mt-4">
                      Note: You are welcome to bring your own food and drinks. Firewood & Charcoal with you.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-slate-800 py-5">Please note</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-slate-700">
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-sm">
                      Nomadic camping does not in moving exact locations that can compromise its difficult to get to
                      without a 4x4 so you will be a day and we will be happy to park your car at our location and we
                      will take you to the camping location.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Meeting Point</h4>
                    <p className="text-sm">
                      Once you're booked, you'll be sent camping exact times meeting point via email. This is where
                      you'll meet your camping guide before they guide you to your camping setup.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Clothing</h4>
                    <p className="text-sm">
                      Please ensure you bring warm pajamas for the evening time when you are outside as it can get quite
                      cold in the evening. Comfortable footwear is also recommended.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Pets</h4>
                    <p className="text-sm">
                      Pets are welcome as long as you provide food for them and they do not disturb the camping
                      experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-slate-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4">
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">
                      {formData.numberOfTents} Tent{formData.numberOfTents > 1 ? "s" : ""} ({formData.location})
                    </span>
                    <span className="font-medium text-slate-800">AED {pricing.tentPrice.toFixed(2)}</span>
                  </div>

                  {formData.location === "Wadi" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Wadi Surcharge</span>
                      <span className="text-slate-700">AED {pricing.locationSurcharge.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.addOnsCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Standard Add-ons</span>
                      <span className="text-slate-700">AED {pricing.addOnsCost.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.customAddOnsCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Additional Services</span>
                      <span className="text-slate-700">AED {pricing.customAddOnsCost.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Subtotal</span>
                      <span className="text-slate-800">AED {pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>VAT ({((settings?.vatRate || 0.05) * 100).toFixed(0)}%)</span>
                      <span className="text-slate-700">AED {pricing.vat.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-300 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-slate-800">Total</span>
                      <span className="text-slate-800">AED {pricing.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Reserve Now"}
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Secure payment powered by Stripe. You will be redirected to complete your payment.
                </p>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2">Pricing Information</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• Single tent: AED {settings?.tentPrices?.singleTent || 1497} + VAT</li>
                    <li>• Multiple tents: AED {settings?.tentPrices?.multipleTents || 1297} each + VAT</li>
                    <li>• Wadi surcharge: AED {settings?.wadiSurcharge || 250}</li>
                    <li>• Portable toilet FREE with children</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
