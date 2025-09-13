//@ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Save, ArrowLeft, SettingsIcon, DollarSign, Tent, Plus, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import type { Settings } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newAddOn, setNewAddOn] = useState({ name: "", price: 0, description: "" })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const responseData = await response.json()

      if (response.ok) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("settingsUpdated"))
        }
        toast.success("Settings updated successfully")
        await fetchSettings()
      } else {
        throw new Error(responseData.error || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error(`Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (path: string, value: any) => {
    if (!settings) return

    const keys = path.split(".")
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
  }

  const addCustomAddOn = () => {
    if (!newAddOn.name || newAddOn.price <= 0) {
      toast.error("Please provide valid add-on name and price")
      return
    }

    const customAddOns = settings?.customAddOns || []
    const updatedAddOns = [...customAddOns, { ...newAddOn, id: Date.now().toString() }]

    updateSettings("customAddOns", updatedAddOns)
    setNewAddOn({ name: "", price: 0, description: "" })
    toast.success("Custom add-on added successfully")
  }

  const removeCustomAddOn = (id: string) => {
    const customAddOns = settings?.customAddOns || []
    const updatedAddOns = customAddOns.filter((addon: any) => addon.id !== id)
    updateSettings("customAddOns", updatedAddOns)
    toast.success("Custom add-on removed")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Failed to load settings</p>
          <Button onClick={fetchSettings}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Tent className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">NOMADIC</span>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <SettingsIcon className="w-8 h-8 text-primary mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">System Settings</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Manage pricing, add-ons, and business rules for your glamping service
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Tent Pricing */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center text-card-foreground">
                <Tent className="w-5 h-4 mr-2 text-primary " />
                Tent Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="singleTent" className="text-card-foreground font-medium flex items-center">
                    Single Tent Price (AED)
                    <Badge variant="outline" className="ml-2 text-xs">
                      Base Price
                    </Badge>
                  </Label>
                  <Input
                    id="singleTent"
                    type="number"
                    value={settings?.tentPrices?.singleTent || 1497}
                    onChange={(e) => updateSettings("tentPrices.singleTent", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Standard price for booking a single tent (up to 4 people)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="multipleTents" className="text-card-foreground font-medium flex items-center">
                    Multiple Tents Price (AED each)
                    <Badge variant="outline" className="ml-2 text-xs">
                      Bulk Discount
                    </Badge>
                  </Label>
                  <Input
                    id="multipleTents"
                    type="number"
                    value={settings?.tentPrices?.multipleTents || 1297}
                    onChange={(e) => updateSettings("tentPrices.multipleTents", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Discounted price per tent when booking 2 or more tents
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-card-foreground mb-2">Pricing Rules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Single tent: {settings?.tentPrices?.singleTent || 1497} AED + VAT</li>
                  <li>• Multiple tents: {settings?.tentPrices?.multipleTents || 1297} AED each + VAT</li>
                  <li>• Maximum 5 tents per booking</li>
                  <li>• Each tent accommodates up to 4 people</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Standard Add-ons */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center text-card-foreground">
                <DollarSign className="w-5 h-5 mr-2 text-accent" />
                Standard Add-on Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="charcoal" className="text-card-foreground font-medium">
                    Charcoal (AED)
                  </Label>
                  <Input
                    id="charcoal"
                    type="number"
                    value={settings?.addOnPrices?.charcoal || 60}
                    onChange={(e) => updateSettings("addOnPrices.charcoal", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">Premium charcoal for BBQ</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="firewood" className="text-card-foreground font-medium">
                    Firewood (AED)
                  </Label>
                  <Input
                    id="firewood"
                    type="number"
                    value={settings?.addOnPrices?.firewood || 75}
                    onChange={(e) => updateSettings("addOnPrices.firewood", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">Dry firewood for campfire</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="portableToilet" className="text-card-foreground font-medium">
                    Portable Toilet (AED)
                  </Label>
                  <Input
                    id="portableToilet"
                    type="number"
                    value={settings?.addOnPrices?.portableToilet || 200}
                    onChange={(e) => updateSettings("addOnPrices.portableToilet", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">Clean portable toilet facility (FREE with children)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Add-ons */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center text-card-foreground">
                <Plus className="w-5 h-5 mr-2 text-secondary" />
                Custom Add-ons Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Add New Custom Add-on */}
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <h4 className="font-medium text-card-foreground mb-4">Add New Custom Add-on</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newAddOnName" className="text-card-foreground">
                      Name
                    </Label>
                    <Input
                      id="newAddOnName"
                      placeholder="e.g., Extra Blankets"
                      value={newAddOn.name}
                      onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                      className="border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAddOnPrice" className="text-card-foreground">
                      Price (AED)
                    </Label>
                    <Input
                      id="newAddOnPrice"
                      type="number"
                      placeholder="0"
                      value={newAddOn.price}
                      onChange={(e) => setNewAddOn({ ...newAddOn, price: Number(e.target.value) })}
                      className="border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAddOnDescription" className="text-card-foreground">
                      Description
                    </Label>
                    <Input
                      id="newAddOnDescription"
                      placeholder="Brief description"
                      value={newAddOn.description}
                      onChange={(e) => setNewAddOn({ ...newAddOn, description: e.target.value })}
                      className="border-border focus:border-primary"
                    />
                  </div>
                </div>
                <Button
                  onClick={addCustomAddOn}
                  className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Add-on
                </Button>
              </div>

              {/* Existing Custom Add-ons */}
              {settings?.customAddOns && settings.customAddOns.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-card-foreground">Existing Custom Add-ons</h4>
                  <div className="grid gap-4">
                    {settings.customAddOns.map((addon: any) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-card-foreground">{addon.name}</h5>
                            <Badge variant="outline">AED {addon.price}</Badge>
                          </div>
                          {addon.description && (
                            <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomAddOn(addon.id)}
                          className="border-destructive/20 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Business Rules */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center text-card-foreground">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location & Business Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="wadiSurcharge" className="text-card-foreground font-medium flex items-center">
                    Wadi Location Surcharge (AED)
                    <Badge variant="outline" className="ml-2 text-xs">
                      Distance Fee
                    </Badge>
                  </Label>
                  <Input
                    id="wadiSurcharge"
                    type="number"
                    value={settings?.wadiSurcharge || 250}
                    onChange={(e) => updateSettings("wadiSurcharge", Number(e.target.value))}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Additional charge for Wadi locations due to distance and logistics
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vatRate" className="text-card-foreground font-medium">
                    VAT Rate (%)
                  </Label>
                  <Input
                    id="vatRate"
                    type="number"
                    step="0.01"
                    value={settings ? settings.vatRate * 100 : 5}
                    onChange={(e) => updateSettings("vatRate", Number(e.target.value) / 100)}
                    className="border-border focus:border-primary focus:ring-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">UAE VAT rate applied to all bookings</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Business Rules Summary</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-card-foreground">Booking Constraints</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Maximum 5 tents per booking</li>
                      <li>• Minimum 2 days advance booking</li>
                      <li>• Wadi requires minimum 2 tents</li>
                      <li>• Same location constraint per date</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-card-foreground">Special Offers</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Portable toilet FREE with children</li>
                      <li>• Bulk discount for 2+ tents</li>
                      <li>• Desert location is standard (no surcharge)</li>
                      <li>• Mountain location available</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={fetchSettings}
              className="border-border text-muted-foreground hover:bg-muted bg-transparent"
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
