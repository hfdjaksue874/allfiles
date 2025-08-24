import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-fuchsia-100 rounded-full flex items-center justify-center animate-bounce">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            The page you're looking for seems to have wandered off. 
            Don't worry, even the best explorers sometimes take a wrong turn!
          </p>
        </div>

        {/* Helpful Suggestions */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Here's what you can do:
          </h3>
          <ul className="text-left space-y-2 text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full mr-3"></div>
              Check the URL for any typos
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full mr-3"></div>
              Go back to the previous page
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full mr-3"></div>
              Visit our homepage
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full mr-3"></div>
              Browse our collection
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <Link
            to="/collection"
            className="inline-flex items-center justify-center px-6 py-3 border border-fuchsia-600 rounded-lg text-base font-medium text-fuchsia-600 bg-white hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop Now
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4 opacity-50">
          <div className="w-3 h-3 bg-fuchsia-300 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Footer Text */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Lost? Need help? <Link to="/contact" className="text-fuchsia-600 hover:text-fuchsia-700 underline">Contact us</Link>
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-fuchsia-200 rounded-full opacity-25 animate-bounce" style={{animationDelay: '3s'}}></div>
      </div>
    </div>
  )
}

export default NotFound