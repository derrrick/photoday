"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image";
import { format, parse, addDays, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PhotoData } from '@/types';
import Calendar from "@/components/calendar";

// Interface for photo data
interface Photo {
  fileName: string;
  date: string;
  caption: string;
  size: number;
  uploadedAt: string;
  url: string;
  location?: string;
  takenAt?: string;
  metadata?: {
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
  };
  isNullState?: boolean;
}

// Helper function to get today's date in YYYY-MM-DD format using Pacific Time
const getTodayDateString = () => {
  // Create a date object for the current time
  const now = new Date();
  
  // Convert to Pacific Time
  const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  
  // Get the date components
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, "0");
  const day = String(pstDate.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display using Pacific Time
const formatDisplayDate = (dateString: string | null, timeString?: string) => {
  if (!dateString) return "";
  
  // Create a date object from the date string
  const date = new Date(dateString);
  
  // Format the date in Pacific Time
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  };
  
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  if (timeString) {
    return `${formattedDate} @${timeString}`;
  }
  
  return formattedDate;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with today's date selected, even if there's no photo for today
  const todayDateString = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDateString);
  const [currentImage, setCurrentImage] = useState<Photo | null>(null);
  const [forceShowToday, setForceShowToday] = useState(true); // Flag to force showing today's null state
  const [isFullScreen, setIsFullScreen] = useState(false); // Add this line for fullscreen functionality
  
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
      return todayPhoto;
    }
    
    // If no photo for today, get the most recent photo
    if (photos.length > 0) {
      // Photos are already sorted by date (newest first) from the API
      return photos[0];
    }
    
    // If no photos at all, create a null state for today
    return {
      fileName: "null-state.jpg",
      date: todayDate,
      caption: `No photo for ${formatDisplayDate(todayDate)}`,
      size: 0,
      uploadedAt: new Date().toISOString(),
      url: "", // Empty URL to trigger null state
      isNullState: true // Flag to identify null state
    };
  }, [photos]);
  
  // Fetch photos from the API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/photos?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        
        const data = await response.json();
        console.log('Fetched photos:', data.photos);
        
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
    if (photos.length === 0 && !forceShowToday) {
      // If no photos loaded yet and not forcing today, don't update the current image
      return;
    }
    
    if (selectedDate) {
      // If we're forcing today's date and it's today
      if (forceShowToday && selectedDate === todayDateString) {
        // Check if we have a photo for today
        const todayPhoto = photos.find(p => p.date === todayDateString);
        if (todayPhoto) {
          setCurrentImage(todayPhoto);
          return;
        }
        
        // Create a null state for today
        setCurrentImage({ 
          fileName: "null-state.jpg",
          date: todayDateString,
          caption: "No photo uploaded yet for today",
          size: 0,
          uploadedAt: new Date().toISOString(),
          url: "", // Empty URL to trigger null state
          isNullState: true // Flag to identify null state
        });
        return;
      }
      
      const photo = photos.find(p => p.date === selectedDate);
      if (photo) {
        setCurrentImage(photo);
      } else {
        // If no exact match, set a null state
        setCurrentImage({ 
          fileName: "null-state.jpg",
          date: selectedDate,
          caption: `No photo available for ${formatDisplayDate(selectedDate)}`,
          size: 0,
          uploadedAt: new Date().toISOString(),
          url: "", // Empty URL to trigger null state
          isNullState: true // Flag to identify null state
        });
      }
    } else {
      // If no date is selected, show today's photo
      setCurrentImage(getTodayImage());
    }
  }, [selectedDate, photos, getTodayImage, forceShowToday, todayDateString, formatDisplayDate]);

  const handleDateSelect = useCallback((date: string) => {
    // Allow selecting today's date even if there's no photo
    if (date === todayDateString || hasPhotoForDate(date)) {
      setSelectedDate(date);
      setForceShowToday(date === todayDateString);
    }
  }, [hasPhotoForDate, todayDateString]);
  
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
    if (!loading && !currentImage) {
      if (forceShowToday) {
        // Check if we have a photo for today
        const todayPhoto = photos.find(p => p.date === todayDateString);
        if (todayPhoto) {
          setCurrentImage(todayPhoto);
          return;
        }
        
        // Create a null state for today
        setCurrentImage({ 
          fileName: "null-state.jpg",
          date: todayDateString,
          caption: "No photo uploaded yet for today",
          size: 0,
          uploadedAt: new Date().toISOString(),
          url: "", // Empty URL to trigger null state
          isNullState: true // Flag to identify null state
        });
      } else if (photos.length > 0) {
        setCurrentImage(getTodayImage());
      }
    }
  }, [loading, photos, currentImage, getTodayImage, forceShowToday, todayDateString]);

  // Function to get the photo index number
  const getPhotoIndex = useCallback(() => {
    if (!currentImage || !currentImage.date) return "01";
    
    // For null state of today, ensure we show today's date
    if (currentImage.isNullState && currentImage.date === todayDateString) {
      // Get today's date in Pacific Time
      const now = new Date();
      const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const month = pstDate.getMonth() + 1; // getMonth() returns 0-11
      const day = pstDate.getDate();
      return `${month}/${String(day).padStart(2, '0')}`;
    }
    
    // Format the date as M/DD
    try {
      // Parse the date parts directly from the YYYY-MM-DD format to avoid timezone issues
      const [, month, day] = currentImage.date.split('-').map(Number);
      return `${month}/${String(day).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return currentImage.date.split('-').slice(1).join('/'); // Fallback to MM/DD from YYYY-MM-DD
    }
  }, [currentImage, todayDateString]);

  // Function to refresh the photos (used for debugging)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshPhotos = useCallback(async () => {
    try {
      setLoading(true);
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/photos?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      console.log('Refreshed photos:', data.photos);
      
      if (data.success && data.photos) {
        setPhotos(data.photos);
      } else {
        throw new Error(data.error || 'Failed to fetch photos');
      }
    } catch (err) {
      console.error('Error refreshing photos:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // This variable is declared but never used
  const displayDate = formatDisplayDate(selectedDate, currentImage?.takenAt);

  // Add this useEffect for keyboard navigation throughout the app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // In full-screen mode
      if (isFullScreen) {
        switch (e.key) {
          case 'Escape':
            setIsFullScreen(false);
            break;
          case 'ArrowLeft':
            if (hasPrevious) handlePrevious();
            break;
          case 'ArrowRight':
            if (hasNext) handleNext();
            break;
          default:
            break;
        }
      } 
      // In normal view - also allow arrow keys to navigate
      else {
        switch (e.key) {
          case 'ArrowLeft':
            if (hasPrevious) handlePrevious();
            break;
          case 'ArrowRight':
            if (hasNext) handleNext();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, hasPrevious, hasNext, handlePrevious, handleNext]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-white py-12 px-4">
      <div className="max-w-[800px] w-full">
        {/* Photo Display Column */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : currentImage ? (
            <div className="relative">
              {/* Photo metadata header */}
              {currentImage && (
                <div className="w-full pb-4">
                  <h3 className="font-medium text-sm text-black pb-2 pt-4 m-0">
                    <span className="font-bold">{getPhotoIndex()} — {currentImage.caption}</span>
                    {currentImage.location && (
                      <span className="text-gray-500 ml-4">
                        📍 {currentImage.location} {currentImage.date && currentImage.takenAt && (
                          <>
                            &nbsp;•&nbsp; {formatDisplayDate(currentImage.date, currentImage.takenAt)}
                          </>
                        )}
                      </span>
                    )}
                  </h3>
                </div>
              )}
              
              {/* Image with clickable behavior */}
              <div 
                className="relative group cursor-pointer"
                onClick={() => setIsFullScreen(true)}
              >
                <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg">
                  {currentImage.url && (
                    <Image
                      src={currentImage.url}
                      alt={currentImage.caption || `Photo`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
                
                {/* Expand icon on hover */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </div>
              </div>
              
              {/* Camera metadata footer */}
              {currentImage.metadata && (
                <h3 className="font-normal text-sm text-gray-500 mt-4 mb-4 w-full">
                  {currentImage.metadata.aperture && (
                    <span>
                      <span className="font-bold">
                        Aperture:
                      </span> {currentImage.metadata.aperture} &nbsp; &nbsp; &nbsp;
                    </span>
                  )}
                  
                  {currentImage.metadata.shutterSpeed && (
                    <span>
                      <span className="font-bold">Shutter:</span> {currentImage.metadata.shutterSpeed} &nbsp; &nbsp; &nbsp;
                    </span>
                  )}
                  
                  {currentImage.metadata.iso && (
                    <span>
                      <span className="font-bold">ISO:</span> {currentImage.metadata.iso} &nbsp; &nbsp; &nbsp;
                    </span>
                  )}
                  
                  {currentImage.metadata.focalLength && (
                    <span>
                      <span className="font-bold">Focal length:</span> {currentImage.metadata.focalLength}
                    </span>
                  )}
                </h3>
              )}
              
              {/* Navigation buttons below the image */}
              <div className="flex justify-between mt-4">
                <button 
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="bg-white hover:bg-gray-100 p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="bg-white hover:bg-gray-100 p-2 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <div className="mt-[200px] w-full flex justify-center">
          <Calendar 
            onSelectDate={handleDateSelect} 
            selectedDate={selectedDate}
            availableDates={getAvailableDates()}
          />
        </div>
      </div>

      {/* Full-screen modal */}
      {isFullScreen && currentImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center"
          onClick={() => setIsFullScreen(false)} // Close when clicking the background
        >
          {/* Close button - more prominent */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the background click
              setIsFullScreen(false);
            }}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors duration-200 text-white"
            aria-label="Close full-screen view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div 
            className="relative w-full h-full max-h-screen flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image container
          >
            {/* Left navigation arrow */}
            {hasPrevious && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the background click
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 p-3 rounded-full transition-colors duration-200"
                aria-label="Previous photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            
            {/* Full-screen image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {currentImage.url && (
                <Image
                  src={currentImage.url}
                  alt={currentImage.caption || `Photo`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              )}
            </div>
            
            {/* Right navigation arrow */}
            {hasNext && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the background click
                  handleNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 p-3 rounded-full transition-colors duration-200"
                aria-label="Next photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Metadata footer in fullscreen */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the metadata
          >
            <h3 className="text-lg font-medium mb-1">{currentImage.caption}</h3>
            
            {currentImage.metadata && (
              <div className="text-sm">
                {currentImage.metadata.aperture && (
                  <span className="mr-4">
                    <span className="font-bold">Aperture:</span> {currentImage.metadata.aperture}
                  </span>
                )}
                
                {currentImage.metadata.shutterSpeed && (
                  <span className="mr-4">
                    <span className="font-bold">Shutter:</span> {currentImage.metadata.shutterSpeed}
                  </span>
                )}
                
                {currentImage.metadata.iso && (
                  <span className="mr-4">
                    <span className="font-bold">ISO:</span> {currentImage.metadata.iso}
                  </span>
                )}
                
                {currentImage.metadata.focalLength && (
                  <span>
                    <span className="font-bold">Focal length:</span> {currentImage.metadata.focalLength}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Instructions overlay - simplified */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            Press ESC to close
          </div>
        </div>
      )}
    </main>
  );
}
