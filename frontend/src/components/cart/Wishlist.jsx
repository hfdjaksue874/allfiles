import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { backendUrl } from '../../App'
import { Link } from 'react-router-dom'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getWishlistItems()
  }, [])

  const getWishlistItems = async () => {
    try {
      setLoading(true)
      // Note: In a real app, you'd get the userId from auth context or similar
      const userId = "currentUserId" // Replace with actual user ID retrieval
      const response = await axios.get(`${backendUrl}wishlist/${userId}`)
      setWishlistItems(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load wishlist items')
      setLoading(false)
      console.error('Error fetching wishlist:', err)
    }
  }

  const clearAllWishlist = async () => {
    try {
      // Note: In a real app, you'd include user authentication
      await axios.delete(`${backendUrl}wishlist/clear`)
      setWishlistItems([])
    } catch (err) {
      setError('Failed to clear wishlist')
      console.error('Error clearing wishlist:', err)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${backendUrl}wishlist/${productId}`)
      // Update local state to remove the item
      setWishlistItems(wishlistItems.filter(item => item.id !== productId))
    } catch (err) {
      setError(`Failed to remove item ${productId}`)
      console.error('Error removing from wishlist:', err)
    }
  }

  const addToCart = async (productId) => {
    try {
      // Note: In a real app, you'd include user authentication
      await axios.post(`${backendUrl}/cart`, { productId, quantity: 1 })
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(productId)
    } catch (err) {
      setError('Failed to add item to cart')
      console.error('Error adding to cart:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button 
            onClick={clearAllWishlist}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm md:text-base"
          >
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-600">Your wishlist is empty</h2>
          <p className="mt-2 text-gray-500">Items added to your wishlist will appear here</p>
          <Link to="/collection" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-64 object-cover"
                />
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                  aria-label="Remove from wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">{item.name}</h3>
                <p className="text-gray-600 mb-2">${item.price.toFixed(2)}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => addToCart(item.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                  <Link 
                    to={`/product/${item.id}`}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist