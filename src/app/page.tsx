import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Artist Onboarding System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your personalized artist e-commerce platform with our comprehensive onboarding process.
            Upload your artwork, configure products, and launch your online store.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Artist Onboarding Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Artist Onboarding
              </CardTitle>
              <CardDescription>
                Complete your artist profile, upload artwork, and configure your product catalog.
                Our 8-step process covers everything from branding to fulfillment.
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
                  Artwork Catalog & File Upload
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</span>
                  Product Types & Variants
                </div>
                <div className="text-xs text-muted-foreground ml-8">
                  + 5 more sections covering pricing, shipping, marketing, and order management
                </div>
              </div>
              <Link href="/onboarding">
                <Button className="w-full">
                  Start Artist Onboarding
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗂️ Admin Dashboard
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
                  Artist Overview & Management
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">📊</span>
                  Status Tracking & Notes
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">📁</span>
                  Data Export (JSON/CSV)
                </div>
                <div className="text-xs text-muted-foreground ml-8">
                  Internal use only - requires admin authentication
                </div>
              </div>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Access Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-medium mb-2">Multi-Step Onboarding</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive 8-section form with save-as-draft functionality
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="font-medium mb-2">Automated SKU Generation</h3>
              <p className="text-sm text-muted-foreground">
                Unique product identifiers for seamless fulfillment integration
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">☁️</span>
              </div>
              <h3 className="font-medium mb-2">Secure File Storage</h3>
              <p className="text-sm text-muted-foreground">
                High-resolution artwork and brand asset management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
