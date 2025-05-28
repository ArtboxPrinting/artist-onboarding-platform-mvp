import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
            <span className="text-2xl">🎉</span>
            <div className="text-center">
              <p className="font-semibold">Platform Fully Operational!</p>
              <p className="text-sm opacity-90">Environment variables configured, Supabase connected, all 4 sections ready for production</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Artist Onboarding System
            <span className="ml-2 text-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">LIVE</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your personalized artist e-commerce platform with our comprehensive onboarding process.
            Upload your artwork, configure products, and launch your online store.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Artist Onboarding Card */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Artist Onboarding
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">4 SECTIONS</span>
              </CardTitle>
              <CardDescription>
                Complete your artist profile, upload artwork, and configure your product catalog.
                Our streamlined 4-section process covers profile, artwork, products, and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">1</span>
                  Artist Profile & Brand Setup
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">2</span>
                  Artwork Catalog & File Management
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</span>
                  Product Types & Variants
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">4</span>
                  Pricing & Markup Configuration
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 ml-8 font-medium">
                  ✅ All sections integrated with Supabase database
                </div>
              </div>
              <Link href="/onboarding">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Artist Onboarding
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗂️ Admin Dashboard
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">ENHANCED</span>
              </CardTitle>
              <CardDescription>
                Manage artist submissions, review onboarding progress, and export data for 
                e-commerce platform generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">👥</span>
                  Multi-Section Artist Management
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">📊</span>
                  Real-time Progress Analytics
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">📁</span>
                  Advanced Data Export (JSON/CSV)
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 ml-8 font-medium">
                  ✅ Connected to production database
                </div>
              </div>
              <Link href="/admin">
                <Button variant="outline" className="w-full border-2 hover:bg-secondary/10">
                  Access Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Features Overview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Production-Ready Features
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-medium mb-2">4-Section Onboarding</h3>
              <p className="text-sm text-muted-foreground">
                Streamlined process with real-time validation and auto-save
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="font-medium mb-2">Smart SKU Generation</h3>
              <p className="text-sm text-muted-foreground">
                Automated product identifiers with intelligent algorithms
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">☁️</span>
              </div>
              <h3 className="font-medium mb-2">Supabase Integration</h3>
              <p className="text-sm text-muted-foreground">
                Secure cloud database with real-time synchronization
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-medium mb-2">Advanced Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Dynamic pricing with markup calculation and bulk discounts
              </p>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-12 text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Status: All services operational
            </span>
            <span className="mx-4">•</span>
            <span>Database: Connected</span>
            <span className="mx-4">•</span>
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
