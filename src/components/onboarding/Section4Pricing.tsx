"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Section4FormData, 
  section4Schema, 
  section4DefaultValues,
  pricingStrategiesInfo,
  generateSKU,
  calculateFinalPrice,
  productTypeCodes,
  sizeCodes,
  mediaCodes,
  frameColorCodes
} from "@/lib/validations/section4-schema"

interface Section4PricingProps {
  onSectionComplete?: (sectionId: number) => void
  onSaveProgress?: () => void
  artistId?: string
  initialData?: Partial<Section4FormData>
  artistInitials?: string
}

export default function Section4Pricing({ 
  onSectionComplete, 
  onSaveProgress,
  artistId,
  initialData,
  artistInitials = "ALN"
}: Section4PricingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [skuPreview, setSkuPreview] = useState("")
  const [pricePreview, setPricePreview] = useState(0)
  
  const form = useForm<Section4FormData>({
    resolver: zodResolver(section4Schema),
    defaultValues: {
      ...section4DefaultValues,
      ...initialData,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "productVariants",
  })

  const { fields: wholesaleTierFields, append: appendWholesaleTier, remove: removeWholesaleTier } = useFieldArray({
    control: form.control,
    name: "wholesalePricing.wholesaleTiers",
  })

  const { fields: commissionTypeFields, append: appendCommissionType, remove: removeCommissionType } = useFieldArray({
    control: form.control,
    name: "commissionPricing.commissionTypes",
  })

  const { fields: bulkDiscountFields, append: appendBulkDiscount, remove: removeBulkDiscount } = useFieldArray({
    control: form.control,
    name: "specialPricing.bulkDiscounts",
  })

  // Watch form values for real-time updates
  const watchedValues = form.watch()

  // Update SKU and price previews
  useEffect(() => {
    if (variantFields.length > 0) {
      const firstVariant = form.getValues(`productVariants.0`)
      if (firstVariant?.productType && firstVariant?.size && firstVariant?.media) {
        const newSku = generateSKU(
          artistInitials,
          firstVariant.productType,
          firstVariant.size,
          firstVariant.media,
          firstVariant.frameColor,
          watchedValues.skuGeneration
        )
        setSkuPreview(newSku)
        
        const newPrice = calculateFinalPrice(
          firstVariant.baseCost || 0,
          firstVariant.markupPercentage || watchedValues.markupConfig.defaultMarkupPercentage,
          {
            isLimitedEdition: firstVariant.isLimitedEdition,
            limitedEditionSurcharge: firstVariant.limitedEditionPrice || 0,
            isSigned: firstVariant.isSigned,
            signedSurcharge: firstVariant.signedPrice || 0,
            taxRate: watchedValues.pricingStrategy.taxRate,
            includesTax: watchedValues.pricingStrategy.includesTax,
          }
        )
        setPricePreview(newPrice)
      }
    }
  }, [watchedValues, variantFields.length, artistInitials])

  // Auto-generate SKU for variants
  const handleGenerateSKU = (index: number) => {
    const variant = form.getValues(`productVariants.${index}`)
    if (variant.productType && variant.size && variant.media) {
      const newSku = generateSKU(
        artistInitials,
        variant.productType,
        variant.size,
        variant.media,
        variant.frameColor,
        watchedValues.skuGeneration
      )
      form.setValue(`productVariants.${index}.sku`, newSku)
    }
  }

  // Calculate final price for variant
  const handleCalculatePrice = (index: number) => {
    const variant = form.getValues(`productVariants.${index}`)
    const newPrice = calculateFinalPrice(
      variant.baseCost || 0,
      variant.markupPercentage || watchedValues.markupConfig.defaultMarkupPercentage,
      {
        isLimitedEdition: variant.isLimitedEdition,
        limitedEditionSurcharge: variant.limitedEditionPrice || 0,
        isSigned: variant.isSigned,
        signedSurcharge: variant.signedPrice || 0,
        taxRate: watchedValues.pricingStrategy.taxRate,
        includesTax: watchedValues.pricingStrategy.includesTax,
      }
    )
    form.setValue(`productVariants.${index}.finalPrice`, newPrice)
  }

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
          sectionNumber: 4,
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
  const handleSubmit = async (data: Section4FormData) => {
    try {
      setIsLoading(true)
      setErrors([])

      const response = await fetch('/api/pricing', {
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

      console.log('Section 4 submitted successfully:', result.data)
      onSectionComplete?.(4)
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
        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="markup">Markup</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="wholesale">Wholesale</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Pricing Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Pricing Strategy
                </CardTitle>
                <CardDescription>
                  Choose your core pricing approach and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Strategy Selection */}
                <div className="space-y-4">
                  <Label>Select Your Pricing Strategy</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingStrategiesInfo.map((strategy) => (
                      <div
                        key={strategy.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          form.watch("pricingStrategy.strategy") === strategy.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => form.setValue("pricingStrategy.strategy", strategy.value)}
                      >
                        <div className="space-y-2">
                          <div className="font-semibold">{strategy.label}</div>
                          <div className="text-sm text-muted-foreground">{strategy.description}</div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              Pros: {strategy.pros[0]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Cons: {strategy.cons[0]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Margin */}
                <div className="space-y-2">
                  <Label>Target Margin ({form.watch("pricingStrategy.targetMargin")}%)</Label>
                  <Slider
                    value={[form.watch("pricingStrategy.targetMargin") || 60]}
                    onValueChange={([value]) => form.setValue("pricingStrategy.targetMargin", value)}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Low (10%)</span>
                    <span>High (100%)</span>
                  </div>
                </div>

                {/* Minimum and Maximum Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Minimum Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("pricingStrategy.minimumPrice", { valueAsNumber: true })}
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <Label>Maximum Price (optional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("pricingStrategy.maximumPrice", { valueAsNumber: true })}
                      placeholder="Leave blank for no limit"
                    />
                  </div>
                </div>

                {/* Price Rounding */}
                <div>
                  <Label>Price Rounding</Label>
                  <Select
                    value={form.watch("pricingStrategy.priceRounding") || "nearest_5"}
                    onValueChange={(value) => form.setValue("pricingStrategy.priceRounding", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No rounding (e.g., $47.23)</SelectItem>
                      <SelectItem value="nearest_5">Round to nearest $5 (e.g., $45.00)</SelectItem>
                      <SelectItem value="nearest_10">Round to nearest $10 (e.g., $50.00)</SelectItem>
                      <SelectItem value="nearest_25">Round to nearest $25 (e.g., $50.00)</SelectItem>
                      <SelectItem value="nearest_50">Round to nearest $50 (e.g., $50.00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tax Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("pricingStrategy.includesTax")}
                      className="rounded"
                    />
                    <Label>Prices include tax</Label>
                  </div>
                  {form.watch("pricingStrategy.includesTax") && (
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...form.register("pricingStrategy.taxRate", { valueAsNumber: true })}
                        placeholder="8.25"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markup Configuration Tab */}
          <TabsContent value="markup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Markup Configuration
                </CardTitle>
                <CardDescription>
                  Set your markup percentages and volume discounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Markup */}
                <div className="space-y-2">
                  <Label>Default Markup ({form.watch("markupConfig.defaultMarkupPercentage")}%)</Label>
                  <Slider
                    value={[form.watch("markupConfig.defaultMarkupPercentage") || 200]}
                    onValueChange={([value]) => form.setValue("markupConfig.defaultMarkupPercentage", value)}
                    max={500}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Low (50%)</span>
                    <span>High (500%)</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Example: $20 cost + {form.watch("markupConfig.defaultMarkupPercentage")}% markup = $
                    {(20 * (1 + (form.watch("markupConfig.defaultMarkupPercentage") || 200) / 100)).toFixed(2)} final price
                  </div>
                </div>

                {/* Base Costs */}
                <div className="space-y-4">
                  <Label className="text-lg">Base Cost Categories</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(form.watch("baseCosts") || {}).map(([category, costs]) => (
                      <Card key={category} className="p-4">
                        <div className="space-y-3">
                          <h4 className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm">Base Cost</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register(`baseCosts.${category}.baseCost`, { valueAsNumber: true })}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Material Cost</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register(`baseCosts.${category}.materialCost`, { valueAsNumber: true })}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Labor Cost</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register(`baseCosts.${category}.laborCost`, { valueAsNumber: true })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Variants Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🛍️</span>
                  Product Variants & Pricing
                </CardTitle>
                <CardDescription>
                  Configure specific products with SKUs and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SKU Preview */}
                {skuPreview && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium">SKU Preview:</Label>
                    <div className="font-mono text-lg">{skuPreview}</div>
                    <div className="text-sm text-muted-foreground">
                      Price Preview: ${pricePreview.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Product Variants */}
                <div className="space-y-4">
                  {variantFields.map((variant, index) => (
                    <Card key={variant.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Product Variant {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Product Type */}
                          <div>
                            <Label>Product Type</Label>
                            <Select
                              value={form.watch(`productVariants.${index}.productType`) || ""}
                              onValueChange={(value) => {
                                form.setValue(`productVariants.${index}.productType`, value as any)
                                handleGenerateSKU(index)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(productTypeCodes).map(([key, code]) => (
                                  <SelectItem key={key} value={key}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Size */}
                          <div>
                            <Label>Size</Label>
                            <Select
                              value={form.watch(`productVariants.${index}.size`) || ""}
                              onValueChange={(value) => {
                                form.setValue(`productVariants.${index}.size`, value)
                                handleGenerateSKU(index)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(sizeCodes).map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Media */}
                          <div>
                            <Label>Media</Label>
                            <Select
                              value={form.watch(`productVariants.${index}.media`) || ""}
                              onValueChange={(value) => {
                                form.setValue(`productVariants.${index}.media`, value)
                                handleGenerateSKU(index)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select media" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(mediaCodes).map((media) => (
                                  <SelectItem key={media} value={media}>
                                    {media}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* SKU */}
                          <div>
                            <Label>SKU</Label>
                            <div className="flex gap-2">
                              <Input
                                {...form.register(`productVariants.${index}.sku`)}
                                placeholder="Auto-generated"
                                readOnly
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateSKU(index)}
                              >
                                Generate
                              </Button>
                            </div>
                          </div>

                          {/* Base Cost */}
                          <div>
                            <Label>Base Cost</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`productVariants.${index}.baseCost`, { valueAsNumber: true })}
                              placeholder="20.00"
                              onChange={() => setTimeout(() => handleCalculatePrice(index), 100)}
                            />
                          </div>

                          {/* Markup % */}
                          <div>
                            <Label>Markup %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              {...form.register(`productVariants.${index}.markupPercentage`, { valueAsNumber: true })}
                              placeholder={String(form.watch("markupConfig.defaultMarkupPercentage"))}
                              onChange={() => setTimeout(() => handleCalculatePrice(index), 100)}
                            />
                          </div>

                          {/* Final Price */}
                          <div>
                            <Label>Final Price</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register(`productVariants.${index}.finalPrice`, { valueAsNumber: true })}
                                placeholder="0.00"
                                readOnly
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCalculatePrice(index)}
                              >
                                Calc
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Special Options */}
                        <div className="flex gap-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              {...form.register(`productVariants.${index}.isLimitedEdition`)}
                              className="rounded"
                            />
                            <span className="text-sm">Limited Edition</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              {...form.register(`productVariants.${index}.isSigned`)}
                              className="rounded"
                            />
                            <span className="text-sm">Signed</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              {...form.register(`productVariants.${index}.isActive`)}
                              className="rounded"
                            />
                            <span className="text-sm">Active</span>
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendVariant({
                      sku: "",
                      productType: "unframed_print",
                      size: "8x10",
                      media: "Fine Art Rag",
                      baseCost: 0,
                      markupPercentage: form.watch("markupConfig.defaultMarkupPercentage") || 200,
                      finalPrice: 0,
                      isLimitedEdition: false,
                      isSigned: false,
                      isActive: true,
                    })}
                  >
                    Add Product Variant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wholesale & Commission Tab */}
          <TabsContent value="wholesale" className="space-y-6">
            {/* Wholesale Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏪</span>
                  Wholesale Pricing
                </CardTitle>
                <CardDescription>
                  Configure bulk pricing for retailers and galleries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("wholesalePricing.offersWholesale")}
                    className="rounded"
                  />
                  <Label>Offer wholesale pricing</Label>
                </div>

                {form.watch("wholesalePricing.offersWholesale") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          {...form.register("wholesalePricing.minimumQuantity", { valueAsNumber: true })}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label>Default Discount (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          {...form.register("wholesalePricing.wholesaleDiscountPercentage", { valueAsNumber: true })}
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Payment Terms</Label>
                      <Select
                        value={form.watch("wholesalePricing.paymentTerms") || "net_30"}
                        onValueChange={(value) => form.setValue("wholesalePricing.paymentTerms", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net_15">Net 15</SelectItem>
                          <SelectItem value="net_30">Net 30</SelectItem>
                          <SelectItem value="net_60">Net 60</SelectItem>
                          <SelectItem value="payment_on_delivery">Payment on Delivery</SelectItem>
                          <SelectItem value="50_50_split">50/50 Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Wholesale Terms</Label>
                      <Textarea
                        {...form.register("wholesalePricing.wholesaleTerms")}
                        placeholder="Describe your wholesale terms and conditions..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  Commission Pricing
                </CardTitle>
                <CardDescription>
                  Configure pricing for custom commissioned work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("commissionPricing.offersCommissions")}
                    className="rounded"
                  />
                  <Label>Accept commission work</Label>
                </div>

                {form.watch("commissionPricing.offersCommissions") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Base Commission Rate ($/hour)</Label>
                        <Input
                          type="number"
                          min="0"
                          {...form.register("commissionPricing.baseCommissionRate", { valueAsNumber: true })}
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <Label>Deposit Percentage (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...form.register("commissionPricing.depositPercentage", { valueAsNumber: true })}
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <Label>Rush Order Surcharge (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          {...form.register("commissionPricing.rushOrderSurcharge", { valueAsNumber: true })}
                          placeholder="25"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Included Revisions</Label>
                        <Input
                          type="number"
                          min="0"
                          {...form.register("commissionPricing.revisionPolicy.includedRevisions", { valueAsNumber: true })}
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <Label>Additional Revision Cost ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          {...form.register("commissionPricing.revisionPolicy.additionalRevisionCost", { valueAsNumber: true })}
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* SKU Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  SKU Generation Settings
                </CardTitle>
                <CardDescription>
                  Configure how product SKUs are automatically generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("skuGeneration.useAutoGeneration")}
                    className="rounded"
                  />
                  <Label>Use automatic SKU generation</Label>
                </div>

                {form.watch("skuGeneration.useAutoGeneration") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>SKU Prefix</Label>
                        <Input
                          {...form.register("skuGeneration.prefix")}
                          placeholder="ALN"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Label>Separator</Label>
                        <Input
                          {...form.register("skuGeneration.separator")}
                          placeholder="-"
                          maxLength={1}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...form.register("skuGeneration.includeArtistInitials")}
                          className="rounded"
                        />
                        <span className="text-sm">Artist Initials</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...form.register("skuGeneration.includeProductCode")}
                          className="rounded"
                        />
                        <span className="text-sm">Product Code</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...form.register("skuGeneration.includeSizeCode")}
                          className="rounded"
                        />
                        <span className="text-sm">Size Code</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...form.register("skuGeneration.includeMediaCode")}
                          className="rounded"
                        />
                        <span className="text-sm">Media Code</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...form.register("skuGeneration.includeFrameCode")}
                          className="rounded"
                        />
                        <span className="text-sm">Frame Code</span>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Display Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💻</span>
                  Price Display Preferences
                </CardTitle>
                <CardDescription>
                  Configure how prices appear on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("priceDisplay.showPricesOnWebsite")}
                      className="rounded"
                    />
                    <span className="text-sm">Show prices on website</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("priceDisplay.showStartingAtPrices")}
                      className="rounded"
                    />
                    <span className="text-sm">Show "starting at" prices</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("priceDisplay.showPriceRanges")}
                      className="rounded"
                    />
                    <span className="text-sm">Show price ranges</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("priceDisplay.hideOutOfStockPrices")}
                      className="rounded"
                    />
                    <span className="text-sm">Hide out-of-stock prices</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register("priceDisplay.showDiscountedPrices")}
                      className="rounded"
                    />
                    <span className="text-sm">Show discounted prices</span>
                  </label>
                </div>

                <div>
                  <Label>Price Format</Label>
                  <Select
                    value={form.watch("priceDisplay.priceFormat") || "$0.00"}
                    onValueChange={(value) => form.setValue("priceDisplay.priceFormat", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$0.00">$25.00</SelectItem>
                      <SelectItem value="$0">$25</SelectItem>
                      <SelectItem value="$0.99">$24.99</SelectItem>
                      <SelectItem value="$0,000.00">$1,250.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
            {isLoading ? "Saving..." : "Complete Section 4"}
          </Button>
        </div>
      </form>
    </div>
  )
}
