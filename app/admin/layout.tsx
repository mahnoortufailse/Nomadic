//@ts-nocheck
"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, LayoutDashboard, ShoppingCart, Settings, Tent } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) return // Don't redirect if already on login page
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/admin/login")
      return
    }

    if (session.user?.role !== "admin") {
      router.push("/")
      return
    }
  }, [session, status, router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-red-600 bg-white p-8 rounded-lg shadow-lg">
          <p className="text-lg font-medium mb-4">Access denied</p>
          <p className="text-slate-600 mb-6">Please login as Admin to continue</p>
          <Button asChild>
            <Link href="/admin/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      description: "Manage Bookings",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      description: "System Configuration",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Tent className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-foreground">NOMADIC</span>
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">
                    Admin
                  </Badge>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-foreground">{session?.user?.username}</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          <nav className="md:hidden mt-4 flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
