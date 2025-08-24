import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddProduct = () => {
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
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      console.log(`Adding ${field}:`, value); // Debug log
      console.log(`Current ${field} array:`, form[field]); // Debug log
      
      if (value && !form[field].includes(value)) {
        const updatedArray = [...form[field], value];
        setForm(prevForm => ({ 
          ...prevForm, 
          [field]: updatedArray 
        }));
        e.target.value = ""; // Clear input after adding
        
        console.log(`Updated ${field} array:`, updatedArray); // Debug log
      } else if (value && form[field].includes(value)) {
        toast.warning(`${value} is already added to ${field}`);
      }
    }
  };

  // Improved remove tag function
  const handleRemoveTag = (field, index) => {
    console.log(`Removing ${field} at index:`, index); // Debug log
    const updatedArray = form[field].filter((_, i) => i !== index);
    setForm(prevForm => ({
      ...prevForm,
      [field]: updatedArray,
    }));
    console.log(`Updated ${field} array after removal:`, updatedArray); // Debug log
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
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Add this function to debug form state
  const debugFormState = () => {
    console.log('Current form state:', form);
    console.log('Colors array:', form.colors);
    console.log('Sizes array:', form.sizes);
    console.log('Colors length:', form.colors.length);
    console.log('Sizes length:', form.sizes.length);
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
    
    if (images.length === 0) {
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
        toast.error('You must be logged in to add products.');
        setLoading(false);
        return;
      }

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        setLoading(false);
        return;
      }

      // Basic validation
      if (!form.name || !form.description || !form.price || !form.category) {
        toast.error('Please fill in all required fields.');
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
      
      // Handle colors and sizes properly - send each item separately
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
      
      // Append images
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      // Enhanced debugging
      console.log('=== FRONTEND DEBUG ===');
      console.log('Form data being sent:');
      console.log('- name:', form.name);
      console.log('- description:', form.description);
      console.log('- category:', form.category);
      console.log('- subCategory:', form.subCategory);
      console.log('- price:', form.price, 'parsed:', parseFloat(form.price));
      console.log('- discount:', form.discount, 'parsed:', parseInt(form.discount) || 0);
      console.log('- bestseller:', form.bestseller, 'string:', form.bestseller.toString());
      console.log('- isShow:', form.isShow, 'string:', form.isShow.toString());
      console.log('- colors array:', colorsArray);
      console.log('- sizes array:', sizesArray);
      console.log('- images count:', images.length);
      
      // Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=== END FRONTEND DEBUG ===');

      const response = await axios.post("http://localhost:5000/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("Product added successfully!");
      console.log('Response:', response.data);
      
      // Reset form after successful submission
      setForm({
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
      });
      
      // Clear images and previews
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setImagePreviews([]);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Clear the color and size inputs
      const colorInput = document.getElementById('colors-input');
      const sizeInput = document.getElementById('sizes-input');
      if (colorInput) colorInput.value = '';
      if (sizeInput) sizeInput.value = '';
      
    } catch (err) {
      console.error('Error adding product:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to add products.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Invalid data provided.';
        toast.error(errorMessage);
        console.error('Validation errors:', err.response?.data?.errors);
      } else {
        toast.error(err.response?.data?.message || 'Error adding product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
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
              placeholder="Enter product name"
              value={form.name} 
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input 
              type="text" 
              name="category" 
              placeholder="Enter product category"
              value={form.category} 
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea 
            name="description" 
            placeholder="Enter product description"
            value={form.description} 
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            required 
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
              placeholder="Enter sub category"
              value={form.subCategory} 
              onChange={handleChange}
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
              placeholder="0.00"
              value={form.price} 
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input 
              type="number" 
              name="discount" 
              placeholder="0"
              value={form.discount} 
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
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
                    className="text-blue-600 hover:text-blue-800 ml-1 font-bold"
                    onClick={() => handleRemoveTag("colors", i)}
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No colors added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="colors-input"
              type="text"
              placeholder="Type a color and press Enter (e.g., Red, Blue, Green)"
              className="flex-1 border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => handleAddTag(e, "colors")}
            />
            <button
              type="button"
              onClick={() => handleManualAdd("colors")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Press Enter or click Add button to add a color</p>
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
                    className="text-green-600 hover:text-green-800 ml-1 font-bold"
                    onClick={() => handleRemoveTag("sizes", i)}
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No sizes added yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="sizes-input"
              type="text"
              placeholder="Type a size and press Enter (e.g., S, M, L, XL)"
              className="flex-1 border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => handleAddTag(e, "sizes")}
            />
            <button
              type="button"
              onClick={() => handleManualAdd("sizes")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Press Enter or click Add button to add a size</p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images:
          </label>
          <input 
            type="file" 
            multiple 
            onChange={handleImageChange} 
            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
          <div className="flex gap-4 mt-4 flex-wrap">
            {imagePreviews.map((img, i) => (
              <div key={i} className="relative">
                <img 
                  src={img} 
                  alt="preview" 
                  className="w-24 h-24 object-cover rounded border border-gray-200" 
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  onClick={() => handleRemoveImage(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Section - Remove this after testing */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <button
            type="button"
            onClick={debugFormState}
            className="mb-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Log Form State
          </button>
          <div className="text-sm">
            <p><strong>Colors:</strong> {JSON.stringify(form.colors)}</p>
            <p><strong>Sizes:</strong> {JSON.stringify(form.sizes)}</p>
            <p><strong>Colors Count:</strong> {form.colors.length}</p>
            <p><strong>Sizes Count:</strong> {form.sizes.length}</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
