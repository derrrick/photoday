"use client"

import { useEffect, useState } from "react"

interface CalendarProps {
  onSelectDate: (date: string) => void
  selectedDate: string | null
  availableDates: string[]
}

export default function Calendar({ onSelectDate, selectedDate, availableDates }: CalendarProps) {
  // Use state to store the current date in Pacific Time
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }))
  )
  const year = currentDate.getFullYear()

  // Initialize the component with the current date in Pacific Time
  useEffect(() => {
    const now = new Date();
    const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    setCurrentDate(pstDate);
  }, [])

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const isClickable = (date: Date) => {
    return date <= currentDate;
  }

  const hasPhoto = (dateString: string) => {
    return availableDates.includes(dateString);
  }

  const renderMonth = (monthIndex: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d)
      const dateString = formatDate(year, monthIndex, d)
      const isToday = date.toDateString() === currentDate.toDateString()
      const hasPhotoForDay = hasPhoto(dateString)
      // Make today clickable even if there's no photo
      const clickable = isClickable(date) && (hasPhotoForDay || isToday)
      const isSelected = dateString === selectedDate
      const isMissing = isClickable(date) && !hasPhotoForDay

      days.push(
        <button
          key={dateString}
          onClick={() => (clickable ? onSelectDate(dateString) : null)}
          className="h-8 w-8 flex items-center justify-center"
          disabled={!clickable}
        >
          <div
            className={`text-xs relative flex items-center justify-center w-full h-full
              ${isSelected ? "text-black font-bold" : ""}
              ${isToday ? "text-red-500" : ""}
              ${isMissing && !isToday ? "text-gray-400" : ""}
              ${!isClickable(date) ? "text-gray-300" : isSelected ? "text-black" : isToday ? "text-red-500" : isMissing ? "text-gray-400" : "text-black"}
            `}
          >
            <span className="relative inline-flex items-center justify-center">
              {isMissing && !isToday ? "●" : clickable ? "●" : "○"}
              {isSelected && (
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1.1em] h-[1.1em] border-2 border-red-500 bg-opacity-20 rounded-full pointer-events-none"></span>
              )}
            </span>
          </div>
        </button>,
      )
    }

    return (
      <div key={monthIndex} className="w-full">
        <h3 className="text-sm font-medium mb-2">{monthNames[monthIndex]}</h3>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    )
  }

  return (
    <div className="w-[1200px]">
      <div className="grid grid-cols-3 gap-8">{monthNames.map((_, index) => renderMonth(index))}</div>
    </div>
  )
} 