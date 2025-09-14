"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Mail, Headset, CreditCard } from "lucide-react";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Image from "next/image";

export default function BookingFailedPage() {
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
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="w-full flex justify-center">
            <div className="w-72">
              {/* failure animation */}
              <DotLottieReact src="/failed.lottie" loop autoplay />
            </div>
          </div>

          <p className="text-xl text-muted-foreground mt-4">
            Oops! Your payment could not be processed. Please try again or
            contact support if the issue persists.
          </p>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Proceed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Retry Payment</p>
                <p className="text-muted-foreground">
                  You can attempt the payment again from the bookings page.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Check Email</p>
                <p className="text-muted-foreground">
                  If any charges were made, you’ll receive a confirmation email
                  shortly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Headset className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Contact Support</p>
                <p className="text-muted-foreground">
                  Our team is here to help. Please reach out if you continue to
                  face issues.
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
            <Link href="/trips">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
