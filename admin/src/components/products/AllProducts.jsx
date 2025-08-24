import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { toast } from 'react-toastify'

const AllProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { shouldRefresh, resetRefresh } = useProducts()
  const navigate = useNavigate()

  // Helper function to get the first image
  const getFirstImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (product.image && Array.isArray(product.image) && product.image.length > 0) {
      return product.image[0]
    }
    if (product.image && typeof product.image === 'string') {
      return product.image
    }
    if (product.images && typeof product.images === 'string') {
      return product.images
    }
    return 'https://via.placeholder.com/300x200?text=No+Image'
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:5000/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      console.log('API Response:', response.data)
      
      let productsData = response.data
      
      if (response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products
      } else if (response.data.data && Array.isArray(response.data.data)) {
        productsData = response.data.data
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      } else {
        console.warn('Unexpected API response structure:', response.data)
        productsData = []
      }
      
      // ✅ Reverse the order so newest shows first
      setProducts([...productsData].reverse())
      setError('')
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to fetch products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (productId) => {
    navigate(`/edit/${productId}`)
  }

  const updateProduct = async (req, res) => {
    try {
      await axios.put('http://localhost:5000/products/update/' + req.params.id, req.body, {})
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const shouldRefresh = localStorage.getItem('refreshProducts')
    if (shouldRefresh) {
      localStorage.removeItem('refreshProducts')
      fetchProducts()
      toast.success('Product added successfully!')
    }
  }, [])

  useEffect(() => {
    if (shouldRefresh) {
      fetchProducts()
      resetRefresh()
    }
  }, [shouldRefresh, resetRefresh])

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('You must be logged in to delete products.')
      return
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.post(
          `http://localhost:5000/products/remove`,
          { id: productId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        )
        setError('')
        toast.success('Product deleted successfully')
      } catch (error) {
        console.error('Delete error:', error)
        if (error.response?.status === 401) {
          setError('Authentication failed. Please login again.')
          localStorage.removeItem('token')
        } else if (error.response?.status === 403) {
          setError('You do not have permission to delete products.')
        } else if (error.response?.status === 404) {
          setError('Product not found.')
        } else {
          setError('Failed to delete product. Please try again.')
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
        <NavLink
          to="/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Product
        </NavLink>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!Array.isArray(products) ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">
            Error: Invalid data format received from server.
          </p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {products.length} product
              {products.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={getFirstImage(product)}
                    alt={product.name || 'Product Image'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/300x200?text=No+Image'
                    }}
                  />

                  {(product.images?.length > 1 ||
                    product.image?.length > 1) && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      {product.images?.length || product.image?.length} images
                    </div>
                  )}

                  <div
                    className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      product.isShow === false
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {product.isShow === false ? 'Hidden' : 'Visible'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 truncate">
                    {product.name || 'Unnamed Product'}
                  </h3>

                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {product.description || 'No description available'}
                  </p>

                  {(product.category || product.subCategory) && (
                    <div className="mb-3">
                      {product.category && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mr-2">
                          {product.category}
                        </span>
                      )}
                      {product.subCategory && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {product.subCategory}
                        </span>
                      )}
                    </div>
                  )}

                  {(product.colors?.length > 0 || product.sizes?.length > 0) && (
                    <div className="mb-3 space-y-2">
                      {product.colors?.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">
                            Colors:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {product.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                ></div>
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                  {color}
                                </span>
                              </div>
                            ))}
                            {product.colors.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{product.colors.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {product.sizes?.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">
                            Sizes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 4).map((size, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                              >
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{product.sizes.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <p className="text-2xl font-bold text-green-600">
                        $
                        {product.price
                          ? parseFloat(product.price).toFixed(2)
                          : '0.00'}
                      </p>
                      {product.discount > 0 && (
                        <span className="text-sm text-red-500">
                          {product.discount}% off
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {product.bestseller && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleEdit(product._id)}
                    >
                      Edit
                    </button>

                    <button
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AllProducts
