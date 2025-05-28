import Link from 'next/link'
import { ArrowRight, Users, BarChart3, Globe, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold">Artist Onboarding Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            🚀 DEPLOYMENT TEST - Version 23:30 UTC
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Artist
            <span className="text-blue-600"> Onboarding</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional multi-step onboarding system for artists. Complete setup from profile creation to product configuration and pricing strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="w-full sm:w-auto">
                Start Onboarding <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Artist Profiles</CardTitle>
              <CardDescription>
                Comprehensive artist information collection with brand setup
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Advanced management with search, filtering, and analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Automated SKUs</CardTitle>
              <CardDescription>
                Intelligent product SKU generation and pricing strategies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Secure Storage</CardTitle>
              <CardDescription>
                Supabase integration for reliable data and file management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Complete your artist profile in minutes with our guided onboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/onboarding">
                <Button size="lg" className="w-full">
                  Begin Artist Onboarding
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}