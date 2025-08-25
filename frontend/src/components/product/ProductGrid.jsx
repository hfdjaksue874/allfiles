
import React, { useState } from 'react';
import Product from './Product';

const ProductGrid = ({ products }) => {
  // State to track which product is being hovered
  const [hoveredProductId, setHoveredProductId] = useState(null);
  
  // Track image index for each product
  const [productImageIndices, setProductImageIndices] = useState({});

  // Function to get all image URLs for a product
  const getAllImageUrls = (product) => {
    try {
      // Use 'image' property to match Collection.jsx, but also check 'images'
      const imageData = product.image || product.images;
      
      if (!imageData) {
        return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzgwODA4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='];
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
          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
        });
      }
      
      return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzgwODA4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='];
    } catch (err) {
      console.error('Error processing image URLs:', err);
      return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='];
    }
  };

  // Handle mouse enter for image hover effect
  const handleMouseEnter = (productId) => {
    setHoveredProductId(productId);
  };

  // Handle mouse leave for image hover effect
  const handleMouseLeave = () => {
    setHoveredProductId(null);
  };

  // Handle image navigation
  const handleGoToImage = (productId, index) => {
    setProductImageIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => {
        const allImageUrls = getAllImageUrls(product);
        const currentImageIndex = productImageIndices[product._id] || 0;
        const currentImageUrl = allImageUrls[currentImageIndex] || allImageUrls[0];

        return (
          <div key={product._id} className="h-full">
            <Product
              product={product}
              currentImageUrl={currentImageUrl}
              allImageUrls={allImageUrls}
              currentImageIndex={currentImageIndex}
              onMouseEnter={() => handleMouseEnter(product._id)}
              onMouseLeave={handleMouseLeave}
              onGoToImage={(index) => handleGoToImage(product._id, index)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
