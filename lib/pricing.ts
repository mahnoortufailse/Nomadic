export const DEFAULT_SETTINGS = {
  tentPrices: {
    singleTent: 1497,
    multipleTents: 1297,
  },
  addOnPrices: {
    charcoal: 60,
    firewood: 75,
    portableToilet: 200,
  },
  wadiSurcharge: 250,
  vatRate: 0.05,
}

export function calculateBookingPrice(
  numberOfTents: number,
  location: "Desert" | "Mountain" | "Wadi",
  addOns: { charcoal: boolean; firewood: boolean; portableToilet: boolean },
  hasChildren: boolean,
  customAddOns: Array<{ id: string; name: string; price: number; selected?: boolean }> = [],
  settings = DEFAULT_SETTINGS,
) {
  // Calculate tent cost
  const tentPrice =
    numberOfTents === 1 ? settings.tentPrices.singleTent : settings.tentPrices.multipleTents * numberOfTents

  // Add location surcharge for Wadi
  const locationSurcharge = location === "Wadi" ? settings.wadiSurcharge : 0

  // Calculate standard add-ons
  let addOnsCost = 0
  if (addOns.charcoal) addOnsCost += settings.addOnPrices.charcoal
  if (addOns.firewood) addOnsCost += settings.addOnPrices.firewood
  if (addOns.portableToilet && !hasChildren) {
    addOnsCost += settings.addOnPrices.portableToilet
  }

  // Calculate custom add-ons
  const customAddOnsCost = customAddOns.filter((addon) => addon.selected).reduce((sum, addon) => sum + addon.price, 0)

  const subtotal = tentPrice + locationSurcharge + addOnsCost + customAddOnsCost
  const vat = subtotal * settings.vatRate
  const total = subtotal + vat

  return {
    tentPrice,
    locationSurcharge,
    addOnsCost,
    customAddOnsCost,
    subtotal,
    vat,
    total,
  }
}

export async function fetchPricingSettings(bustCache = false) {
  try {
    const url = bustCache ? `/api/settings?t=${Date.now()}` : "/api/settings"
    const response = await fetch(url, {
      cache: bustCache ? "no-cache" : "default",
      headers: {
        "Cache-Control": bustCache ? "no-cache" : "default",
      },
    })

    if (response.ok) {
      const settings = await response.json()
      // Ensure customAddOns array exists
      if (!settings.customAddOns) {
        settings.customAddOns = []
      }
      return settings
    }

    console.warn("Failed to fetch settings, using defaults")
    return { ...DEFAULT_SETTINGS, customAddOns: [] }
  } catch (error) {
    console.error("Failed to fetch pricing settings:", error)
    return { ...DEFAULT_SETTINGS, customAddOns: [] }
  }
}

export function invalidateSettingsCache() {
  // This can be used to trigger a refresh of settings
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("settingsUpdated"))
  }
}
