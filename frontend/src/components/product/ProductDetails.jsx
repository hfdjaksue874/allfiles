import { useParams } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { backendUrl } from '../../App';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);

  // Base64 encoded SVG placeholders
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzgwODA4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
  const noImagePlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzgwODA4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

  // Check for user authentication on component mount
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

  // Function to check if product is in stock based on quantity
  const isInStock = (product) => {
    if (!product) return false;
    
    // Check if quantity exists and is greater than 0
    if (product.quantity !== undefined) {
      return product.quantity > 0;
    }
    
    // Check if stock exists and is greater than 0
    if (product.stock !== undefined) {
      return product.stock > 0;
    }
    
    // Fallback to inStock boolean if quantity/stock not available
    return product.inStock === true;
  };

  // Function to get available stock count
  const getStockCount = (product) => {
    if (!product) return 0;
    
    // Return quantity if available
    if (product.quantity !== undefined) {
      return product.quantity;
    }
    
    // Return stock if available
    if (product.stock !== undefined) {
      return product.stock;
    }
    
    // If no quantity/stock info, return 0 for out of stock or 1 for in stock
    return product.inStock ? 1 : 0;
  };

  // Function to get stock status
  const getStockStatus = (product) => {
    const stockCount = getStockCount(product);
    const inStock = isInStock(product);
    
    if (!inStock || stockCount === 0) {
      return { 
        text: 'Out of Stock', 
        color: 'bg-red-100 text-red-800'
      };
    } else if (stockCount !== undefined && stockCount <= 5) {
      return { 
        text: `Only ${stockCount} left`, 
        color: 'bg-yellow-100 text-yellow-800'
      };
    } else if (stockCount !== undefined) {
      return { 
        text: 'In Stock', 
        color: 'bg-green-100 text-green-800'
      };
    } else {
      return { 
        text: 'In Stock', 
        color: 'bg-green-100 text-green-800'
      };
    }
  };

  // Function to update product stock in backend
  const updateProductStock = async (productId, newQuantity) => {
    try {
      const response = await axios.put(`${backendUrl}products/${productId}`, {
        quantity: newQuantity,
        stock: newQuantity,
        inStock: newQuantity > 0
      });
      
      if (response.data && response.data.success) {
        console.log('Product stock updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  };

  // Function to decrease product quantity
  const decreaseProductQuantity = async (decreaseBy = 1) => {
    if (!product) return false;

    const currentStock = getStockCount(product);
    const newQuantity = Math.max(0, currentStock - decreaseBy);
    
    // Update backend
    const updateSuccess = await updateProductStock(product._id, newQuantity);
    
    if (updateSuccess) {
      // Update local state
      setProduct(prevProduct => ({
        ...prevProduct,
        quantity: newQuantity,
        stock: newQuantity,
        inStock: newQuantity > 0
      }));
      
      // Reset cart quantity if product goes out of stock
      if (newQuantity === 0) {
        setQuantity(1);
      } else if (quantity > newQuantity) {
        setQuantity(newQuantity);
      }
      
      return true;
    }
    
    return false;
  };

  // Function to add to cart in localStorage
  const addToLocalStorageCart = (cartItem) => {
    try {
      const existingCart = localStorage.getItem('cartItems')
      let cartItems = existingCart ? JSON.parse(existingCart) : []
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => 
        item.productId === cartItem.productId && 
        item.size === cartItem.size && 
        item.color === cartItem.color
      )
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += cartItem.quantity
      } else {
        // Add new item to cart
        cartItems.push(cartItem)
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
      return true
    } catch (error) {
      console.error('Error adding to localStorage cart:', error)
      return false
    }
  }

  // Function to add to wishlist in localStorage
  const addToLocalStorageWishlist = (wishlistItem) => {
    try {
      const existingWishlist = localStorage.getItem('wishlistItems')
      let wishlistItems = existingWishlist ? JSON.parse(existingWishlist) : []
      
      // Check if item already exists in wishlist
      const existingItemIndex = wishlistItems.findIndex(item => 
        item.productId === wishlistItem.productId
      )
      
      if (existingItemIndex === -1) {
        // Add new item to wishlist if it doesn't exist
        wishlistItems.push(wishlistItem)
        localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems))
        return true
      } else {
        // Item already in wishlist
        return false
      }
    } catch (error) {
      console.error('Error adding to localStorage wishlist:', error)
      return false
    }
  }

  // Handle add to cart with authentication check
  const handleAddToCart = async () => {
    if (!productInStock) return;

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: getAllImageUrls(product)[0],
      color: selectedColor || 'N/A',
      size: selectedSize || 'N/A',
      quantity: quantity,
      stock: product.stock || product.quantity || 0
    }

    const token = localStorage.getItem('token')

    if (token && user) {
      // User is authenticated - add to backend cart
      try {
        const response = await axios.post(`${backendUrl}cart/add`, cartItem, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.data && response.data.success) {
          const success = await decreaseProductQuantity(quantity);
          
          if (success) {
            alert(`Successfully added ${quantity} item(s) to cart!`);
            setQuantity(1);
          } else {
            alert('Item added to cart but stock update failed.');
          }
        } else {
          throw new Error('Failed to add to cart')
        }
      } catch (error) {
        console.error('Error adding to backend cart:', error)
        
        // Fallback to localStorage if backend fails
        const localSuccess = addToLocalStorageCart(cartItem)
        if (localSuccess) {
          const stockSuccess = await decreaseProductQuantity(quantity);
          alert(stockSuccess ? 
            `Added to cart locally. ${quantity} item(s) added!` : 
            'Added to cart locally but stock update failed.'
          );
          setQuantity(1);
        } else {
          alert('Failed to add item to cart. Please try again.');
        }
      }
    } else {
      // User not authenticated - add to localStorage
      const localSuccess = addToLocalStorageCart(cartItem)
      
      if (localSuccess) {
        const stockSuccess = await decreaseProductQuantity(quantity);
        alert(stockSuccess ? 
          `Successfully added ${quantity} item(s) to cart!` : 
          'Added to cart but stock update failed.'
        );
        setQuantity(1);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  // Handle add to wishlist with authentication check
  const handleAddToWishlist = async () => {
    const wishlistItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: getAllImageUrls(product)[0],
      addedAt: new Date().toISOString()
    }

    const token = localStorage.getItem('token')

    if (token && user) {
      // User is authenticated - add to backend wishlist
      try {
        const response = await axios.post(`${backendUrl}/api/v1/wishlist/add`, wishlistItem, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.data && response.data.success) {
          alert('Successfully added to wishlist!');
        } else {
          throw new Error('Failed to add to wishlist')
        }
      } catch (error) {
        console.error('Error adding to backend wishlist:', error)
        
        // Fallback to localStorage if backend fails
        const localSuccess = addToLocalStorageWishlist(wishlistItem)
        if (localSuccess) {
          alert('Added to wishlist locally!');
        } else {
          alert('Item already in wishlist.');
        }
      }
    } else {
      // User not authenticated - add to localStorage
      const localSuccess = addToLocalStorageWishlist(wishlistItem)
      
      if (localSuccess) {
        alert('Added to wishlist!');
      } else {
        alert('Item already in wishlist.');
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // First try to get all products and find the specific one
        const response = await axios.get('/api/v1/product/all');
        
        if (response.data && Array.isArray(response.data.products)) {
          const foundProduct = response.data.products.find(p => p._id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            // Set default selections
            if (foundProduct.colors && foundProduct.colors.length > 0) {
              setSelectedColor(foundProduct.colors[0]);
            }
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
              setSelectedSize(foundProduct.sizes[0]);
            }
          } else {
            setError('Product not found.');
          }
        } else {
          // Fallback: try direct product endpoint
          try {
            const directResponse = await axios.get(`${backendUrl}products/${id}`);
            if (directResponse.data && directResponse.data.product) {
              const productData = directResponse.data.product;
              setProduct(productData);
              
              if (productData.colors && productData.colors.length > 0) {
                setSelectedColor(productData.colors[0]);
              }
              if (productData.sizes && productData.sizes.length > 0) {
                setSelectedSize(productData.sizes[0]);
              }
            } else {
              setError('Product not found.');
            }
          } catch (directErr) {
            console.error('Direct fetch also failed:', directErr);
            setError('Failed to load product details. Please try again later.');
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle different image formats consistently with Collection.jsx
  const getAllImageUrls = (product) => {
    try {
      // Use 'image' property to match Collection.jsx, but also check 'images'
      const imageData = product.image || product.images;
      
      if (!imageData) {
        return [noImagePlaceholder];
      }
      
      if (typeof imageData === 'string') {
        return [imageData];
      }
      
      if (imageData.url || imageData.secure_url) {
        return [imageData.url || imageData.secure_url];
      }
      
      if (Array.isArray(imageData)) {
        return imageData.map((img) => {
          if (typeof img === 'string') return img;
          if (img && img.url) return img.url;
          if (img && img.secure_url) return img.secure_url;
          if (img && img.public_id) return `https://res.cloudinary.com/your-cloud-name/image/upload/${img.public_id}`;
          return placeholderImage;
        });
      }
      
      return [noImagePlaceholder];
    } catch (err) {
      console.error('Error processing image URLs:', err);
      return [placeholderImage];
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    const stockCount = getStockCount(product);
    if (newQuantity >= 1 && newQuantity <= stockCount) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <h2 className="text-2xl text-gray-500">Product not found.</h2>
      </div>
    );
  }

  const images = getAllImageUrls(product);
  const mainImageUrl = images[selectedImageIndex] || images[0];
  const stockStatus = getStockStatus(product);
  const stockCount = getStockCount(product);
  const productInStock = isInStock(product);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg relative">
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  console.error(`Image load error for ${product.name}:`, e);
                  e.target.onerror = null; 
                  e.target.src = placeholderImage;
                }}
              />
              
              {/* Out of Stock Overlay */}
              {!productInStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                    OUT OF STOCK
                  </div>
                </div>
              )}
              
              {/* Image navigation arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square w-full bg-gray-200 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                      selectedImageIndex === index ? 'ring-2 ring-indigo-500 opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = placeholderImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>
            
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-500">({product.numOfReviews || 0} reviews)</p>
            </div>

            <p className="text-3xl text-gray-900">${product.price?.toFixed(2)}</p>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-2 text-base text-gray-600 prose">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Category */}
            {product.category && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Category</h3>
                <p className="mt-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md inline-block">{product.category}</p>
              </div>
            )}

            {/* Colors with interactive selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Available Colors</h3>
                <div className="mt-2 flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color 
                          ? 'border-indigo-500 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-sm text-gray-600">Selected: <span className="font-medium">{selectedColor}</span></p>
                )}
              </div>
            )}

            {/* Sizes with interactive selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Available Sizes</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="mt-2 text-sm text-gray-600">Selected: <span className="font-medium">{selectedSize}</span></p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            {productInStock && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quantity</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= stockCount}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-2">Max: {stockCount}</span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!productInStock}
                className={`flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  productInStock 
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
              <button 
                onClick={handleAddToWishlist}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Heart className="h-5 w-5" />
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;