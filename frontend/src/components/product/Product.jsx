import axios from 'axios';
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { backendUrl } from '../../App';

const Product = ({
  product,
  currentImageUrl,
  allImageUrls,
  currentImageIndex,
  onMouseEnter,
  onMouseLeave,
  onGoToImage,
}) => {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  if (!product) return null;

  // Base64 encoded SVG placeholder
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';

  // Function to check if product is in stock based on quantity
  const isInStock = (product) => {
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
    // Return quantity if available
    if (product.quantity !== undefined) {
      return product.quantity;
    }
    
    // Return stock if available
    if (product.stock !== undefined) {
      return product.stock;
    }
    
    // If no quantity/stock info, return 0 for out of stock or undefined for in stock
    return product.inStock ? undefined : 0;
  };

  // Function to get stock status
  const getStockStatus = (product) => {
    const stockCount = getStockCount(product);
    const inStock = isInStock(product);
    
    if (!inStock || stockCount === 0) {
      return { text: 'Out of Stock', bgColor: 'bg-red-500', textColor: 'text-white' };
    } else if (stockCount !== undefined && stockCount <= 5) {
      return { text: `Only ${stockCount} left`, bgColor: 'bg-yellow-500', textColor: 'text-white' };
    } else if (stockCount !== undefined) {
      return { text: 'In Stock', bgColor: 'bg-green-500', textColor: 'text-white' };
    } else {
      return { text: 'In Stock', bgColor: 'bg-green-500', textColor: 'text-white' };
    }
  };

  const stockStatus = getStockStatus(product);
  const productInStock = isInStock(product);

  // Function to add product to wishlist
  const addToWishlist = async (e) => {
    e.preventDefault(); // Prevent Link navigation
    
    try {
      setIsAddingToWishlist(true);
      setWishlistError(null);
      
      // Make sure there's a forward slash between backendUrl and 'wishlist'
      const response = await axios.post(`${backendUrl}wishlist/add`, {
        productId: product._id,
        // Include any other required data like userId if needed
      }, {
        // Include authentication headers if required
        headers: {
          // Example: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setIsInWishlist(true);
      console.log('Added to wishlist:', product.name);
      
      // Optional: Show a success toast/notification
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      setWishlistError('Failed to add to wishlist');
      
      // Optional: Show an error toast/notification
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="block group">
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="relative pt-[100%] overflow-hidden bg-gray-200">
          <img
            src={currentImageUrl}
            alt={product.name}
            className={`absolute top-0 left-0 h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ${
              !productInStock ? 'opacity-60 grayscale' : ''
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
          
          {/* Stock Status Badge */}
          <div className={`absolute top-2 left-2 ${stockStatus.bgColor} ${stockStatus.textColor} text-xs font-bold px-2 py-1 rounded shadow-md`}>
            {stockStatus.text}
          </div>

          {/* Out of Stock Overlay */}
          {!productInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                SOLD OUT
              </div>
            </div>
          )}

          {/* Image Navigation Dots - only show if product is in stock */}
          {productInStock && allImageUrls.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-40 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {allImageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent Link navigation
                    onGoToImage(index);
                  }}
                  className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-gray-400'}`}
                  aria-label={`Go to image ${index + 1}`}
                ></button>
              ))}
            </div>
          )}

          {/* Wishlist Button - only show if product is in stock */}
          {productInStock && (
            <button 
              onClick={addToWishlist}
              disabled={isAddingToWishlist || isInWishlist}
              className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 ${
                isAddingToWishlist ? 'cursor-wait' : isInWishlist ? 'bg-pink-50' : ''
              }`}
              aria-label={isInWishlist ? "Added to wishlist" : "Add to wishlist"}
            >
              {isAddingToWishlist ? (
                <svg className="h-4 w-4 text-gray-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isInWishlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318 1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Error tooltip if wishlist action failed */}
          {wishlistError && (
            <div className="absolute top-10 right-2 bg-red-100 text-red-800 text-xs p-1 rounded shadow-md">
              {wishlistError}
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-sm text-gray-500">{product.category || 'Uncategorized'}</h3>
          <h4 className={`mt-1 text-base font-semibold transition-colors duration-300 truncate flex-grow ${
            productInStock 
              ? 'text-gray-800 group-hover:text-fuchsia-600' 
              : 'text-gray-500'
          }`}>
            {product.name}
          </h4>
          
          <div className="mt-2 flex items-center justify-between">
            <p className={`text-lg font-bold ${productInStock ? 'text-gray-900' : 'text-gray-500'}`}>
              ${product.price?.toFixed(2)}
            </p>
            
            {/* Additional stock info for low stock items */}
            {productInStock && getStockCount(product) !== undefined && getStockCount(product) <= 5 && (
              <span className="text-xs text-orange-600 font-medium">
                Low Stock
              </span>
            )}
          </div>

          {/* Rating if available */}
          {product.rating && (
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">({product.rating})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Product