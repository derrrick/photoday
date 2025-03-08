"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [location, setLocation] = useState("")
  const [takenAt, setTakenAt] = useState("")
  const [aperture, setAperture] = useState("")
  const [shutterSpeed, setShutterSpeed] = useState("")
  const [iso, setIso] = useState("")
  const [focalLength, setFocalLength] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = useState(getTodayDate())

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)
    
    // Create a preview URL for the selected image
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedImage) {
      setError("Please select an image to upload")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create a FormData object to send the file and metadata
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("date", selectedDate)
      formData.append("caption", caption)
      
      // Add new metadata fields
      if (location) formData.append("location", location)
      if (takenAt) formData.append("takenAt", takenAt)
      
      // Add camera settings
      const metadata: Record<string, string> = {}
      if (aperture) metadata.aperture = aperture
      if (shutterSpeed) metadata.shutterSpeed = shutterSpeed
      if (iso) metadata.iso = iso
      if (focalLength) metadata.focalLength = focalLength
      
      // Only append metadata if at least one field is filled
      if (Object.keys(metadata).length > 0) {
        formData.append("metadata", JSON.stringify(metadata))
      }

      // Send the form data to our API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      console.log("Upload successful!", data)
      setUploadSuccess(true)
      setUploading(false)
    } catch (err) {
      console.error("Upload failed:", err)
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setCaption("")
    setLocation("")
    setTakenAt("")
    setAperture("")
    setShutterSpeed("")
    setIso("")
    setFocalLength("")
    setSelectedDate(getTodayDate())
    setUploadSuccess(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Daily Photo</h1>
        
        {uploadSuccess ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              Photo uploaded successfully!
            </div>
            <div className="flex flex-col space-y-4">
              <Button onClick={resetForm}>Upload Another Photo</Button>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Return to Home Page
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                max={getTodayDate()} // Prevent selecting future dates
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Preview</p>
                <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
            
            {/* Caption */}
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Image title or description"
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Big Sur, CA"
              />
            </div>
            
            {/* Time Taken */}
            <div>
              <label htmlFor="takenAt" className="block text-sm font-medium text-gray-700 mb-1">
                Time Taken
              </label>
              <input
                type="text"
                id="takenAt"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 3:21pm"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Camera Settings (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Aperture */}
                <div>
                  <label htmlFor="aperture" className="block text-sm font-medium text-gray-700 mb-1">
                    Aperture
                  </label>
                  <input
                    type="text"
                    id="aperture"
                    value={aperture}
                    onChange={(e) => setAperture(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. ƒ/8.0"
                  />
                </div>
                
                {/* Shutter Speed */}
                <div>
                  <label htmlFor="shutterSpeed" className="block text-sm font-medium text-gray-700 mb-1">
                    Shutter Speed
                  </label>
                  <input
                    type="text"
                    id="shutterSpeed"
                    value={shutterSpeed}
                    onChange={(e) => setShutterSpeed(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 1/60"
                  />
                </div>
                
                {/* ISO */}
                <div>
                  <label htmlFor="iso" className="block text-sm font-medium text-gray-700 mb-1">
                    ISO
                  </label>
                  <input
                    type="text"
                    id="iso"
                    value={iso}
                    onChange={(e) => setIso(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 200"
                  />
                </div>
                
                {/* Focal Length */}
                <div>
                  <label htmlFor="focalLength" className="block text-sm font-medium text-gray-700 mb-1">
                    Focal Length
                  </label>
                  <input
                    type="text"
                    id="focalLength"
                    value={focalLength}
                    onChange={(e) => setFocalLength(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 135mm"
                  />
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
} 