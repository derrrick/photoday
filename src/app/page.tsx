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

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display
const formatDisplayDate = (dateString: string, timeString?: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
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
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return {
      fileName: "null-state.jpg",
      date: todayDate,
      caption: `No photo for ${formattedDate}`,
      size: 0,
      uploadedAt: new Date().toISOString(),
      url: "", // Empty URL to trigger null state
      isNullState: true // Flag to identify null state
    };
  }, [photos]); // Only depend on photos
  
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
        // Create a null state for today
        const today = new Date();
        
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
        const selectedDateObj = new Date(selectedDate);
        const formattedDate = selectedDateObj.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        setCurrentImage({ 
          fileName: "null-state.jpg",
          date: selectedDate,
          caption: `No photo available for ${formattedDate}`,
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
  }, [selectedDate, photos, getTodayImage, forceShowToday, todayDateString]);

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
        // Create a null state for today
        const today = new Date();
        
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
      const today = new Date();
      const month = today.getMonth() + 1; // getMonth() returns 0-11
      const day = today.getDate();
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
            
            {currentImage && currentImage.isNullState ? (
              <div className="w-full h-[450px] bg-gray-100 rounded-lg shadow-md flex flex-col items-center justify-center p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No photo yet</h3>
                <p className="text-gray-500 max-w-md">
                  Derrick hasn&apos;t uploaded a photo for this day yet. Check back later or browse other days using the calendar below.
                </p>
              </div>
            ) : (
              currentImage && currentImage.url && (
                <Image
                  src={currentImage.url}
                  width={800}
                  height={450}
                  alt={currentImage.caption}
                  className="w-full h-auto rounded-lg shadow-md"
                  priority
                />
              )
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
            
            {/* Camera metadata footer */}
            {currentImage && currentImage.metadata && (
              <h3 className="font-normal text-sm text-gray-500 mt-2 mb-0 w-full">
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
