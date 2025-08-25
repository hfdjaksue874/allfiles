import { backendUrl } from '../../App'
import { Link } from 'react-router-dom'
import axios from 'axios'
import React, { useState, useEffect } from 'react'

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (err) {
      console.error('Error parsing user data:', err)
    }
    
    getWishlistItems()
  }, [])

  const getWishlistItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${backendUrl}wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.success) {
        setWishlistItems(response.data.wishlist || [])
      } else {
        throw new Error(response.data?.message || 'Failed to load wishlist items')
      }
      
      setLoading(false)
    } catch (err) {
      setError('Failed to load wishlist items')
      setLoading(false)
      console.error('Error fetching wishlist:', err)
    }
  }

  const clearAllWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        return
      }
      
      const response = await axios.delete(`${backendUrl}wishlist/clear`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.success) {
        setWishlistItems([])
      } else {
        throw new Error(response.data?.message || 'Failed to clear wishlist')
      }
    } catch (err) {
      setError('Failed to clear wishlist')
      console.error('Error clearing wishlist:', err)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        return
      }
      
      const response = await axios.delete(`${backendUrl}wishlist/remove/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.success) {
        // Update local state to remove the item
        setWishlistItems(wishlistItems.filter(item => item.productId !== productId))
      } else {
        throw new Error(response.data?.message || `Failed to remove item ${productId}`)
      }
    } catch (err) {
      setError(`Failed to remove item ${productId}`)
      console.error('Error removing from wishlist:', err)
    }
  }

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        return
      }
      
      const response = await axios.post(`${backendUrl}cart/add`, { 
        productId, 
        quantity: 1 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.success) {
        // Optionally remove from wishlist after adding to cart
        await removeFromWishlist(productId)
        alert('Item added to cart successfully!')
      } else {
        throw new Error(response.data?.message || 'Failed to add item to cart')
      }
    } catch (err) {
      setError('Failed to add item to cart')
      console.error('Error adding to cart:', err)
    }
  }

  // Helper function to handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={getWishlistItems}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
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
            <div key={item.productId} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-64 object-cover"
                  onError={handleImageError}
                />
                <button 
                  onClick={() => removeFromWishlist(item.productId)}
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
                    onClick={() => addToCart(item.productId)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                  <Link 
                    to={`/product/${item.productId}`}
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