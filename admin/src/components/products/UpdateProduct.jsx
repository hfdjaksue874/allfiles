import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: "",
    discount: "",
    bestseller: false,
    isShow: true,
    colors: [],
    sizes: [],
    quantity: 1,
    stock: "inStock",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [originalImages, setOriginalImages] = useState([]);

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchingProduct(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('You must be logged in to update products.');
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const product = response.data.product;
        
        if (!product) {
          toast.error('Product not found');
          navigate('/products');
          return;
        }

        // Set form data with product details
        setForm({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
          price: product.price?.toString() || "",
          discount: product.discount?.toString() || "0",
          bestseller: product.bestseller || false,
          isShow: product.isShow !== false, // Default to true if not explicitly false
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          quantity: product.quantity || 1,
          stock: product.stock || "inStock",
        });

        // Set original images
        if (Array.isArray(product.images) && product.images.length > 0) {
          setOriginalImages(product.images);
          
          // Create preview URLs for existing images
          const previews = product.images.map(url => url);
          setImagePreviews(previews);
        }

        console.log('Product data loaded:', product);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product data');
        
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setFetchingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Fixed Dynamic input for colors and sizes
  const handleAddTag = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      
      if (value && !form[field].includes(value)) {
        const updatedArray = [...form[field], value];
        setForm(prevForm => ({ 
          ...prevForm, 
          [field]: updatedArray 
        }));
        e.target.value = ""; // Clear input after adding
      } else if (value && form[field].includes(value)) {
        toast.warning(`${value} is already added to ${field}`);
      }
    }
  };

  // Improved remove tag function
  const handleRemoveTag = (field, index) => {
    const updatedArray = form[field].filter((_, i) => i !== index);
    setForm(prevForm => ({
      ...prevForm,
      [field]: updatedArray,
    }));
  };

  // Add a manual add function as backup
  const handleManualAdd = (field) => {
    const inputId = `${field}-input`;
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value && !form[field].includes(value)) {
      const updatedArray = [...form[field], value];
      setForm(prevForm => ({ 
        ...prevForm, 
        [field]: updatedArray 
      }));
      input.value = ""; // Clear input
      toast.success(`${value} added to ${field}`);
    } else if (value && form[field].includes(value)) {
      toast.warning(`${value} is already added to ${field}`);
    } else {
      toast.error(`Please enter a valid ${field.slice(0, -1)}`);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages([...images, ...files]);
      
      // Create previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      
      // Add new previews to existing ones
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    // Check if this is an original image or a newly added one
    if (index < originalImages.length) {
      // This is an original image
      const newOriginalImages = originalImages.filter((_, i) => i !== index);
      setOriginalImages(newOriginalImages);
    } else {
      // This is a newly added image
      const adjustedIndex = index - originalImages.length;
      const newImages = images.filter((_, i) => i !== adjustedIndex);
      setImages(newImages);
    }
    
    // Remove from previews
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  // Add this validation function before the handleSubmit function
  const validateForm = () => {
    const errors = [];
    
    if (!form.name.trim()) errors.push('Product name is required');
    if (!form.description.trim()) errors.push('Description is required');
    if (!form.category.trim()) errors.push('Category is required');
    if (!form.price || parseFloat(form.price) <= 0) errors.push('Valid price is required');
    
    if (form.discount && (parseInt(form.discount) < 0 || parseInt(form.discount) > 100)) {
      errors.push('Discount must be between 0 and 100');
    }
    
    if (originalImages.length === 0 && images.length === 0) {
      errors.push('At least one image is required');
    }
    
    return errors;
  };

  // Update the handleSubmit function to use validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to update products.');
        setLoading(false);
        navigate('/login');
        return;
      }

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append form fields with proper type conversion
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category.trim());
      formData.append('subCategory', form.subCategory.trim());
      formData.append('price', parseFloat(form.price));
      formData.append('discount', parseInt(form.discount) || 0);
      formData.append('bestseller', form.bestseller.toString());
      formData.append('isShow', form.isShow.toString());
      formData.append('quantity', parseInt(form.quantity) || 1);
      formData.append('stock', form.stock);
      
      // Handle colors and sizes properly
      const colorsArray = Array.isArray(form.colors) ? form.colors : [];
      const sizesArray = Array.isArray(form.sizes) ? form.sizes : [];
      
      // Append each color and size individually
      colorsArray.forEach((color, index) => {
        formData.append(`colors[${index}]`, color);
      });
      
      sizesArray.forEach((size, index) => {
        formData.append(`sizes[${index}]`, size);
      });
      
      // Also send as JSON strings as backup
      formData.append('colorsJSON', JSON.stringify(colorsArray));
      formData.append('sizesJSON', JSON.stringify(sizesArray));
      
      // Append original images that weren't removed
      formData.append('originalImages', JSON.stringify(originalImages));
      
      // Append new images
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      // Send update request
      const response = await axios.put(`http://localhost:5000/products/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("Product updated successfully!");
      console.log('Response:', response.data);
      
      // Navigate back to products list
      navigate('/all');
      
    } catch (err) {
      console.error('Error updating product:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to update products.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Invalid data provided.';
        toast.error(errorMessage);
      } else {
        toast.error(err.response?.data?.message || 'Error updating product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Enter product category"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="4"
            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category
            </label>
            <input
              type="text"
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              placeholder="Enter sub category"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="100"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quantity and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="1"
              min="1"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status
            </label>
            <select
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="bestseller"
              checked={form.bestseller}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Bestseller</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isShow"
              checked={form.isShow}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show Product</span>
          </label>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors: ({form.colors.length} added)
          </label>
          <div className="flex gap-2 flex-wrap mb-2 min-h-[2rem]">
            {form.colors.length > 0 ? (
              form.colors.map((color, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {color}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("colors", i)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No colors added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="colors-input"
              type="text"
              placeholder="Type color and press Enter"
              onKeyDown={(e) => handleAddTag(e, "colors")}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <button
              type="button"
              onClick={() => handleManualAdd("colors")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sizes: ({form.sizes.length} added)
          </label>
          <div className="flex gap-2 flex-wrap mb-2 min-h-[2rem]">
            {form.sizes.length > 0 ? (
              form.sizes.map((size, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("sizes", i)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No sizes added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="sizes-input"
              type="text"
              placeholder="Type size and press Enter"
              onKeyDown={(e) => handleAddTag(e, "sizes")}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <button
              type="button"
              onClick={() => handleManualAdd("sizes")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <input 
            type="file" 
            multiple 
            onChange={handleImageChange} 
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h3>
            <div className="flex flex-wrap gap-2">
              {originalImages.map((img, i) => (
                <div key={`existing-${i}`} className="relative">
                  <img
                    src={img}
                    alt="existing"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">New Image Previews:</h3>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, i) => (
                <div key={`preview-${i}`} className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : (
            "Update Product"
          )}
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
