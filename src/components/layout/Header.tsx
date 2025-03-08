import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/schippert-logo.svg"
            alt="Schippert Logo"
            width={180}
            height={47}
            className="text-blue-600 h-10 w-auto"
            priority
          />
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