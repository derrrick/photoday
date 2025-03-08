"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image";
import Calendar from "@/components/calendar";

// Interface for photo data
interface Photo {
  fileName: string;
  date: string;
  caption: string;
  size: number;
  uploadedAt: string;
  url: string;
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Fallback images for when no photos are available
const fallbackImages = [
  { 
    date: "2025-01-01", 
    src: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1000&auto=format&fit=crop",
    caption: "New Year's Day 2025 - Fireworks celebration" 
  },
  { 
    date: "2025-02-27", 
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop", 
    caption: "Today's photo - Beach day" 
  },
];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with today's date selected
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDateString());
  const [currentImage, setCurrentImage] = useState<{ src: string; caption: string } | null>(null);
  
  // Helper function to get available dates (dates that have images)
  const getAvailableDates = useCallback(() => {
    return photos.map(photo => photo.date);
  }, [photos]);
  
  // Helper function to check if a date has a photo
  const hasPhotoForDate = useCallback((dateString: string) => {
    return photos.some(photo => photo.date === dateString);
  }, [photos]);
  
  // Helper function to get today's image - memoized with useCallback
  const getTodayImage = useCallback(() => {
    const todayDate = getTodayDateString();
    
    // First, try to find a photo with today's date
    const todayPhoto = photos.find(photo => photo.date === todayDate);
    
    if (todayPhoto) {
      return { 
        src: todayPhoto.url, 
        caption: todayPhoto.caption 
      };
    }
    
    // If no photo for today, get the most recent photo
    if (photos.length > 0) {
      // Photos are already sorted by date (newest first) from the API
      const latestPhoto = photos[0];
      return { 
        src: latestPhoto.url, 
        caption: latestPhoto.caption 
      };
    }
    
    // If no photos at all, use a fallback
    return { 
      src: fallbackImages[1].src, 
      caption: fallbackImages[1].caption 
    };
  }, [photos]); // Only depend on photos
  
  // Fetch photos from the API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/photos');
        
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        
        const data = await response.json();
        
        if (data.success && data.photos) {
          setPhotos(data.photos);
        } else {
          throw new Error(data.error || 'Failed to fetch photos');
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, []);

  // Function to find the nearest available date
  const findNearestDate = useCallback((targetDate: string, direction: 'prev' | 'next'): string | null => {
    const availableDates = getAvailableDates();
    if (!targetDate || availableDates.length === 0) return null;
    
    const targetTime = new Date(targetDate).getTime();
    
    if (direction === 'prev') {
      // Find the nearest date before the target date
      const prevDates = availableDates
        .filter(date => new Date(date).getTime() < targetTime)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      return prevDates.length > 0 ? prevDates[0] : null;
    } else {
      // Find the nearest date after the target date
      const nextDates = availableDates
        .filter(date => new Date(date).getTime() > targetTime)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      return nextDates.length > 0 ? nextDates[0] : null;
    }
  }, [getAvailableDates]);

  // Load image when selected date changes or photos are loaded
  useEffect(() => {
    if (photos.length === 0) {
      // If no photos loaded yet, don't update the current image
      return;
    }
    
    if (selectedDate) {
      const photo = photos.find(p => p.date === selectedDate);
      if (photo) {
        setCurrentImage({ 
          src: photo.url, 
          caption: photo.caption 
        });
      } else {
        // If no exact match, set a default or placeholder
        setCurrentImage({ 
          src: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=1000&auto=format&fit=crop", 
          caption: `No photo available for ${selectedDate}` 
        });
      }
    } else {
      // If no date is selected, show today's photo
      setCurrentImage(getTodayImage());
    }
  }, [selectedDate, photos, getTodayImage]);

  const handleDateSelect = useCallback((date: string) => {
    // Only select dates that have photos
    if (hasPhotoForDate(date)) {
      setSelectedDate(date);
    }
  }, [hasPhotoForDate]);
  
  const handlePrevious = useCallback(() => {
    if (!selectedDate) return;
    const prevDate = findNearestDate(selectedDate, 'prev');
    if (prevDate) setSelectedDate(prevDate);
  }, [selectedDate, findNearestDate]);
  
  const handleNext = useCallback(() => {
    if (!selectedDate) return;
    const nextDate = findNearestDate(selectedDate, 'next');
    if (nextDate) setSelectedDate(nextDate);
  }, [selectedDate, findNearestDate]);

  // Check if navigation is possible
  const hasPrevious = selectedDate && findNearestDate(selectedDate, 'prev') !== null;
  const hasNext = selectedDate && findNearestDate(selectedDate, 'next') !== null;

  // Set initial image when photos are loaded
  useEffect(() => {
    if (!loading && photos.length > 0 && !currentImage) {
      setCurrentImage(getTodayImage());
    }
  }, [loading, photos, currentImage, getTodayImage]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-white py-12 px-4">
      <div className="max-w-[800px] w-full">
        {loading ? (
          <div className="flex justify-center items-center h-[450px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Left navigation arrow */}
            <button 
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            
            {currentImage && (
              <Image
                src={currentImage.src}
                width={800}
                height={450}
                alt={currentImage.caption}
                className="w-full h-auto rounded-lg shadow-md"
                priority
              />
            )}
            
            {/* Right navigation arrow */}
            <button 
              onClick={handleNext}
              disabled={!hasNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90 p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            
            <p className="mt-4 text-center text-gray-700 text-lg italic">
              {currentImage?.caption || "Loading..."}
            </p>
          </div>
        )}

        <div className="mt-[200px] w-full flex justify-center">
          <Calendar 
            onSelectDate={handleDateSelect} 
            selectedDate={selectedDate}
            availableDates={getAvailableDates()}
          />
        </div>
      </div>
    </main>
  );
}
