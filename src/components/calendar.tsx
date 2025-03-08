"use client"

interface CalendarProps {
  onSelectDate: (date: string) => void
  selectedDate: string | null
}

export default function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const currentDate = new Date(2025, 1, 27) // February 27, 2025
  const year = currentDate.getFullYear()

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const isClickable = (date: Date) => {
    return date <= currentDate
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
      const clickable = isClickable(date)
      const isSelected = dateString === selectedDate
      const isToday = date.toDateString() === currentDate.toDateString()

      days.push(
        <button
          key={dateString}
          onClick={() => (clickable ? onSelectDate(dateString) : null)}
          className="h-8 w-8 flex items-center justify-center"
          disabled={!clickable}
        >
          <div
            className={`text-lg relative flex items-center justify-center w-full h-full
              ${isSelected ? "text-red-500" : ""}
              ${!clickable ? "text-gray-300" : "text-black"}
            `}
          >
            <span className="absolute">{clickable ? "●" : "○"}</span>
            {isToday && (
              <span className="absolute w-[1.2em] h-[1.2em] border-2 border-red-500 rounded-full pointer-events-none"></span>
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