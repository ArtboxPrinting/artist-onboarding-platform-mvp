"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Section1ArtistProfile from "@/components/onboarding/Section1ArtistProfile"
import Section2ArtworkCatalog from "@/components/onboarding/Section2ArtworkCatalog"
import Section3ProductConfig from "@/components/onboarding/Section3ProductConfig"
import Section4Pricing from "@/components/onboarding/Section4Pricing"

const ONBOARDING_SECTIONS = [
  {
    id: 1,
    title: "Artist Profile & Brand Setup",
    description: "Basic information, branding, and visual identity preferences",
    icon: "🎨",
    component: Section1ArtistProfile,
    required: true
  },
  {
    id: 2,
    title: "Artwork Catalog & File Management",
    description: "Upload and manage your artwork collection with metadata",
    icon: "🖼️",
    component: Section2ArtworkCatalog,
    required: true
  },
  {
    id: 3,
    title: "Product Types & Variants",
    description: "Configure print sizes, media types, and framing options",
    icon: "🛏️",
    component: Section3ProductConfig,
    required: true
  },
  {
    id: 4,
    title: "Pricing & Markup Configuration",
    description: "Set pricing strategy, markup percentages, and SKU generation",
    icon: "💰",
    component: Section4Pricing,
    required: true
  }
]

export default function OnboardingPage() {
  const [currentSection, setCurrentSection] = useState(1)
  const [completedSections, setCompletedSections] = useState<number[]>([])
  const [artistId, setArtistId] = useState<string>()
  const [sectionData, setSectionData] = useState<Record<number, any>>({})
  const [saveStatus, setSaveStatus] = useState<string>("")
  const [isConnectedToDatabase, setIsConnectedToDatabase] = useState<boolean>(false)

  // Generate or retrieve artist ID and test database connection
  useEffect(() => {
    const initializeArtist = async () => {
      // Test database connection first
      try {
        const healthResponse = await fetch('/api/health')
        const healthData = await healthResponse.json()
        setIsConnectedToDatabase(healthData.success && healthData.database)
      } catch (error) {
        console.error('Database connection test failed:', error)
        setIsConnectedToDatabase(false)
      }

      // Initialize or retrieve artist ID
      const storedArtistId = localStorage.getItem("artist_id")
      if (storedArtistId) {
        setArtistId(storedArtistId)
      } else {
        const newArtistId = `artist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setArtistId(newArtistId)
        localStorage.setItem("artist_id", newArtistId)
      }

      // Load completed sections from localStorage
      const savedProgress = localStorage.getItem("onboarding_progress")
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          setCompletedSections(progress.completedSections || [])
          setSectionData(progress.sectionData || {})
        } catch (error) {
          console.error("Error loading saved progress:", error)
        }
      }
    }

    initializeArtist()
  }, [])

  // Save progress to both localStorage and database
  const saveProgress = async () => {
    try {
      // Save to localStorage for backup
      const progress = {
        completedSections,
        sectionData,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem("onboarding_progress", JSON.stringify(progress))

      // Save to database if connected
      if (isConnectedToDatabase && artistId && Object.keys(sectionData).length > 0) {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            artistId,
            sectionNumber: currentSection,
            formData: sectionData[currentSection] || {},
            sessionToken: `session_${artistId}_${Date.now()}`
          }),
        })

        const result = await response.json()
        
        if (result.success) {
          setSaveStatus("✅ Progress saved to database")
        } else {
          setSaveStatus("⚠️ Saved locally (database unavailable)")
          console.warn('Database save failed:', result.error)
        }
      } else {
        setSaveStatus("📱 Progress saved locally")
      }
      
      setTimeout(() => setSaveStatus(""), 3000)
    } catch (error) {
      console.error("Error saving progress:", error)
      setSaveStatus("❌ Error saving progress")
      setTimeout(() => setSaveStatus(""), 3000)
    }
  }

  const handleSectionComplete = async (sectionId: number) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId])
    }
    
    await saveProgress()
    
    // Move to next section if not at the end
    if (sectionId < ONBOARDING_SECTIONS.length) {
      setCurrentSection(sectionId + 1)
    }
  }

  const handleSectionClick = async (sectionId: number) => {
    // Save current section data before switching
    await saveProgress()
    setCurrentSection(sectionId)
  }

  const handleSaveProgress = async () => {
    await saveProgress()
  }

  const updateSectionData = (sectionId: number, data: any) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: data
    }))
  }

  const isApplicationComplete = completedSections.length === ONBOARDING_SECTIONS.length
  const progressPercentage = (completedSections.length / ONBOARDING_SECTIONS.length) * 100

  const handleCompleteApplication = async () => {
    if (!isApplicationComplete) return

    try {
      setSaveStatus("🚀 Submitting application...")
      
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          sectionData,
          completedSections
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSaveStatus("🎉 Application submitted successfully!")
        // Clear local storage after successful submission
        localStorage.removeItem("onboarding_progress")
        localStorage.removeItem("artist_id")
      } else {
        setSaveStatus(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setSaveStatus("❌ Error submitting application")
    }
  }

  const getCurrentSectionComponent = () => {
    const section = ONBOARDING_SECTIONS.find(s => s.id === currentSection)
    if (!section) return null

    const SectionComponent = section.component
    const commonProps = {
      onSectionComplete: handleSectionComplete,
      onSaveProgress: handleSaveProgress,
      artistId,
      initialData: sectionData[currentSection],
      updateSectionData: (data: any) => updateSectionData(currentSection, data),
      artistInitials: sectionData[1]?.firstName ? `${sectionData[1].firstName[0]}${sectionData[1].lastName?.[0] || ''}` : undefined
    }

    return <SectionComponent {...commonProps} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Artist Onboarding Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete all 4 sections to set up your personalized art e-commerce platform
          </p>
          {artistId && (
            <div className="flex items-center justify-center gap-4 mt-2">
              <Badge variant="outline">
                Artist ID: {artistId}
              </Badge>
              <Badge variant={isConnectedToDatabase ? "default" : "secondary"}>
                {isConnectedToDatabase ? "🟢 Database Connected" : "🔶 Local Mode"}
              </Badge>
            </div>
          )}
        </div>

        {/* Database Connection Status */}
        {!isConnectedToDatabase && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                <strong>Local Mode:</strong> Your progress is being saved locally. 
                Database connection will be restored automatically when available.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Progress Overview */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSections.length} of {ONBOARDING_SECTIONS.length} sections completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert>
              <AlertDescription>{saveStatus}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Application Complete Banner */}
        {isApplicationComplete && (
          <div className="max-w-4xl mx-auto mb-8">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-green-800">
                  🎉 Congratulations! You've completed all sections. Your artist platform is ready!
                </span>
                <Button onClick={handleCompleteApplication} className="ml-4">
                  Submit Application
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
                <CardDescription>
                  Click any section to navigate. Progress is saved automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ONBOARDING_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      currentSection === section.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {section.id}. {section.title}
                          </span>
                          {completedSections.includes(section.id) && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              ✓
                            </Badge>
                          )}
                          {section.required && !completedSections.includes(section.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sections:</span>
                  <span className="font-medium">{completedSections.length}/{ONBOARDING_SECTIONS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${isApplicationComplete ? 'text-green-600' : 'text-orange-600'}`}>
                    {isApplicationComplete ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className={`font-medium ${isConnectedToDatabase ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isConnectedToDatabase ? 'Connected' : 'Local Mode'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">
                    {ONBOARDING_SECTIONS.find(s => s.id === currentSection)?.icon}
                  </span>
                  <div>
                    <div>Section {currentSection}: {ONBOARDING_SECTIONS.find(s => s.id === currentSection)?.title}</div>
                    {completedSections.includes(currentSection) && (
                      <Badge variant="default" className="mt-1 bg-green-600">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {ONBOARDING_SECTIONS.find(s => s.id === currentSection)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Render the current section component */}
                {getCurrentSectionComponent()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="max-w-6xl mx-auto mt-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => handleSectionClick(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
          >
            ← Previous Section
          </Button>
          
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span className={isConnectedToDatabase ? "text-green-600" : "text-yellow-600"}>
              {isConnectedToDatabase ? "🔄 Auto-save active" : "📱 Local save only"}
            </span>
            <span>•</span>
            <span className={isApplicationComplete ? "text-green-600 font-medium" : ""}>
              {completedSections.length}/{ONBOARDING_SECTIONS.length} completed
            </span>
            <span>•</span>
            <span className="text-xs">
              Artist ID: {artistId?.split('_')[1]}
            </span>
          </div>
          
          <Button 
            onClick={() => handleSectionClick(Math.min(ONBOARDING_SECTIONS.length, currentSection + 1))}
            disabled={currentSection === ONBOARDING_SECTIONS.length}
          >
            Next Section →
          </Button>
        </div>
      </div>
    </div>
  )
}