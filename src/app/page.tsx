"use client"

import { useState, useEffect } from "react"
import Image from "next/image";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";

// Mock image database - in a real app, this would come from an API or database
const mockImages = [
  { 
    date: "2025-01-01", 
    src: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1000&auto=format&fit=crop",
    caption: "New Year's Day 2025 - Fireworks celebration" 
  },
  { 
    date: "2025-01-15", 
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1000&auto=format&fit=crop", 
    caption: "Mid-January forest walk" 
  },
  { 
    date: "2025-01-30", 
    src: "https://images.unsplash.com/photo-1480497490787-505ec076689f?q=80&w=1000&auto=format&fit=crop", 
    caption: "End of January sunset" 
  },
  { 
    date: "2025-02-14", 
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop", 
    caption: "Valentine's Day roses" 
  },
  // Note: Missing February 20 and 21
  { 
    date: "2025-02-22", 
    src: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=1000&auto=format&fit=crop", 
    caption: "Weekend getaway" 
  },
  { 
    date: "2025-02-23", 
    src: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000&auto=format&fit=crop", 
    caption: "Spring flowers" 
  },
  { 
    date: "2025-02-24", 
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop", 
    caption: "Monday at the beach" 
  },
  { 
    date: "2025-02-25", 
    src: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1000&auto=format&fit=crop", 
    caption: "City lights" 
  },
  { 
    date: "2025-02-26", 
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop", 
    caption: "Sunset by the lake" 
  },
  { 
    date: "2025-02-27", 
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop", 
    caption: "Today's photo - Beach day" 
  },
];

// Helper function to get available dates (dates that have images)
const getAvailableDates = () => {
  return mockImages.map(img => img.date);
};

// Helper function to check if a date has a photo
const hasPhotoForDate = (dateString: string) => {
  return mockImages.some(img => img.date === dateString);
};

// Helper function to get today's date in our format
const getTodayDateString = () => {
  return "2025-02-27"; // February 27, 2025 (matching the calendar component)
};

// Helper function to get today's image
const getTodayImage = () => {
  const todayDate = getTodayDateString();
  return mockImages.find(img => img.date === todayDate) || mockImages[mockImages.length - 1];
};

export default function Home() {
  // Initialize with today's date selected
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDateString());
  const [currentImage, setCurrentImage] = useState<{ src: string; caption: string } | null>(getTodayImage());
  const availableDates = getAvailableDates();

  // Function to find the nearest available date
  const findNearestDate = (targetDate: string, direction: 'prev' | 'next'): string | null => {
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
  };

  // Load image when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const image = mockImages.find(img => img.date === selectedDate);
      if (image) {
        setCurrentImage({ src: image.src, caption: image.caption });
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
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    // Only select dates that have photos
    if (hasPhotoForDate(date)) {
      setSelectedDate(date);
    }
  };
  
  const handlePrevious = () => {
    if (!selectedDate) return;
    const prevDate = findNearestDate(selectedDate, 'prev');
    if (prevDate) setSelectedDate(prevDate);
  };
  
  const handleNext = () => {
    if (!selectedDate) return;
    const nextDate = findNearestDate(selectedDate, 'next');
    if (nextDate) setSelectedDate(nextDate);
  };

  // Check if navigation is possible
  const hasPrevious = selectedDate && findNearestDate(selectedDate, 'prev') !== null;
  const hasNext = selectedDate && findNearestDate(selectedDate, 'next') !== null;

  return (
    <main className="flex min-h-screen flex-col items-center bg-white py-24 px-4">
      <div className="max-w-[800px] w-full">
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
          
          <Image
            src={currentImage?.src || getTodayImage().src}
            width={800}
            height={450}
            alt={currentImage?.caption || getTodayImage().caption}
            className="w-full h-auto rounded-lg shadow-md"
            priority
          />
          
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
            {currentImage?.caption || getTodayImage().caption}
          </p>
        </div>

        <div className="mt-[200px] w-full flex justify-center">
          <Calendar 
            onSelectDate={handleDateSelect} 
            selectedDate={selectedDate}
            availableDates={availableDates}
          />
        </div>
      </div>
    </main>
  );
}
