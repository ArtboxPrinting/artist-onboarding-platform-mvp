"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  rawData?: any
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

  // Direct Supabase connection
  const fetchArtistsDirectly = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Use environment variables directly
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables not configured')
      }

      // Create direct Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      console.log('Connecting directly to Supabase...')

      // Query the artists table directly
      const { data: artistsData, error: dbError } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database query failed: ${dbError.message}`)
      }

      console.log('Found artists in database:', artistsData?.length || 0)
      console.log('Sample artist data:', artistsData?.[0])

      // Transform the raw database data
      const transformedArtists = artistsData?.map((artist, index) => ({
        id: artist.id || artist.artist_id || `artist-${index}`,
        firstName: artist.first_name || artist.full_name?.split(' ')[0] || artist.name?.split(' ')[0] || 'Unknown',
        lastName: artist.last_name || artist.full_name?.split(' ').slice(1).join(' ') || artist.name?.split(' ').slice(1).join(' ') || '',
        studioName: artist.studio_name || artist.business_name || artist.company || 'Studio Name Not Set',
        email: artist.email || 'email@example.com',
        phone: artist.phone || artist.phone_number || '',
        status: artist.status || 'draft',
        completedSections: [1], // Default to section 1 complete
        artworkCount: artist.artwork_count || 0,
        variantCount: artist.variant_count || 0,
        lastUpdated: artist.updated_at || artist.created_at || new Date().toISOString(),
        submissionDate: artist.created_at || new Date().toISOString(),
        completionPercentage: 25, // Default to 25% for section 1
        rawData: artist // Keep raw data for debugging
      })) || []

      setArtists(transformedArtists)
      
    } catch (err) {
      console.error('Error fetching artists directly:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch artists from database')
    } finally {
      setLoading(false)
    }
  }

  // Fetch artists on component mount
  useEffect(() => {
    fetchArtistsDirectly()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Connecting directly to Supabase database...</div>
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
              Admin Dashboard - Direct Database Connection
            </h1>
            <p className="text-muted-foreground mt-2">
              Connected directly to your Supabase database (bypassing API)
            </p>
            {artists.length > 0 && (
              <Badge variant="default" className="mt-2 bg-green-600">
                🟢 Direct Database Connection - {artists.length} artists found
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="mt-2">
                ❌ Connection Error
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchArtistsDirectly()}>
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Database Connection Error:</strong> {error}
              <Button variant="outline" size="sm" onClick={fetchArtistsDirectly} className="ml-4">
                Retry Connection
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

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Artist Search & Filter</CardTitle>
            <CardDescription>
              Search and filter your real database artists
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
            </div>
          </CardContent>
        </Card>

        {/* Artists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Real Database Artists</CardTitle>
            <CardDescription>
              {filteredArtists.length} of {artists.length} artists shown from your Supabase database
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
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>ID: {artist.id}</span>
                        <span>Updated: {new Date(artist.lastUpdated).toLocaleDateString()}</span>
                        <span>Raw Data Available</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Raw Data
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {artists.length === 0 
                    ? "No artists found in your database. Check your Supabase connection." 
                    : "No artists found matching your search criteria."
                  }
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
                Raw Database Data: {selectedArtist.firstName} {selectedArtist.lastName}
                <Button variant="outline" onClick={() => setSelectedArtist(null)}>
                  Close
                </Button>
              </CardTitle>
              <CardDescription>
                Raw data from your Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Processed Data:</strong>
                    <p>Name: {selectedArtist.firstName} {selectedArtist.lastName}</p>
                    <p>Email: {selectedArtist.email}</p>
                    <p>Studio: {selectedArtist.studioName}</p>
                    <p>Status: {selectedArtist.status}</p>
                  </div>
                  <div>
                    <strong>Database Info:</strong>
                    <p>ID: {selectedArtist.id}</p>
                    <p>Last Updated: {new Date(selectedArtist.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <strong>Raw Database Record:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(selectedArtist.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}