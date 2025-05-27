"use client"

import { useState, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Section2FormData, 
  section2Schema, 
  section2DefaultValues,
  defaultArtwork,
  commonMediums,
  commonKeywords,
  ArtworkData
} from "@/lib/validations/section2-schema"
import { 
  createArtwork, 
  updateArtwork, 
  deleteArtwork, 
  getArtworks,
  uploadFile,
  recordFileUpload 
} from "@/lib/supabase/artists"

interface Section2ArtworkCatalogProps {
  onSectionComplete?: (sectionId: number) => void
  onSaveProgress?: () => void
  artistId?: string
  initialData?: Partial<Section2FormData>
}

export default function Section2ArtworkCatalog({ 
  onSectionComplete, 
  onSaveProgress,
  artistId,
  initialData 
}: Section2ArtworkCatalogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [artworkPreviews, setArtworkPreviews] = useState<Record<string, string>>({})
  
  // File input refs for each artwork
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const form = useForm<Section2FormData>({
    resolver: zodResolver(section2Schema),
    defaultValues: {
      ...section2DefaultValues,
      ...initialData,
    },
  })

  const { fields: artworkFields, append: appendArtwork, remove: removeArtwork, update: updateArtworkField } = useFieldArray({
    control: form.control,
    name: "artworks",
  })

  // Add new artwork
  const handleAddArtwork = () => {
    appendArtwork({ ...defaultArtwork, id: `artwork_${Date.now()}` })
  }

  // Remove artwork
  const handleRemoveArtwork = (index: number) => {
    const artwork = artworkFields[index]
    if (artwork.id && artworkPreviews[artwork.id]) {
      URL.revokeObjectURL(artworkPreviews[artwork.id])
      delete artworkPreviews[artwork.id]
    }
    removeArtwork(index)
  }

  // Handle file upload for artwork
  const handleArtworkFileUpload = async (
    file: File,
    artworkIndex: number,
    fileType: 'original' | 'printReady'
  ) => {
    try {
      const artworkId = artworkFields[artworkIndex].id || `artwork_${artworkIndex}`
      const progressKey = `${artworkId}_${fileType}`
      
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }))
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const progress = (prev[progressKey] || 0) + 20
          if (progress >= 100) {
            clearInterval(interval)
            return { ...prev, [progressKey]: 100 }
          }
          return { ...prev, [progressKey]: progress }
        })
      }, 200)

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file)
        setArtworkPreviews(prev => ({ ...prev, [artworkId]: previewUrl }))
      }

      // Update form data
      setTimeout(() => {
        const currentArtwork = form.getValues(`artworks.${artworkIndex}`)
        const fileData = {
          fileName: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
        }

        if (fileType === 'original') {
          updateArtworkField(artworkIndex, {
            ...currentArtwork,
            originalFile: fileData
          })
        } else {
          updateArtworkField(artworkIndex, {
            ...currentArtwork,
            printReadyFile: fileData
          })
        }
      }, 1000)

      return {
        publicUrl: URL.createObjectURL(file),
        originalName: file.name,
        fileName: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error(`Error uploading ${fileType} file:`, error)
      setErrors(prev => [...prev, `Failed to upload ${fileType} file`])
      return null
    }
  }

  // Handle file input change
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    artworkIndex: number,
    fileType: 'original' | 'printReady'
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleArtworkFileUpload(file, artworkIndex, fileType)
    }
  }

  // Handle keyword management
  const handleAddKeyword = (artworkIndex: number, keyword: string) => {
    const currentArtwork = form.getValues(`artworks.${artworkIndex}`)
    const currentKeywords = currentArtwork.keywords || []
    
    if (!currentKeywords.includes(keyword) && currentKeywords.length < 20) {
      updateArtworkField(artworkIndex, {
        ...currentArtwork,
        keywords: [...currentKeywords, keyword]
      })
    }
  }

  const handleRemoveKeyword = (artworkIndex: number, keywordToRemove: string) => {
    const currentArtwork = form.getValues(`artworks.${artworkIndex}`)
    const currentKeywords = currentArtwork.keywords || []
    
    updateArtworkField(artworkIndex, {
      ...currentArtwork,
      keywords: currentKeywords.filter(keyword => keyword !== keywordToRemove)
    })
  }

  // Calculate artwork orientation based on dimensions
  const calculateOrientation = (width: number, height: number): "portrait" | "landscape" | "square" => {
    if (width === height) return "square"
    return width > height ? "landscape" : "portrait"
  }

  // Update artwork dimensions and orientation
  const handleDimensionChange = (artworkIndex: number, field: 'width' | 'height', value: number) => {
    const currentArtwork = form.getValues(`artworks.${artworkIndex}`)
    const newDimensions = { ...currentArtwork.dimensions, [field]: value }
    const orientation = calculateOrientation(newDimensions.width, newDimensions.height)
    
    updateArtworkField(artworkIndex, {
      ...currentArtwork,
      dimensions: newDimensions,
      orientation
    })
  }

  // Save as draft via API
  const handleSaveAsDraft = async () => {
    try {
      setIsSaving(true)
      setErrors([])
      
      const formData = form.getValues()
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          artistId,
          sectionNumber: 2,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrors([result.error || 'Failed to save draft'])
        return
      }

      console.log('Draft saved:', result.data)
      onSaveProgress?.()
    } catch (error) {
      console.error('Error saving draft:', error)
      setErrors(['Failed to save draft'])
    } finally {
      setIsSaving(false)
    }
  }

  // Submit section
  const handleSubmit = async (data: Section2FormData) => {
    try {
      setIsLoading(true)
      setErrors([])

      // Validate minimum artworks
      if (data.artworks.length === 0) {
        setErrors(['Please add at least one artwork'])
        return
      }

      const response = await fetch('/api/artwork-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          artistId,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setErrors([result.error || 'Failed to submit section'])
        return
      }

      console.log('Section 2 submitted successfully:', result.data)
      onSectionComplete?.(2)
    } catch (error) {
      console.error('Error submitting section:', error)
      setErrors(['Failed to submit section'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Catalog Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              Artwork Catalog Overview
            </CardTitle>
            <CardDescription>
              Provide an overview of your artwork collection and artistic statement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="catalogDescription">Catalog Description</Label>
              <Textarea
                id="catalogDescription"
                {...form.register("catalogDescription")}
                placeholder="Describe your artwork collection, themes, and artistic journey..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will appear as an introduction to your artwork catalog.
              </p>
            </div>

            <div>
              <Label htmlFor="artistStatement">Artist Statement</Label>
              <Textarea
                id="artistStatement"
                {...form.register("artistStatement")}
                placeholder="Your formal artist statement about your work, philosophy, and creative process..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                A more detailed statement about your artistic practice and vision.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Artwork Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Artwork Collection
            </CardTitle>
            <CardDescription>
              Upload and manage your artwork portfolio with metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {artworkFields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground mb-4">No artworks added yet</p>
                <Button type="button" onClick={handleAddArtwork}>
                  Add Your First Artwork
                </Button>
              </div>
            )}

            {artworkFields.map((artwork, index) => (
              <Card key={artwork.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Artwork #{index + 1}
                      {artwork.title && ` - ${artwork.title}`}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveArtwork(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Artwork Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`artwork-${index}-title`}>Title *</Label>
                      <Input
                        id={`artwork-${index}-title`}
                        {...form.register(`artworks.${index}.title`)}
                        placeholder="Artwork title"
                      />
                      {form.formState.errors.artworks?.[index]?.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.artworks[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`artwork-${index}-year`}>Year Created *</Label>
                      <Input
                        id={`artwork-${index}-year`}
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        {...form.register(`artworks.${index}.yearCreated`, { valueAsNumber: true })}
                        placeholder="2024"
                      />
                      {form.formState.errors.artworks?.[index]?.yearCreated && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.artworks[index]?.yearCreated?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Medium and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`artwork-${index}-medium`}>Medium *</Label>
                      <Select
                        value={form.watch(`artworks.${index}.medium`) || ""}
                        onValueChange={(value) => {
                          const currentArtwork = form.getValues(`artworks.${index}`)
                          updateArtworkField(index, { ...currentArtwork, medium: value })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonMediums.map((medium) => (
                            <SelectItem key={medium} value={medium}>
                              {medium}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.artworks?.[index]?.medium && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.artworks[index]?.medium?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`artwork-${index}-orientation`}>Orientation</Label>
                      <Select
                        value={form.watch(`artworks.${index}.orientation`) || "landscape"}
                        onValueChange={(value) => {
                          const currentArtwork = form.getValues(`artworks.${index}`)
                          updateArtworkField(index, { 
                            ...currentArtwork, 
                            orientation: value as "portrait" | "landscape" | "square" 
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landscape">Landscape (wider than tall)</SelectItem>
                          <SelectItem value="portrait">Portrait (taller than wide)</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`artwork-${index}-width`}>Width *</Label>
                      <Input
                        id={`artwork-${index}-width`}
                        type="number"
                        step="0.1"
                        min="0"
                        {...form.register(`artworks.${index}.dimensions.width`, { 
                          valueAsNumber: true,
                          onChange: (e) => handleDimensionChange(index, 'width', parseFloat(e.target.value) || 0)
                        })}
                        placeholder="24"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`artwork-${index}-height`}>Height *</Label>
                      <Input
                        id={`artwork-${index}-height`}
                        type="number"
                        step="0.1"
                        min="0"
                        {...form.register(`artworks.${index}.dimensions.height`, { 
                          valueAsNumber: true,
                          onChange: (e) => handleDimensionChange(index, 'height', parseFloat(e.target.value) || 0)
                        })}
                        placeholder="36"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`artwork-${index}-unit`}>Unit</Label>
                      <Select
                        value={form.watch(`artworks.${index}.dimensions.unit`) || "inches"}
                        onValueChange={(value) => {
                          const currentArtwork = form.getValues(`artworks.${index}`)
                          updateArtworkField(index, { 
                            ...currentArtwork, 
                            dimensions: { 
                              ...currentArtwork.dimensions, 
                              unit: value as "inches" | "cm" 
                            }
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inches">Inches</SelectItem>
                          <SelectItem value="cm">Centimeters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor={`artwork-${index}-description`}>Description</Label>
                    <Textarea
                      id={`artwork-${index}-description`}
                      {...form.register(`artworks.${index}.description`)}
                      placeholder="Describe this artwork, its inspiration, techniques used..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <Label>Keywords</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add keywords to help people discover this artwork (max 20)
                    </p>
                    
                    {/* Display current keywords */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(form.watch(`artworks.${index}.keywords`) || []).map((keyword, keywordIndex) => (
                        <Badge
                          key={keywordIndex}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveKeyword(index, keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>

                    {/* Suggested keywords */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {commonKeywords.map((keyword) => {
                        const currentKeywords = form.watch(`artworks.${index}.keywords`) || []
                        const isSelected = currentKeywords.includes(keyword)
                        return (
                          <Badge
                            key={keyword}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveKeyword(index, keyword)
                              } else {
                                handleAddKeyword(index, keyword)
                              }
                            }}
                          >
                            {keyword}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original File Upload */}
                    <div>
                      <Label>Original Artwork File</Label>
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*,.pdf'
                          input.onchange = (e) => handleFileInputChange(e as any, index, 'original')
                          input.click()
                        }}
                      >
                        {artwork.originalFile?.fileName ? (
                          <div>
                            <p className="text-sm font-medium">{artwork.originalFile.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Click to upload original file</p>
                            <p className="text-xs text-muted-foreground mt-1">High-res image or PDF</p>
                          </div>
                        )}
                        
                        {/* Progress indicator */}
                        {uploadProgress[`${artwork.id}_original`] !== undefined && 
                         uploadProgress[`${artwork.id}_original`] < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[`${artwork.id}_original`]}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Print-Ready File Upload */}
                    <div>
                      <Label>Print-Ready File (Optional)</Label>
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*,.pdf'
                          input.onchange = (e) => handleFileInputChange(e as any, index, 'printReady')
                          input.click()
                        }}
                      >
                        {artwork.printReadyFile?.fileName ? (
                          <div>
                            <p className="text-sm font-medium">{artwork.printReadyFile.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Click to upload print-ready file</p>
                            <p className="text-xs text-muted-foreground mt-1">Optimized for printing</p>
                          </div>
                        )}
                        
                        {/* Progress indicator */}
                        {uploadProgress[`${artwork.id}_printReady`] !== undefined && 
                         uploadProgress[`${artwork.id}_printReady`] < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[`${artwork.id}_printReady`]}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Artwork Preview */}
                  {artworkPreviews[artwork.id] && (
                    <div>
                      <Label>Preview</Label>
                      <div className="mt-2">
                        <img
                          src={artworkPreviews[artwork.id]}
                          alt={artwork.title || 'Artwork preview'}
                          className="max-w-full h-48 object-contain border rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Availability Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Availability</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...form.register(`artworks.${index}.isAvailableForPrint`)}
                            className="rounded"
                          />
                          <span className="text-sm">Available for prints</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...form.register(`artworks.${index}.isAvailableAsOriginal`)}
                            className="rounded"
                          />
                          <span className="text-sm">Available as original</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...form.register(`artworks.${index}.isLimitedEdition`)}
                            className="rounded"
                          />
                          <span className="text-sm">Limited edition prints</span>
                        </label>
                      </div>
                    </div>

                    {form.watch(`artworks.${index}.isLimitedEdition`) && (
                      <div>
                        <Label htmlFor={`artwork-${index}-editionSize`}>Edition Size</Label>
                        <Input
                          id={`artwork-${index}-editionSize`}
                          type="number"
                          min="1"
                          max="1000"
                          {...form.register(`artworks.${index}.limitedEditionSize`, { valueAsNumber: true })}
                          placeholder="100"
                        />
                      </div>
                    )}

                    {form.watch(`artworks.${index}.isAvailableAsOriginal`) && (
                      <div>
                        <Label htmlFor={`artwork-${index}-originalPrice`}>Original Price</Label>
                        <Input
                          id={`artwork-${index}-originalPrice`}
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`artworks.${index}.originalPrice`, { valueAsNumber: true })}
                          placeholder="2500.00"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Artwork Button */}
            {artworkFields.length > 0 && (
              <div className="text-center">
                <Button type="button" variant="outline" onClick={handleAddArtwork}>
                  Add Another Artwork
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watermark and File Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              File Upload Preferences
            </CardTitle>
            <CardDescription>
              Configure default settings for your artwork files and watermarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    {...form.register("defaultWatermarkSettings.useWatermark")}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Use watermark on preview images</span>
                </label>

                {form.watch("defaultWatermarkSettings.useWatermark") && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="watermarkText">Watermark Text</Label>
                      <Input
                        id="watermarkText"
                        {...form.register("defaultWatermarkSettings.watermarkText")}
                        placeholder="© Your Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="watermarkPosition">Position</Label>
                      <Select
                        value={form.watch("defaultWatermarkSettings.watermarkPosition") || "bottom-right"}
                        onValueChange={(value) => 
                          form.setValue("defaultWatermarkSettings.watermarkPosition", value as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    {...form.register("fileUploadPreferences.maxFileSize", { valueAsNumber: true })}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Processing Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...form.register("fileUploadPreferences.generateThumbnails")}
                        className="rounded"
                      />
                      <span className="text-sm">Generate thumbnails automatically</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...form.register("fileUploadPreferences.autoOptimize")}
                        className="rounded"
                      />
                      <span className="text-sm">Optimize images for web display</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || artworkFields.length === 0}
          >
            {isLoading ? "Saving..." : "Complete Section 2"}
          </Button>
        </div>
      </form>
    </div>
  )
}
