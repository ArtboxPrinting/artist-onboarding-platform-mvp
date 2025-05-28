"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ArtistData {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  [key: string]: any
}

export default function SimpleAdminDashboard() {
  const [artists, setArtists] = useState<ArtistData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const fetchArtists = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('Fetching artists from API...')
      const response = await fetch('/api/artists')
      const result = await response.json()

      console.log('API Response:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (result.success) {
        setArtists(result.data || [])
      } else {
        throw new Error(result.error || 'API returned success: false')
      }
      
    } catch (err) {
      console.error('Error fetching artists:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch artists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-center">
          <div className="text-lg">Loading artists from database...</div>
          <div className="text-sm text-muted-foreground mt-2">Testing API connection</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Simple Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Direct API test - bypassing hydration issues</p>
          
          {artists.length > 0 && (
            <Badge className="mt-2 bg-green-600">
              ✅ API Working - {artists.length} artists found
            </Badge>
          )}
          
          <Button variant="outline" onClick={fetchArtists} className="ml-4">
            Refresh Data
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>API Error:</strong> {error}
              <Button variant="outline" size="sm" onClick={fetchArtists} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Artists Display */}
        <Card>
          <CardHeader>
            <CardTitle>Artists from Database</CardTitle>
          </CardHeader>
          <CardContent>
            {artists.length > 0 ? (
              <div className="space-y-4">
                {artists.map((artist, index) => (
                  <div key={artist.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {artist.firstName} {artist.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {artist.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {artist.id}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {artist.status || 'draft'}
                      </Badge>
                    </div>
                    
                    {/* Raw data for debugging */}
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground">
                        View raw data
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(artist, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {error ? 'Failed to load artists' : 'No artists found'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}