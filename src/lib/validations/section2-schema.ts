import { z } from "zod"

// Artwork validation schema
export const artworkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  yearCreated: z.number().int().min(1900, "Invalid year").max(new Date().getFullYear(), "Cannot be in the future"),
  medium: z.string().min(1, "Medium is required").max(255, "Medium description too long"),
  description: z.string().max(2000, "Description too long").optional().or(z.literal("")),
  keywords: z.array(z.string()).max(20, "Maximum 20 keywords"),
  orientation: z.enum(["portrait", "landscape", "square"]),
  dimensions: z.object({
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
    unit: z.enum(["inches", "cm"])
  }),
  originalFile: z.object({
    fileName: z.string().optional(),
    url: z.string().url().optional(),
    size: z.number().optional(),
    type: z.string().optional(),
  }).optional(),
  printReadyFile: z.object({
    fileName: z.string().optional(),
    url: z.string().url().optional(),
    size: z.number().optional(),
    type: z.string().optional(),
  }).optional(),
  thumbnailUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  isLimitedEdition: z.boolean().default(false),
  limitedEditionSize: z.number().int().positive().optional(),
  isAvailableForPrint: z.boolean().default(true),
  isAvailableAsOriginal: z.boolean().default(false),
  originalPrice: z.number().positive().optional(),
})

// Section 2: Artwork Catalog & File Management validation schema
export const section2Schema = z.object({
  artworks: z.array(artworkSchema).min(1, "Please add at least one artwork"),
  catalogDescription: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  artistStatement: z.string().max(2000, "Statement too long").optional().or(z.literal("")),
  seriesCollections: z.array(z.object({
    name: z.string().min(1, "Series name required").max(255, "Name too long"),
    description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
    artworkIds: z.array(z.string()),
  })).optional().or(z.literal([])),
  defaultWatermarkSettings: z.object({
    useWatermark: z.boolean().default(true),
    watermarkText: z.string().max(100, "Watermark text too long").optional().or(z.literal("")),
    watermarkPosition: z.enum(["bottom-right", "bottom-left", "center", "top-right", "top-left"]).default("bottom-right"),
    watermarkOpacity: z.number().min(0.1).max(1).default(0.5),
  }),
  fileUploadPreferences: z.object({
    maxFileSize: z.number().positive().default(50), // MB
    acceptedFormats: z.array(z.string()).default(["jpg", "jpeg", "png", "tiff", "pdf"]),
    generateThumbnails: z.boolean().default(true),
    autoOptimize: z.boolean().default(true),
  }),
})

export type Section2FormData = z.infer<typeof section2Schema>
export type ArtworkData = z.infer<typeof artworkSchema>

// Default values for the form
export const section2DefaultValues: Section2FormData = {
  artworks: [],
  catalogDescription: "",
  artistStatement: "",
  seriesCollections: [],
  defaultWatermarkSettings: {
    useWatermark: true,
    watermarkText: "",
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.5,
  },
  fileUploadPreferences: {
    maxFileSize: 50,
    acceptedFormats: ["jpg", "jpeg", "png", "tiff", "pdf"],
    generateThumbnails: true,
    autoOptimize: true,
  },
}

// Default artwork values
export const defaultArtwork: ArtworkData = {
  title: "",
  yearCreated: new Date().getFullYear(),
  medium: "",
  description: "",
  keywords: [],
  orientation: "landscape",
  dimensions: {
    width: 0,
    height: 0,
    unit: "inches"
  },
  isActive: true,
  sortOrder: 0,
  isLimitedEdition: false,
  isAvailableForPrint: true,
  isAvailableAsOriginal: false,
}

// Common mediums for artwork
export const commonMediums = [
  "Acrylic on canvas",
  "Oil on canvas",
  "Watercolor on paper",
  "Digital art",
  "Mixed media",
  "Photography",
  "Charcoal on paper",
  "Ink drawing",
  "Pastel",
  "Collage",
  "Sculpture",
  "Ceramic",
  "Woodwork",
  "Textile art",
  "Print (lithograph)",
  "Print (screen print)",
  "Print (etching)",
  "Other"
] as const

// Common keywords for artwork
export const commonKeywords = [
  "abstract",
  "landscape", 
  "portrait",
  "nature",
  "colorful",
  "minimal",
  "contemporary",
  "traditional",
  "expressionist",
  "realistic",
  "surreal",
  "geometric",
  "organic",
  "bold",
  "subtle",
  "dramatic",
  "peaceful",
  "energetic",
  "emotional",
  "conceptual"
] as const

// File type mappings for uploads
export const acceptedFileTypes = {
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg", 
  "png": "image/png",
  "tiff": "image/tiff",
  "pdf": "application/pdf",
  "psd": "image/vnd.adobe.photoshop",
  "ai": "application/postscript"
} as const

// Maximum file sizes (in MB)
export const maxFileSizes = {
  original: 100, // Original artwork files
  printReady: 50, // Print-ready files
  thumbnail: 5,   // Thumbnails
} as const
