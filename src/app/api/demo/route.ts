import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Artist Onboarding Platform MVP - Demo Mode",
    features: [
      "4-Section Onboarding Flow",
      "Real-Time SKU Generation", 
      "Advanced Pricing Calculator",
      "Multi-Section Navigation",
      "Progress Tracking",
      "Admin Dashboard"
    ],
    status: "Live MVP Deployment",
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Demo submission received",
    note: "In demo mode - database integration available in full version"
  })
}
