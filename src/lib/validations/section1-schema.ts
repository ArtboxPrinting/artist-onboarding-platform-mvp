import { z } from "zod"

// File upload validation schema
export const fileSchema = z.object({
  file: z.instanceof(File).optional(),
  url: z.string().url().optional(),
  fileName: z.string().optional(),
})

// Color validation (HEX format)
export const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
  message: "Please enter a valid HEX color code (e.g., #FF0000)"
})

// Social media links schema
export const socialLinksSchema = z.object({
  instagram: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  other: z.string().url().optional().or(z.literal("")),
})

// Section 1: Artist Profile & Brand Setup validation schema
export const section1Schema = z.object({
  // Basic Information
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(255, "Full name too long"),
  studioName: z.string().max(255, "Studio name too long").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  location: z.string().min(2, "Please enter your location").max(255, "Location too long"),
  
  // Business Information
  businessNumber: z.string().max(100, "Business number too long").optional().or(z.literal("")),
  gstNumber: z.string().max(100, "GST number too long").optional().or(z.literal("")),
  
  // Artist Bio & Statement
  bio: z.string().min(50, "Bio should be at least 50 characters").max(2000, "Bio too long"),
  tagline: z.string().max(500, "Tagline too long").optional().or(z.literal("")),
  artisticStyle: z.string().min(20, "Please describe your artistic style (minimum 20 characters)").max(1000, "Description too long"),
  
  // Brand Colors (array of HEX codes)
  primaryColor: hexColorSchema.optional().or(z.literal("")),
  secondaryColor: hexColorSchema.optional().or(z.literal("")),
  accentColor: hexColorSchema.optional().or(z.literal("")),
  
  // File Uploads
  logo: fileSchema.optional(),
  headshot: fileSchema.optional(),
  studioPhoto: fileSchema.optional(),
  brandGuide: fileSchema.optional(),
  
  // Social Media & Website
  socialLinks: socialLinksSchema.optional(),
  domainName: z.string().max(255, "Domain name too long").optional().or(z.literal("")),
  
  // Website Design Preferences
  designFeel: z.enum(["minimalist", "bold", "artistic", "editorial", "commercial"]).optional(),
  designReferences: z.array(z.string().url()).max(5, "Maximum 5 design references"),
  mustHaveElements: z.array(z.string()).max(10, "Maximum 10 elements"),
  preferredFonts: z.array(z.string()).max(5, "Maximum 5 preferred fonts"),
})

export type Section1FormData = z.infer<typeof section1Schema>

// Default values for the form
export const section1DefaultValues: Section1FormData = {
  fullName: "",
  studioName: "",
  email: "",
  phone: "",
  location: "",
  businessNumber: "",
  gstNumber: "",
  bio: "",
  tagline: "",
  artisticStyle: "",
  primaryColor: "",
  secondaryColor: "",
  accentColor: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    website: "",
    other: "",
  },
  domainName: "",
  designFeel: undefined,
  designReferences: [],
  mustHaveElements: [],
  preferredFonts: [],
}

// Design feel options
export const designFeelOptions = [
  { value: "minimalist", label: "Minimalist", description: "Clean, simple, lots of white space" },
  { value: "bold", label: "Bold", description: "Strong colors, dramatic typography" },
  { value: "artistic", label: "Artistic", description: "Creative, expressive, unconventional" },
  { value: "editorial", label: "Editorial", description: "Magazine-style, structured layout" },
  { value: "commercial", label: "Commercial", description: "Professional, business-focused" },
] as const

// Common must-have elements
export const commonWebsiteElements = [
  "Image galleries",
  "Shopping cart",
  "Artist statement",
  "Commission information",
  "Contact form",
  "Newsletter signup",
  "Social media integration",
  "Blog/journal",
  "Press coverage",
  "Exhibition history",
  "Customer testimonials",
  "FAQ section",
] as const

// Common font suggestions
export const commonFonts = [
  "Helvetica",
  "Georgia",
  "Futura",
  "Garamond",
  "Proxima Nova",
  "Montserrat",
  "Open Sans",
  "Lora",
  "Playfair Display",
  "Source Sans Pro",
  "Merriweather",
  "Roboto",
] as const
