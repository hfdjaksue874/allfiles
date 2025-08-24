import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  Heart,
  Tag,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react'
import axios from 'axios'
import { backendUrl } from '../../App'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [user, setUser] = useState(null)

  // Check for user authentication
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing user data:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  // Fetch cart items from backend or localStorage
  useEffect(() => {
    fetchCartItems()
  }, [user])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      if (token && user) {
        // User is authenticated - fetch from backend
        await fetchCartFromBackend(token)
      } else {
        // User not authenticated - use localStorage
        await fetchCartFromLocalStorage()
      }
    } catch (err) {
      console.error('Error fetching cart items:', err)
      setError('Failed to load cart items')
      setLoading(false)
    }
  }

  const fetchCartFromBackend = async (token) => {
    try {
      // Fetch user's cart from backend
      const cartResponse = await axios.get(`${backendUrl}cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (cartResponse.data && cartResponse.data.success) {
        const cartData = cartResponse.data.cart || []
        
        if (cartData.length === 0) {
          setCartItems([])
          setLoading(false)
          return
        }

        // Fetch product details for cart items
        const productIds = cartData.map(item => item.productId)
        const productsResponse = await axios.post(`${backendUrl}product/`, {
          productIds: productIds
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (productsResponse.data && productsResponse.data.success) {
          const products = productsResponse.data.products || []
          const enrichedCartItems = enrichCartItems(cartData, products)
          setCartItems(enrichedCartItems)
        } else {
          throw new Error('Failed to fetch product details')
        }
      } else {
        throw new Error('Failed to fetch cart data')
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching cart from backend:', err)
      // Fallback to localStorage if backend fails
      await fetchCartFromLocalStorage()
    }
  }

  const fetchCartFromLocalStorage = async () => {
    try {
      // Get cart items from localStorage
      const savedCart = localStorage.getItem('cartItems')
      const cartItemIds = savedCart ? JSON.parse(savedCart) : []

      if (cartItemIds.length === 0) {
        setCartItems([])
        setLoading(false)
        return
      }

      // Fetch all products from backend
      const response = await axios.get(`${backendUrl}products/all`)
      
      if (response.data && response.data.success && Array.isArray(response.data.products)) {
        const allProducts = response.data.products
        const enrichedCartItems = enrichCartItems(cartItemIds, allProducts)
        setCartItems(enrichedCartItems)
      } else {
        throw new Error('Failed to fetch products')
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching cart from localStorage:', err)
      setError('Failed to load cart items')
      setLoading(false)
    }
  }

  const enrichCartItems = (cartData, products) => {
    return cartData.map(cartItem => {
      const product = products.find(p => p._id === cartItem.productId)
      
      if (!product) {
        console.warn(`Product not found for ID: ${cartItem.productId}`)
        return null
      }

      return {
        id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity: cartItem.quantity,
        size: cartItem.size || 'N/A',
        color: cartItem.color || 'N/A',
        image: getProductImageUrl(product),
        inStock: isProductInStock(product),
        maxQuantity: getProductStock(product),
        product: product
      }
    }).filter(Boolean)
  }

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    try {
      const imageData = product.image || product.images
      
      if (!imageData) {
        return 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image'
      }
      
      if (typeof imageData === 'string') {
        return imageData
      }
      
      if (imageData.url || imageData.secure_url) {
        return imageData.url || imageData.secure_url
      }
      
      if (Array.isArray(imageData) && imageData.length > 0) {
        const firstImage = imageData[0]
        if (typeof firstImage === 'string') return firstImage
        if (firstImage && firstImage.url) return firstImage.url
        if (firstImage && firstImage.secure_url) return firstImage.secure_url
      }
      
      return 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image'
    } catch (err) {
      console.error('Error processing image URL:', err)
      return 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Image+Error'
    }
  }

  // Helper function to check if product is in stock
  const isProductInStock = (product) => {
    if (product.quantity !== undefined) {
      return product.quantity > 0
    }
    if (product.stock !== undefined) {
      return product.stock > 0
    }
    return product.inStock === true
  }

  // Helper function to get product stock count
  const getProductStock = (product) => {
    if (product.quantity !== undefined) {
      return product.quantity
    }
    if (product.stock !== undefined) {
      return product.stock
    }
    return product.inStock ? 10 : 0
  }

  // Save cart to localStorage
  const saveCartToStorage = (items) => {
    const cartData = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }))
    localStorage.setItem('cartItems', JSON.stringify(cartData))
  }

  // Save cart to backend
  const saveCartToBackend = async (items) => {
    const token = localStorage.getItem('token')
    if (!token || !user) return false

    try {
      const cartData = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))

      const response = await axios.put(`${backendUrl}/api/v1/cart/update`, {
        cartItems: cartData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data && response.data.success
    } catch (err) {
      console.error('Error saving cart to backend:', err)
      return false
    }
  }

  // Add item to cart
  const addToCart = async (productId, quantity = 1, size = 'N/A', color = 'N/A') => {
    try {
      const token = localStorage.getItem('token')

      if (token && user) {
        // Add to backend cart
        const response = await axios.post(`${backendUrl}/api/v1/cart/add`, {
          productId,
          quantity,
          size,
          color
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.data && response.data.success) {
          await fetchCartItems()
          return true
        }
      } else {
        // Add to localStorage cart
        const savedCart = localStorage.getItem('cartItems')
        const currentCart = savedCart ? JSON.parse(savedCart) : []
        
        const existingItemIndex = currentCart.findIndex(
          item => item.productId === productId && item.size === size && item.color === color
        )
        
        if (existingItemIndex >= 0) {
          currentCart[existingItemIndex].quantity += quantity
        } else {
          currentCart.push({
            productId,
            quantity,
            size,
            color
          })
        }
        
        localStorage.setItem('cartItems', JSON.stringify(currentCart))
        await fetchCartItems()
        return true
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      return false
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = subtotal * (discount / 100)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discountAmount) * 0.08
  const total = subtotal - discountAmount + shipping + tax

  // Update quantity
  const updateQuantity = async (id, newQuantity) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const quantity = Math.max(0, Math.min(newQuantity, item.maxQuantity))
        return { ...item, quantity }
      }
      return item
    }).filter(item => item.quantity > 0)
    
    setCartItems(updatedItems)
    
    // Save to appropriate storage
    const token = localStorage.getItem('token')
    if (token && user) {
      await saveCartToBackend(updatedItems)
    } else {
      saveCartToStorage(updatedItems)
    }
  }

  // Remove item
  const removeItem = async (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id)
    setCartItems(updatedItems)
    
    // Save to appropriate storage
    const token = localStorage.getItem('token')
    if (token && user) {
      await saveCartToBackend(updatedItems)
    } else {
      saveCartToStorage(updatedItems)
    }
  }

  // Move to wishlist
  const moveToWishlist = async (id) => {
    const item = cartItems.find(item => item.id === id)
    if (item) {
      try {
        const token = localStorage.getItem('token')
        
        if (token && user) {
          // Add to backend wishlist
          const response = await axios.post(`${backendUrl}/api/v1/wishlist/add`, {
            productId: item.productId,
            size: item.size,
            color: item.color
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.data && response.data.success) {
            // Remove from cart
            removeItem(id)
            alert(`${item.name} moved to wishlist!`)
            return
          }
        } else {
          // Add to localStorage wishlist
          const savedWishlist = localStorage.getItem('wishlistItems')
          const currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : []
          
          const existsInWishlist = currentWishlist.some(wishItem => wishItem.productId === item.productId)
          
          if (!existsInWishlist) {
            currentWishlist.push({
              productId: item.productId,
              size: item.size,
              color: item.color
            })
            localStorage.setItem('wishlistItems', JSON.stringify(currentWishlist))
          }
        }
        
        // Remove from cart
        removeItem(id)
        alert(`${item.name} moved to wishlist!`)
      } catch (err) {
        console.error('Error moving to wishlist:', err)
        alert('Failed to move item to wishlist')
      }
    }
  }

  // Apply promo code
  const applyPromoCode = async () => {
    try {
      // You can implement backend validation for promo codes
      const validCodes = {
        'SAVE10': 10,
        'WELCOME15': 15,
        'SUMMER20': 20
      }

      if (validCodes[promoCode.toUpperCase()]) {
        setDiscount(validCodes[promoCode.toUpperCase()])
        setIsPromoApplied(true)
        alert(`Promo code applied! ${validCodes[promoCode.toUpperCase()]}% discount`)
      } else {
        alert('Invalid promo code')
      }
    } catch (err) {
      console.error('Error applying promo code:', err)
      alert('Failed to apply promo code')
    }
  }

  // Remove promo code
  const removePromoCode = () => {
    setDiscount(0)
    setIsPromoApplied(false)
    setPromoCode('')
  }

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fuchsia-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchCartItems}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/collection"
              className="inline-flex items-center px-6 py-3 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 transition-colors duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <Link
              to="/collection"
              className="flex items-center text-fuchsia-600 hover:text-fuchsia-700 font-medium"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
          <p className="text-gray-600 mt-2">{cartItems.length} item(s) in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item, index) => (
                <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/products/${item.productId}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                          onError={handleImageError}
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex-1">
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-fuchsia-600 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          
                          {/* Product Options */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <span>Size: <span className="font-medium">{item.size}</span></span>
                            <span>Color: <span className="font-medium">{item.color}</span></span>
                          </div>

                          {/* Stock Status */}
                          <div className="mb-3">
                            {item.inStock ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock ({item.maxQuantity} available)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-lg font-bold text-gray-900">${item.price}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:items-end space-y-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity || !item.inStock}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => moveToWishlist(item.id)}
                              className="p-2 text-gray-400 hover:text-fuchsia-600 transition-colors"
                              title="Move to wishlist"
                            >
                              <Heart className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                  {isPromoApplied ? (
                    <button
                      onClick={removePromoCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <button className="w-full mt-6 py-3 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 transition-colors duration-300">
                Proceed to Checkout
              </button>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Truck className="h-5 w-5 text-fuchsia-600" />
                  <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-5 w-5 text-fuchsia-600" />
                  <span className="text-sm text-gray-600">Secure payment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-fuchsia-600" />
                  <span className="text-sm text-gray-600">100% secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
