'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#01190c] mb-4 [font-family:'Fahkwang',Helvetica]">
          Something went wrong
        </h1>
        <p className="text-[#626161] mb-8 [font-family:'Fahkwang',Helvetica]">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors [font-family:'Fahkwang',Helvetica] font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-[#01190c] rounded-lg hover:bg-gray-50 transition-colors [font-family:'Fahkwang',Helvetica] font-medium"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
