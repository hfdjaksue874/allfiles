import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import ProductGrid from '../product/ProductGrid';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const Collection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: [],
    price: { min: 0, max: 1000 },
    rating: 0,
    inStock: false
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}products`);
        
        if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(
            response.data.products
              .map(product => product.category)
              .filter(Boolean)
          )];
          
          setCategories(uniqueCategories);
        } else {
          setError('Failed to load products. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }
    
    // Price filter
    if (product.price < filters.price.min || product.price > filters.price.max) {
      return false;
    }
    
    // Rating filter
    if (filters.rating > 0 && (!product.rating || product.rating < filters.rating)) {
      return false;
    }
    
    // In stock filter
    if (filters.inStock && (!product.inStock && product.quantity <= 0 && product.stock <= 0)) {
      return false;
    }
    
    return true;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return (a.price || 0) - (b.price || 0);
      case 'price-high-low':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || 0);
    }
  });

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'category') {
        // Toggle category selection
        const updatedCategories = prev.category.includes(value)
          ? prev.category.filter(cat => cat !== value)
          : [...prev.category, value];
        
        return { ...prev, category: updatedCategories };
      } else if (filterType === 'price') {
        return { ...prev, price: { ...prev.price, [value.type]: value.value } };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: [],
      price: { min: 0, max: 1000 },
      rating: 0,
      inStock: false
    });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Our Products</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset All
              </button>
            </div>
            
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => handleFilterChange('category', category)}
                      className="mr-2"
                    />
                    <span className="capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Min: ${filters.price.min}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.price.min}
                    onChange={(e) => handleFilterChange('price', { type: 'min', value: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Max: ${filters.price.max}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.price.max}
                    onChange={(e) => handleFilterChange('price', { type: 'max', value: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Minimum Rating</h3>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('rating', rating)}
                    className={`px-3 py-1 rounded ${
                      filters.rating === rating 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Stock Status Filter */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="mr-2"
                />
                Show Only In Stock Items
              </label>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className={`${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : (
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
                <p className="text-gray-600">Try adjusting your filters to see more products.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;