"use client"

import { useEffect, useState } from "react"

interface CalendarProps {
  onSelectDate: (date: string) => void
  selectedDate: string | null
  availableDates: string[]
}

export default function Calendar({ onSelectDate, selectedDate, availableDates }: CalendarProps) {
  // Use state to store the current date instead of a constant
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 1, 27)) // February 27, 2025
  const year = currentDate.getFullYear()

  // Initialize the component with the current date
  useEffect(() => {
    setCurrentDate(new Date(2025, 1, 27)) // February 27, 2025
  }, [])

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const isClickable = (date: Date) => {
    return date <= currentDate
  }

  const hasPhoto = (dateString: string) => {
    return availableDates.includes(dateString)
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
      const clickable = isClickable(date) && hasPhoto(dateString)
      const isSelected = dateString === selectedDate
      const isToday = date.toDateString() === currentDate.toDateString()
      const isMissing = isClickable(date) && !hasPhoto(dateString)

      days.push(
        <button
          key={dateString}
          onClick={() => (clickable ? onSelectDate(dateString) : null)}
          className="h-8 w-8 flex items-center justify-center"
          disabled={!clickable}
        >
          <div
            className={`text-lg relative flex items-center justify-center w-full h-full
              ${isSelected ? "text-red-500 font-bold" : ""}
              ${isToday && !isMissing ? "text-red-500" : ""}
              ${isMissing ? "text-gray-400" : ""}
              ${!isClickable(date) ? "text-gray-300" : isSelected || (isToday && !isMissing) ? "" : isMissing ? "" : "text-black"}
            `}
          >
            {isMissing ? "●" : clickable ? "●" : "○"}
            {isToday && !isSelected && !isMissing && (
              <span className="absolute w-[1.2em] h-[1.2em] border-2 border-red-500 rounded-full pointer-events-none"></span>
            )}
            {isSelected && (
              <span className="absolute w-[1.2em] h-[1.2em] bg-red-500 bg-opacity-20 rounded-full pointer-events-none"></span>
            )}
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