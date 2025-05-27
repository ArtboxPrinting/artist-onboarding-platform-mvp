"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Section3FormData, 
  section3Schema, 
  section3DefaultValues,
  standardSizesInches,
  commonPrintMedia,
  commonFrameColors
} from "@/lib/validations/section3-schema"

interface Section3ProductConfigProps {
  onSectionComplete?: (sectionId: number) => void
  onSaveProgress?: () => void
  artistId?: string
  initialData?: Partial<Section3FormData>
}

export default function Section3ProductConfig({ 
  onSectionComplete, 
  onSaveProgress,
  artistId,
  initialData 
}: Section3ProductConfigProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const form = useForm<Section3FormData>({
    resolver: zodResolver(section3Schema),
    defaultValues: {
      ...section3DefaultValues,
      ...initialData,
      availableSizes: initialData?.availableSizes?.length ? 
        initialData.availableSizes : 
        standardSizesInches.slice(0, 6),
      printMediaOptions: initialData?.printMediaOptions?.length ? 
        initialData.printMediaOptions : 
        commonPrintMedia.slice(0, 3),
    },
  })

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "availableSizes",
  })

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: "printMediaOptions",
  })

  // Save as draft
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
          sectionNumber: 3,
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
  const handleSubmit = async (data: Section3FormData) => {
    try {
      setIsLoading(true)
      setErrors([])

      const response = await fetch('/api/product-configuration', {
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

      console.log('Section 3 submitted successfully:', result.data)
      onSectionComplete?.(3)
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
        {/* Product Offerings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🛏️</span>
              Product Offerings
            </CardTitle>
            <CardDescription>
              Choose which types of products you want to offer to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.unframedPrints")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Unframed Prints</div>
                  <div className="text-sm text-muted-foreground">High-quality prints ready for framing</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.framedPrints")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Framed Prints</div>
                  <div className="text-sm text-muted-foreground">Ready-to-hang framed artwork</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.canvasWraps")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Canvas Wraps</div>
                  <div className="text-sm text-muted-foreground">Gallery-style canvas on stretcher bars</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.greetingCards")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Greeting Cards</div>
                  <div className="text-sm text-muted-foreground">Art cards with your designs</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.posters")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Posters</div>
                  <div className="text-sm text-muted-foreground">Large format prints for decoration</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  {...form.register("productOfferings.metalPrints")}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">Metal Prints</div>
                  <div className="text-sm text-muted-foreground">Modern aluminum prints</div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Available Sizes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Available Sizes
            </CardTitle>
            <CardDescription>
              Configure the sizes you want to offer for your prints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="unitSystem">Unit System</Label>
              <Select
                value={form.watch("unitSystem") || "inches"}
                onValueChange={(value) => form.setValue("unitSystem", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">Inches</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {sizeFields.map((size, index) => (
                <div key={size.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Input
                    placeholder="Size name (e.g., 8x10)"
                    {...form.register(`availableSizes.${index}.name`)}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Width"
                    {...form.register(`availableSizes.${index}.width`, { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Height"
                    {...form.register(`availableSizes.${index}.height`, { valueAsNumber: true })}
                    className="w-24"
                  />
                  <Select
                    value={form.watch(`availableSizes.${index}.unit`) || "inches"}
                    onValueChange={(value) => form.setValue(`availableSizes.${index}.unit`, value as any)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inches">in</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSize(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => appendSize({ 
                  name: "", 
                  width: 0, 
                  height: 0, 
                  unit: "inches", 
                  isStandard: false, 
                  isActive: true, 
                  sortOrder: sizeFields.length 
                })}
              >
                Add Custom Size
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print Media Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🖨️</span>
              Print Media Options
            </CardTitle>
            <CardDescription>
              Configure the print media types you want to offer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {mediaFields.map((media, index) => (
                <div key={media.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Media name (e.g., Fine Art Rag)"
                      {...form.register(`printMediaOptions.${index}.name`)}
                      className="font-medium"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedia(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Finish</Label>
                      <Select
                        value={form.watch(`printMediaOptions.${index}.finish`) || "matte"}
                        onValueChange={(value) => form.setValue(`printMediaOptions.${index}.finish`, value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matte">Matte</SelectItem>
                          <SelectItem value="satin">Satin</SelectItem>
                          <SelectItem value="glossy">Glossy</SelectItem>
                          <SelectItem value="metallic">Metallic</SelectItem>
                          <SelectItem value="textured">Textured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Additional Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...form.register(`printMediaOptions.${index}.additionalCost`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        {...form.register(`printMediaOptions.${index}.isActive`)}
                        className="rounded"
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => appendMedia({
                  name: "",
                  description: "",
                  finish: "matte",
                  isArchival: true,
                  isActive: true,
                  additionalCost: 0,
                  suitableFor: ["prints"],
                  colorProfile: "sRGB"
                })}
              >
                Add Print Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Special Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Special Options
            </CardTitle>
            <CardDescription>
              Configure special services and premium options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("specialOptions.signedPrints.offered")}
                    className="rounded"
                  />
                  <span className="font-medium">Offer signed prints</span>
                </label>
                
                {form.watch("specialOptions.signedPrints.offered") && (
                  <div>
                    <Label>Additional cost for signature</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("specialOptions.signedPrints.additionalCost", { valueAsNumber: true })}
                      placeholder="25.00"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("specialOptions.limitedEditions.offered")}
                    className="rounded"
                  />
                  <span className="font-medium">Offer limited editions</span>
                </label>
                
                {form.watch("specialOptions.limitedEditions.offered") && (
                  <div className="space-y-2">
                    <div>
                      <Label>Default edition size</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register("specialOptions.limitedEditions.defaultEditionSize", { valueAsNumber: true })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label>Additional cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register("specialOptions.limitedEditions.additionalCost", { valueAsNumber: true })}
                        placeholder="50.00"
                      />
                    </div>
                  </div>
                )}
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
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Complete Section 3"}
          </Button>
        </div>
      </form>
    </div>
  )
}
