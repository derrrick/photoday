import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            <rect width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.1" />
            <path 
              d="M10 25L16 15L22 23L26 18L30 25" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle 
              cx="15" 
              cy="14" 
              r="2" 
              fill="currentColor" 
            />
          </svg>
          <span className="text-xl font-bold text-gray-900">PhotoDay</span>
        </Link>
        
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
} 