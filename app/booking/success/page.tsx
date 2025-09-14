"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, Users, Mail } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/lib/types";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Image from "next/image";
export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails();
    }
  }, [sessionId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(
        `/api/booking-success?session_id=${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-destructive mb-4">
              Unable to load booking details
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="NOMADIC"
              width={140}
              height={45}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-full flex justify-center">
            <div className="w-96 ">
              {" "}
              {/* controls the size */}
              <DotLottieReact src="/tent.lottie" loop autoplay />
            </div>
          </div>

          <p className="text-xl text-muted-foreground">
            Thank you for choosing Nomadic. Your desert adventure is booked and
            confirmed.
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">
                    {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{booking.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Tents</p>
                  <p className="text-muted-foreground">
                    {booking.numberOfTents} tent
                    {booking.numberOfTents > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {(booking.addOns.charcoal ||
                booking.addOns.firewood ||
                booking.addOns.portableToilet) && (
                <div>
                  <p className="font-medium mb-2">Add-ons</p>
                  <ul className="text-muted-foreground space-y-1">
                    {booking.addOns.charcoal && <li>• Charcoal</li>}
                    {booking.addOns.firewood && <li>• Firewood</li>}
                    {booking.addOns.portableToilet && (
                      <li>• Portable Toilet</li>
                    )}
                  </ul>
                </div>
              )}

              {booking.notes && (
                <div>
                  <p className="font-medium">Special Requests</p>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>AED {booking.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>VAT (5%)</span>
                  <span>AED {booking.vat.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span>AED {booking.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Payment Successful
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-muted-foreground">
                  You'll receive a detailed confirmation email at{" "}
                  {booking.customerEmail} within the next few minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Pre-Trip Contact</p>
                <p className="text-muted-foreground">
                  Our team will contact you 24-48 hours before your trip with
                  final details and meeting instructions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Adventure Day</p>
                <p className="text-muted-foreground">
                  Arrive at the designated meeting point and get ready for an
                  unforgettable desert experience!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Book Another Trip</Link>
          </Button>
        </div>

        {/* Conversion Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Analytics conversion tracking
              if (typeof gtag !== 'undefined') {
                gtag('event', 'purchase', {
                  transaction_id: '${booking._id}',
                  value: ${booking.total},
                  currency: 'AED',
                  items: [{
                    item_id: 'camping-${booking.location.toLowerCase()}',
                    item_name: 'Desert Camping - ${booking.location}',
                    category: 'Camping',
                    quantity: ${booking.numberOfTents},
                    price: ${booking.total}
                  }]
                });
              }
              
              // Facebook Pixel conversion tracking
              if (typeof fbq !== 'undefined') {
                fbq('track', 'Purchase', {
                  value: ${booking.total},
                  currency: 'AED',
                  content_ids: ['camping-${booking.location.toLowerCase()}'],
                  content_type: 'product'
                });
              }
            `,
          }}
        />
      </div>
    </div>
  );
}
