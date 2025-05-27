import { z } from "zod"

// Product size validation schema
export const productSizeSchema = z.object({
  name: z.string().min(1, "Size name required"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  unit: z.enum(["inches", "cm"]),
  isStandard: z.boolean().default(true),
  isActive: z.boolean().default(true),
  aspectRatio: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

// Frame options schema
export const frameOptionsSchema = z.object({
  colors: z.array(z.object({
    name: z.string().min(1, "Color name required"),
    hexCode: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
    isActive: z.boolean().default(true),
    additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
  })).optional().or(z.literal([])),
  materials: z.array(z.object({
    name: z.string().min(1, "Material name required"),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
  })).optional().or(z.literal([])),
  matting: z.object({
    offered: z.boolean().default(true),
    colors: z.array(z.string()).default(["White", "Black", "Cream", "Gray"]),
    additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
  }),
  glazing: z.object({
    offered: z.boolean().default(true),
    types: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      additionalCost: z.number().min(0).default(0),
    })).default([
      { name: "Standard Glass", description: "Basic protection", additionalCost: 0 },
      { name: "UV-Protective Glass", description: "Prevents fading", additionalCost: 15 },
      { name: "Museum Glass", description: "Premium anti-reflective", additionalCost: 35 },
    ]),
  }),
})

// Print media options schema
export const printMediaSchema = z.object({
  name: z.string().min(1, "Media name required"),
  description: z.string().max(500, "Description too long").optional().or(z.literal("")),
  finish: z.enum(["matte", "satin", "glossy", "metallic", "textured"]),
  weight: z.string().optional().or(z.literal("")), // e.g., "300gsm"
  isArchival: z.boolean().default(true),
  isActive: z.boolean().default(true),
  additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
  suitableFor: z.array(z.enum(["prints", "canvas", "cards", "posters"])).default(["prints"]),
  colorProfile: z.enum(["sRGB", "Adobe RGB", "P3"]).default("sRGB"),
})

// Section 3: Product Types & Variants validation schema
export const section3Schema = z.object({
  // Product offerings
  productOfferings: z.object({
    unframedPrints: z.boolean().default(true),
    framedPrints: z.boolean().default(true),
    canvasWraps: z.boolean().default(true),
    metalPrints: z.boolean().default(false),
    acrylicPrints: z.boolean().default(false),
    greetingCards: z.boolean().default(true),
    postcards: z.boolean().default(false),
    posters: z.boolean().default(true),
    stickers: z.boolean().default(false),
    customProducts: z.array(z.object({
      name: z.string().min(1, "Product name required"),
      description: z.string().max(500, "Description too long").optional().or(z.literal("")),
      isActive: z.boolean().default(true),
    })).optional().or(z.literal([])),
  }),

  // Size configurations
  availableSizes: z.array(productSizeSchema).min(1, "At least one size must be available"),
  allowCustomSizes: z.boolean().default(false),
  customSizeConstraints: z.object({
    minWidth: z.number().positive().optional(),
    maxWidth: z.number().positive().optional(),
    minHeight: z.number().positive().optional(),
    maxHeight: z.number().positive().optional(),
    aspectRatioFixed: z.boolean().default(false),
  }).optional(),

  // Unit system preference
  unitSystem: z.enum(["inches", "cm", "both"]).default("inches"),

  // Print media options
  printMediaOptions: z.array(printMediaSchema).min(1, "At least one print media must be available"),

  // Frame configurations
  frameOptions: frameOptionsSchema,

  // Canvas wrap options
  canvasWrapOptions: z.object({
    offered: z.boolean().default(true),
    wrapDepths: z.array(z.object({
      depth: z.number().positive(),
      unit: z.enum(["inches", "cm"]),
      additionalCost: z.number().min(0).default(0),
    })).default([
      { depth: 0.75, unit: "inches", additionalCost: 0 },
      { depth: 1.5, unit: "inches", additionalCost: 10 },
    ]),
    edgeFinishes: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      additionalCost: z.number().min(0).default(0),
    })).default([
      { name: "Image Wrap", description: "Image extends around edges", additionalCost: 0 },
      { name: "White Edges", description: "Clean white border", additionalCost: 0 },
      { name: "Black Edges", description: "Professional black border", additionalCost: 5 },
    ]),
  }),

  // Special options
  specialOptions: z.object({
    signedPrints: z.object({
      offered: z.boolean().default(true),
      additionalCost: z.number().min(0, "Cost cannot be negative").default(25),
      description: z.string().optional().or(z.literal("")),
    }),
    limitedEditions: z.object({
      offered: z.boolean().default(true),
      defaultEditionSize: z.number().int().positive().default(100),
      certificateIncluded: z.boolean().default(true),
      additionalCost: z.number().min(0, "Cost cannot be negative").default(50),
    }),
    customCommissions: z.object({
      offered: z.boolean().default(true),
      requiresConsultation: z.boolean().default(true),
      minimumPrice: z.number().positive().optional(),
      description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
    }),
  }),

  // Packaging preferences
  packagingOptions: z.object({
    ecoFriendly: z.boolean().default(true),
    giftWrapping: z.boolean().default(true),
    customBranding: z.boolean().default(false),
    protectivePackaging: z.boolean().default(true),
    includeCertificate: z.boolean().default(false),
    additionalNotes: z.string().max(500, "Notes too long").optional().or(z.literal("")),
  }),

  // Quality standards
  qualityStandards: z.object({
    printResolution: z.number().int().positive().default(300), // DPI
    colorAccuracy: z.enum(["standard", "enhanced", "professional"]).default("enhanced"),
    qualityControl: z.boolean().default(true),
    returnPolicy: z.object({
      acceptReturns: z.boolean().default(true),
      returnPeriod: z.number().int().positive().default(30), // days
      conditions: z.string().max(1000, "Conditions too long").optional().or(z.literal("")),
    }),
  }),
})

export type Section3FormData = z.infer<typeof section3Schema>
export type ProductSize = z.infer<typeof productSizeSchema>
export type PrintMedia = z.infer<typeof printMediaSchema>

// Default values for the form
export const section3DefaultValues: Section3FormData = {
  productOfferings: {
    unframedPrints: true,
    framedPrints: true,
    canvasWraps: true,
    metalPrints: false,
    acrylicPrints: false,
    greetingCards: true,
    postcards: false,
    posters: true,
    stickers: false,
    customProducts: [],
  },
  availableSizes: [],
  allowCustomSizes: false,
  unitSystem: "inches",
  printMediaOptions: [],
  frameOptions: {
    colors: [],
    materials: [],
    matting: {
      offered: true,
      colors: ["White", "Black", "Cream", "Gray"],
      additionalCost: 0,
    },
    glazing: {
      offered: true,
      types: [
        { name: "Standard Glass", description: "Basic protection", additionalCost: 0 },
        { name: "UV-Protective Glass", description: "Prevents fading", additionalCost: 15 },
        { name: "Museum Glass", description: "Premium anti-reflective", additionalCost: 35 },
      ],
    },
  },
  canvasWrapOptions: {
    offered: true,
    wrapDepths: [
      { depth: 0.75, unit: "inches", additionalCost: 0 },
      { depth: 1.5, unit: "inches", additionalCost: 10 },
    ],
    edgeFinishes: [
      { name: "Image Wrap", description: "Image extends around edges", additionalCost: 0 },
      { name: "White Edges", description: "Clean white border", additionalCost: 0 },
      { name: "Black Edges", description: "Professional black border", additionalCost: 5 },
    ],
  },
  specialOptions: {
    signedPrints: {
      offered: true,
      additionalCost: 25,
      description: "",
    },
    limitedEditions: {
      offered: true,
      defaultEditionSize: 100,
      certificateIncluded: true,
      additionalCost: 50,
    },
    customCommissions: {
      offered: true,
      requiresConsultation: true,
      description: "",
    },
  },
  packagingOptions: {
    ecoFriendly: true,
    giftWrapping: true,
    customBranding: false,
    protectivePackaging: true,
    includeCertificate: false,
    additionalNotes: "",
  },
  qualityStandards: {
    printResolution: 300,
    colorAccuracy: "enhanced",
    qualityControl: true,
    returnPolicy: {
      acceptReturns: true,
      returnPeriod: 30,
      conditions: "",
    },
  },
}

// Standard print sizes (inches)
export const standardSizesInches: ProductSize[] = [
  { name: "5x7", width: 5, height: 7, unit: "inches", isStandard: true, isActive: true, aspectRatio: "5:7", sortOrder: 1 },
  { name: "8x10", width: 8, height: 10, unit: "inches", isStandard: true, isActive: true, aspectRatio: "4:5", sortOrder: 2 },
  { name: "11x14", width: 11, height: 14, unit: "inches", isStandard: true, isActive: true, aspectRatio: "11:14", sortOrder: 3 },
  { name: "12x16", width: 12, height: 16, unit: "inches", isStandard: true, isActive: true, aspectRatio: "3:4", sortOrder: 4 },
  { name: "16x20", width: 16, height: 20, unit: "inches", isStandard: true, isActive: true, aspectRatio: "4:5", sortOrder: 5 },
  { name: "18x24", width: 18, height: 24, unit: "inches", isStandard: true, isActive: true, aspectRatio: "3:4", sortOrder: 6 },
  { name: "24x30", width: 24, height: 30, unit: "inches", isStandard: true, isActive: true, aspectRatio: "4:5", sortOrder: 7 },
  { name: "24x36", width: 24, height: 36, unit: "inches", isStandard: true, isActive: true, aspectRatio: "2:3", sortOrder: 8 },
]

// Standard print sizes (cm)
export const standardSizesCm: ProductSize[] = [
  { name: "13x18", width: 13, height: 18, unit: "cm", isStandard: true, isActive: true, aspectRatio: "13:18", sortOrder: 1 },
  { name: "20x25", width: 20, height: 25, unit: "cm", isStandard: true, isActive: true, aspectRatio: "4:5", sortOrder: 2 },
  { name: "30x40", width: 30, height: 40, unit: "cm", isStandard: true, isActive: true, aspectRatio: "3:4", sortOrder: 3 },
  { name: "40x50", width: 40, height: 50, unit: "cm", isStandard: true, isActive: true, aspectRatio: "4:5", sortOrder: 4 },
  { name: "50x70", width: 50, height: 70, unit: "cm", isStandard: true, isActive: true, aspectRatio: "5:7", sortOrder: 5 },
  { name: "60x80", width: 60, height: 80, unit: "cm", isStandard: true, isActive: true, aspectRatio: "3:4", sortOrder: 6 },
]

// Common print media options
export const commonPrintMedia: PrintMedia[] = [
  {
    name: "Fine Art Rag",
    description: "Museum quality cotton rag paper with matte finish",
    finish: "matte",
    weight: "310gsm",
    isArchival: true,
    isActive: true,
    additionalCost: 0,
    suitableFor: ["prints"],
    colorProfile: "Adobe RGB",
  },
  {
    name: "Photo Satin",
    description: "Professional photo paper with subtle sheen",
    finish: "satin",
    weight: "270gsm",
    isArchival: true,
    isActive: true,
    additionalCost: -5,
    suitableFor: ["prints", "posters"],
    colorProfile: "sRGB",
  },
  {
    name: "Canvas",
    description: "Premium cotton canvas for gallery wraps",
    finish: "matte",
    weight: "370gsm",
    isArchival: true,
    isActive: true,
    additionalCost: 10,
    suitableFor: ["canvas"],
    colorProfile: "sRGB",
  },
  {
    name: "Metallic Paper",
    description: "Lustrous metallic finish for dramatic effect",
    finish: "metallic",
    weight: "255gsm",
    isArchival: true,
    isActive: true,
    additionalCost: 15,
    suitableFor: ["prints"],
    colorProfile: "Adobe RGB",
  },
]

// Frame color options
export const commonFrameColors = [
  { name: "Black", hexCode: "#000000", isActive: true, additionalCost: 0 },
  { name: "White", hexCode: "#FFFFFF", isActive: true, additionalCost: 0 },
  { name: "Natural Wood", hexCode: "#D2B48C", isActive: true, additionalCost: 5 },
  { name: "Dark Wood", hexCode: "#654321", isActive: true, additionalCost: 5 },
  { name: "Silver", hexCode: "#C0C0C0", isActive: true, additionalCost: 10 },
  { name: "Gold", hexCode: "#FFD700", isActive: true, additionalCost: 15 },
] as const

// Frame material options
export const commonFrameMaterials = [
  { name: "Wood", description: "Classic wooden frame", isActive: true, additionalCost: 0 },
  { name: "Metal", description: "Modern aluminum frame", isActive: true, additionalCost: 8 },
  { name: "Composite", description: "Lightweight composite material", isActive: true, additionalCost: -3 },
] as const
