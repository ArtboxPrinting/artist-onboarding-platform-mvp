"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// Enhanced artist data structure for all 4 sections
interface ArtistProfile {
  // Section 1 - Artist Profile
  id: string
  firstName: string
  lastName: string
  studioName: string
  email: string
  phone?: string
  website?: string
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  branding?: {
    logoUrl?: string
    colorPalette?: string[]
    fontPreferences?: string[]
  }
  
  // Section 2 - Artwork Catalog
  artworks?: Array<{
    id: string
    title: string
    year: number
    medium: string
    dimensions: string
    keywords: string[]
    fileUrl?: string
  }>
  
  // Section 3 - Product Configuration
  productOfferings?: {
    unframedPrints: boolean
    framedPrints: boolean
    canvasWraps: boolean
    greetingCards: boolean
    metalPrints: boolean
    [key: string]: boolean
  }
  availableSizes?: Array<{
    name: string
    width: number
    height: number
    unit: string
  }>
  printMediaOptions?: Array<{
    name: string
    finish: string
    additionalCost: number
  }>
  
  // Section 4 - Pricing Configuration
  pricingStrategy?: {
    strategy: string
    targetMargin: number
    minimumPrice: number
  }
  productVariants?: Array<{
    sku: string
    productType: string
    baseCost: number
    finalPrice: number
  }>
  
  // System metadata
  status: "draft" | "in_review" | "ready" | "active"
  submissionDate?: string
  completedSections: number[]
  lastUpdated: string
}

// Mock enhanced data for demonstration
const MOCK_ARTISTS: ArtistProfile[] = [
  {
    id: "ALN-2025-0001",
    firstName: "Sarah",
    lastName: "Johnson",
    studioName: "Wildlight Prints",
    email: "sarah@wildlightprints.com",
    phone: "(555) 123-4567",
    website: "wildlightprints.com",
    socialMedia: {
      instagram: "@wildlightprints",
      facebook: "WildlightPrintsStudio"
    },
    branding: {
      colorPalette: ["#2C5F41", "#A0C49D", "#F7DC6F"],
      fontPreferences: ["Playfair Display", "Source Sans Pro"]
    },
    artworks: [
      {
        id: "art-001",
        title: "Mountain Sunrise",
        year: 2024,
        medium: "Acrylic on Canvas",
        dimensions: "24x36 inches",
        keywords: ["landscape", "nature", "sunrise"]
      },
      {
        id: "art-002", 
        title: "Forest Dreams",
        year: 2024,
        medium: "Watercolor",
        dimensions: "16x20 inches",
        keywords: ["forest", "trees", "ethereal"]
      }
    ],
    productOfferings: {
      unframedPrints: true,
      framedPrints: true,
      canvasWraps: true,
      greetingCards: true,
      metalPrints: false
    },
    availableSizes: [
      { name: "8x10", width: 8, height: 10, unit: "inches" },
      { name: "11x14", width: 11, height: 14, unit: "inches" },
      { name: "16x20", width: 16, height: 20, unit: "inches" }
    ],
    printMediaOptions: [
      { name: "Fine Art Rag", finish: "matte", additionalCost: 5.00 },
      { name: "Canvas", finish: "textured", additionalCost: 8.00 }
    ],
    pricingStrategy: {
      strategy: "cost_plus",
      targetMargin: 65,
      minimumPrice: 30
    },
    productVariants: [
      { sku: "ALN-SJ-PRNT-8X10-RAG", productType: "unframed_print", baseCost: 12.00, finalPrice: 35.00 },
      { sku: "ALN-SJ-FRMD-11X14-CNV", productType: "framed_print", baseCost: 25.00, finalPrice: 85.00 }
    ],
    status: "active",
    submissionDate: "2025-05-20",
    completedSections: [1, 2, 3, 4],
    lastUpdated: "2025-05-27"
  },
  {
    id: "ALN-2025-0002",
    firstName: "Marcus",
    lastName: "Chen",
    studioName: "Urban Canvas Studio",
    email: "marcus@urbancanvas.art",
    phone: "(555) 987-6543",
    socialMedia: {
      instagram: "@urbancanvas",
      twitter: "@urbcanvas"
    },
    artworks: [
      {
        id: "art-003",
        title: "City Lights",
        year: 2025,
        medium: "Digital Art",
        dimensions: "20x30 inches",
        keywords: ["urban", "city", "lights", "modern"]
      }
    ],
    productOfferings: {
      unframedPrints: true,
      framedPrints: false,
      canvasWraps: true,
      greetingCards: false,
      metalPrints: true
    },
    pricingStrategy: {
      strategy: "market_based",
      targetMargin: 55,
      minimumPrice: 25
    },
    productVariants: [
      { sku: "ALN-MC-PRNT-12X18-SAT", productType: "unframed_print", baseCost: 15.00, finalPrice: 45.00 }
    ],
    status: "in_review",
    submissionDate: "2025-05-22",
    completedSections: [1, 2, 3],
    lastUpdated: "2025-05-26"
  },
  {
    id: "ALN-2025-0003",
    firstName: "Elena",
    lastName: "Rodriguez",
    studioName: "Coastal Expressions",
    email: "elena@coastalexpressions.com",
    artworks: [
      {
        id: "art-004",
        title: "Ocean Waves",
        year: 2024,
        medium: "Oil on Canvas",
        dimensions: "18x24 inches",
        keywords: ["ocean", "waves", "coastal"]
      }
    ],
    status: "draft",
    completedSections: [1, 2],
    lastUpdated: "2025-05-25"
  }
]

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  in_review: "bg-yellow-100 text-yellow-800", 
  ready: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800"
}

export default function AdminDashboard() {
  const [artists, setArtists] = useState<ArtistProfile[]>(MOCK_ARTISTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null)
  const [sortBy, setSortBy] = useState<string>("lastUpdated")

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || artist.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      case "studio":
        return a.studioName.localeCompare(b.studioName)
      case "completion":
        return b.completedSections.length - a.completedSections.length
      case "lastUpdated":
      default:
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    }
  })

  const statusCounts = {
    total: artists.length,
    draft: artists.filter(a => a.status === "draft").length,
    in_review: artists.filter(a => a.status === "in_review").length,
    ready: artists.filter(a => a.status === "ready").length,
    active: artists.filter(a => a.status === "active").length
  }

  const completionStats = {
    section1: artists.filter(a => a.completedSections.includes(1)).length,
    section2: artists.filter(a => a.completedSections.includes(2)).length,
    section3: artists.filter(a => a.completedSections.includes(3)).length,
    section4: artists.filter(a => a.completedSections.includes(4)).length,
    complete: artists.filter(a => a.completedSections.length === 4).length
  }

  const exportData = (format: "csv" | "json") => {
    const exportArtists = filteredArtists.map(artist => ({
      ...artist,
      fullName: `${artist.firstName} ${artist.lastName}`,
      artworkCount: artist.artworks?.length || 0,
      productVariantCount: artist.productVariants?.length || 0,
      completionPercentage: (artist.completedSections.length / 4) * 100
    }))

    if (format === "csv") {
      // Simple CSV export implementation
      const csvHeaders = "ID,Full Name,Studio,Email,Status,Completion,Artworks,Variants,Last Updated"
      const csvRows = exportArtists.map(artist => 
        `${artist.id},"${artist.fullName}","${artist.studioName}","${artist.email}",${artist.status},${artist.completionPercentage}%,${artist.artworkCount},${artist.productVariantCount},${artist.lastUpdated}`
      )
      const csvContent = [csvHeaders, ...csvRows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `artist-data-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    } else {
      // JSON export
      const jsonContent = JSON.stringify(exportArtists, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `artist-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      window.URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage artist onboarding submissions across all 4 sections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportData("csv")}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportData("json")}>
              Export JSON
            </Button>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Artists
              </CardTitle>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft
              </CardTitle>
              <div className="text-2xl font-bold text-gray-600">{statusCounts.draft}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Review
              </CardTitle>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.in_review}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ready
              </CardTitle>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.ready}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Section Completion Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Section Completion Analysis</CardTitle>
            <CardDescription>
              Track artist progress across all 4 onboarding sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completionStats.section1}</div>
                <div className="text-sm text-muted-foreground">Section 1<br />Artist Profile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{completionStats.section2}</div>
                <div className="text-sm text-muted-foreground">Section 2<br />Artwork Catalog</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{completionStats.section3}</div>
                <div className="text-sm text-muted-foreground">Section 3<br />Product Config</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{completionStats.section4}</div>
                <div className="text-sm text-muted-foreground">Section 4<br />Pricing Setup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completionStats.complete}</div>
                <div className="text-sm text-muted-foreground">Complete<br />All Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Artist Search & Filter</CardTitle>
            <CardDescription>
              Search and filter artists by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="studio">Studio Name</SelectItem>
                  <SelectItem value="completion">Completion %</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Artists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Artists Overview</CardTitle>
            <CardDescription>
              {filteredArtists.length} of {artists.length} artists shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedArtist(artist)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold">{artist.firstName} {artist.lastName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {artist.studioName} • {artist.email}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS[artist.status]}>
                          {artist.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {/* Section Completion Indicators */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Sections:</span>
                        {[1, 2, 3, 4].map(section => (
                          <Badge 
                            key={section}
                            variant={artist.completedSections.includes(section) ? "default" : "secondary"}
                            className={`text-xs ${artist.completedSections.includes(section) ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            {section}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({artist.completedSections.length}/4 complete)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>ID: {artist.id}</span>
                        <span>{artist.artworks?.length || 0} artworks</span>
                        <span>{artist.productVariants?.length || 0} variants</span>
                        {artist.pricingStrategy && (
                          <span>Strategy: {artist.pricingStrategy.strategy.replace('_', ' ')}</span>
                        )}
                        <span>Updated: {new Date(artist.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                      {artist.status === 'in_review' && (
                        <Button size="sm">
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No artists found matching your search criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Artist Details Modal */}
        {selectedArtist && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Artist Details: {selectedArtist.firstName} {selectedArtist.lastName}
                <Button variant="outline" onClick={() => setSelectedArtist(null)}>
                  Close
                </Button>
              </CardTitle>
              <CardDescription>
                Comprehensive view of all artist data across 4 sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="artwork">Artwork</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Contact Information:</strong>
                      <p>Email: {selectedArtist.email}</p>
                      {selectedArtist.phone && <p>Phone: {selectedArtist.phone}</p>}
                      {selectedArtist.website && <p>Website: {selectedArtist.website}</p>}
                    </div>
                    <div>
                      <strong>Social Media:</strong>
                      {selectedArtist.socialMedia?.instagram && <p>Instagram: {selectedArtist.socialMedia.instagram}</p>}
                      {selectedArtist.socialMedia?.facebook && <p>Facebook: {selectedArtist.socialMedia.facebook}</p>}
                      {selectedArtist.socialMedia?.twitter && <p>Twitter: {selectedArtist.socialMedia.twitter}</p>}
                    </div>
                  </div>
                  {selectedArtist.branding && (
                    <div>
                      <strong>Branding:</strong>
                      {selectedArtist.branding.colorPalette && (
                        <div className="flex gap-2 mt-2">
                          {selectedArtist.branding.colorPalette.map((color, index) => (
                            <div 
                              key={index}
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="artwork" className="space-y-4">
                  {selectedArtist.artworks && selectedArtist.artworks.length > 0 ? (
                    <div className="space-y-4">
                      {selectedArtist.artworks.map((artwork) => (
                        <Card key={artwork.id} className="p-4">
                          <h4 className="font-semibold">{artwork.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {artwork.year} • {artwork.medium} • {artwork.dimensions}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {artwork.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No artwork uploaded yet.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="products" className="space-y-4">
                  {selectedArtist.productOfferings ? (
                    <div>
                      <strong>Product Offerings:</strong>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(selectedArtist.productOfferings).map(([product, offered]) => (
                          <div key={product} className="flex items-center gap-2">
                            <Badge variant={offered ? "default" : "secondary"}>
                              {offered ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">{product.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                        ))}
                      </div>
                      
                      {selectedArtist.availableSizes && (
                        <div className="mt-4">
                          <strong>Available Sizes:</strong>
                          <div className="flex gap-2 mt-2">
                            {selectedArtist.availableSizes.map((size, index) => (
                              <Badge key={index} variant="outline">
                                {size.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Product configuration not completed.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-4">
                  {selectedArtist.pricingStrategy ? (
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Pricing Strategy:</strong>
                          <p>Strategy: {selectedArtist.pricingStrategy.strategy.replace('_', ' ')}</p>
                          <p>Target Margin: {selectedArtist.pricingStrategy.targetMargin}%</p>
                          <p>Minimum Price: ${selectedArtist.pricingStrategy.minimumPrice}</p>
                        </div>
                      </div>
                      
                      {selectedArtist.productVariants && selectedArtist.productVariants.length > 0 && (
                        <div className="mt-4">
                          <strong>Product Variants:</strong>
                          <div className="space-y-2 mt-2">
                            {selectedArtist.productVariants.map((variant, index) => (
                              <div key={index} className="flex justify-between items-center p-2 border rounded">
                                <span className="font-mono text-sm">{variant.sku}</span>
                                <span className="text-sm">{variant.productType.replace('_', ' ')}</span>
                                <span className="text-sm">Cost: ${variant.baseCost}</span>
                                <span className="font-semibold">${variant.finalPrice}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Pricing configuration not completed.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
