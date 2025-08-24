import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Product from '../product/Product'; // Import the Product component
import { backendUrl } from '../../App';

const Collection = () => {
  const [products, setProducts] = useState([])
  const [displayProducts, setDisplayProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState({})
  const imageSliders = useRef({})

  const fetchProducts = async () => {
    try {
      // Use the same endpoint as ProductDetails.jsx
      const response = await axios.get(`${backendUrl}products`)
      const data = await response.data
      console.log('Collection data:', data)
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products)
        setDisplayProducts(data.products)
      }
      setLoading(false)
    } catch (error) {
      console.error('Collection fetch error:', error)
      setError('Failed to fetch products')
      setLoading(false)
    }
  }

  // Updated to handle different image formats consistently with ProductDetails.jsx
  const getAllImageUrls = (product) => {
    try {
      // Use 'image' property to match ProductDetails.jsx, but also check 'images'
      const imageData = product.image || product.images;
      
      if (!imageData) {
        return ['https://via.placeholder.com/400x400?text=No+Image+Available'];
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
          return 'https://via.placeholder.com/400x400?text=Image+Error';
        });
      }
      
      return ['https://via.placeholder.com/400x400?text=No+Image+Available'];
    } catch (err) {
      console.error('Error processing image URLs:', err);
      return ['https://via.placeholder.com/400x400?text=Image+Error'];
    }
  }

  const getImageUrl = (product, index) => {
    const allUrls = getAllImageUrls(product);
    return allUrls[index] || allUrls[0] || 'https://via.placeholder.com/400x400?text=No+Image';
  }

  const startImageSlider = (productId, totalImages) => {
    if (totalImages <= 1) return; // Don't start slider if only one image
    
    if (imageSliders.current[productId]) {
      clearInterval(imageSliders.current[productId])
    }
    
    imageSliders.current[productId] = setInterval(() => {
      setActiveImageIndex(prev => ({
        ...prev,
        [productId]: (prev[productId] + 1) % totalImages
      }))
    }, 3000)
  }

  const stopImageSlider = (productId) => {
    if (imageSliders.current[productId]) {
      clearInterval(imageSliders.current[productId])
      delete imageSliders.current[productId]
    }
  }

  const goToImage = (productId, index, totalImages) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [productId]: index % totalImages
    }))
  }

  useEffect(() => {
    fetchProducts()
    
    // Cleanup intervals on unmount
    return () => {
      Object.values(imageSliders.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [])

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

  return (
    <div>
      {displayProducts.length > 0 ? (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Our Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const allImageUrls = getAllImageUrls(product)
              const currentImageIndex = activeImageIndex[product._id] || 0
              const currentImageUrl = getImageUrl(product, currentImageIndex)
              
              return (
                <Product
                  key={product._id}
                  product={product}
                  currentImageUrl={currentImageUrl}
                  allImageUrls={allImageUrls}
                  currentImageIndex={currentImageIndex}
                  onMouseEnter={() => startImageSlider(product._id, allImageUrls.length)}
                  onMouseLeave={() => stopImageSlider(product._id)}
                  onGoToImage={(index) => goToImage(product._id, index, allImageUrls.length)}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600">There are currently no products available.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Collection