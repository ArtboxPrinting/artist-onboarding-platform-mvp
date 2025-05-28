"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// Enhanced artist data structure for all 4 sections
interface ArtistProfile {
  id: string
  firstName: string
  lastName: string
  studioName: string
  email: string
  phone?: string
  status: "draft" | "in_review" | "ready" | "active"
  submissionDate?: string
  completedSections: number[]
  lastUpdated: string
  artworkCount?: number
  variantCount?: number
  completionPercentage?: number
  branding?: {
    bio?: string
    tagline?: string
    artistic_style?: string
    color_palette?: { primary?: string; secondary?: string; accent?: string }
    preferred_fonts?: string[]
    design_feel?: string
    social_links?: {
      instagram?: string
      facebook?: string
      twitter?: string
      linkedin?: string
      website?: string
    }
    domain_name?: string
  }
}

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  in_review: "bg-yellow-100 text-yellow-800", 
  ready: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800"
}

export default function AdminDashboard() {
  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null)
  const [sortBy, setSortBy] = useState<string>("lastUpdated")

  // Fetch artists from API
  const fetchArtists = async () => {
    try {
      setLoading(true)
      setError("")
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/artists?${params}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch artists')
      }

      setArtists(result.data || [])
    } catch (err) {
      console.error('Error fetching artists:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch artists')
    } finally {
      setLoading(false)
    }
  }

  // Fetch artists on component mount and when filters change
  useEffect(() => {
    fetchArtists()
  }, [searchTerm, statusFilter])

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
        return (b.completedSections?.length || 0) - (a.completedSections?.length || 0)
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
    section1: artists.filter(a => a.completedSections?.includes(1)).length,
    section2: artists.filter(a => a.completedSections?.includes(2)).length,
    section3: artists.filter(a => a.completedSections?.includes(3)).length,
    section4: artists.filter(a => a.completedSections?.includes(4)).length,
    complete: artists.filter(a => a.completedSections?.length === 4).length
  }

  const exportData = (format: "csv" | "json") => {
    const exportArtists = filteredArtists.map(artist => ({
      ...artist,
      fullName: `${artist.firstName} ${artist.lastName}`,
      artworkCount: artist.artworkCount || 0,
      productVariantCount: artist.variantCount || 0,
      completionPercentage: ((artist.completedSections?.length || 0) / 4) * 100
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading artists from database...</div>
        </div>
      </div>
    )
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
            {artists.length > 0 && (
              <Badge variant="default" className="mt-2 bg-green-600">
                🟢 Connected to Live Database - {artists.length} artists found
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchArtists()}>
              Refresh Data
            </Button>
            <Button variant="outline" onClick={() => exportData("csv")}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportData("json")}>
              Export JSON
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Database Error:</strong> {error}
              <Button variant="outline" size="sm" onClick={fetchArtists} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                            variant={artist.completedSections?.includes(section) ? "default" : "secondary"}
                            className={`text-xs ${artist.completedSections?.includes(section) ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            {section}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({artist.completedSections?.length || 0}/4 complete)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>ID: {artist.id}</span>
                        <span>{artist.artworkCount || 0} artworks</span>
                        <span>{artist.variantCount || 0} variants</span>
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
                      {artist.status === 'draft' && (
                        <Badge variant="secondary" className="ml-2">
                          Draft Saved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {artists.length === 0 
                    ? "No artists found in the database. Create your first artist onboarding!" 
                    : "No artists found matching your search criteria."
                  }
                </p>
                {artists.length === 0 && (
                  <Button variant="outline" className="mt-4" onClick={() => window.open('/onboarding', '_blank')}>
                    Start Artist Onboarding
                  </Button>
                )}
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
                Comprehensive view of artist data from database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Contact Information:</strong>
                    <p>Email: {selectedArtist.email}</p>
                    {selectedArtist.phone && <p>Phone: {selectedArtist.phone}</p>}
                  </div>
                  <div>
                    <strong>Status Information:</strong>
                    <p>Status: {selectedArtist.status}</p>
                    <p>Completion: {selectedArtist.completedSections?.length || 0}/4 sections</p>
                    <p>Last Updated: {new Date(selectedArtist.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedArtist.branding && (
                  <div>
                    <strong>Branding Information:</strong>
                    {selectedArtist.branding.bio && <p>Bio: {selectedArtist.branding.bio.substring(0, 200)}...</p>}
                    {selectedArtist.branding.tagline && <p>Tagline: {selectedArtist.branding.tagline}</p>}
                    {selectedArtist.branding.artistic_style && <p>Style: {selectedArtist.branding.artistic_style.substring(0, 150)}...</p>}
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This data is live from the database. Artist ID: {selectedArtist.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}