import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import { useProducts } from "../../context/ProductContext";

// ✅ Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  discount: yup
    .number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be less than 0")
    .max(100, "Discount cannot exceed 100")
    .nullable(),
});

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh } = useProducts();

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
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
    },
  });

  // ✅ Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:5000/products/update/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data;
        console.log("Fetched product data:", data);

        // Set form values
        reset({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          subCategory: data.subCategory || "",
          price: data.price || "",
          discount: data.discount || "",
          bestseller: data.bestseller || false,
          isShow: data.isShow !== false, // default to true if not specified
        });

        // Set colors and sizes
        if (data.colors && Array.isArray(data.colors)) {
          setColors(data.colors);
        }
        
        if (data.sizes && Array.isArray(data.sizes)) {
          setSizes(data.sizes);
        }

        // Set images
        if (data.images && Array.isArray(data.images)) {
          setExistingImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product details");
        navigate("/all");
      }
    };

    if (id) fetchProduct();
  }, [id, reset, navigate]);

  // Handle colors and sizes
  const handleAddTag = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      
      if (field === "colors") {
        if (value && !colors.includes(value)) {
          setColors([...colors, value]);
          e.target.value = "";
        } else if (value) {
          toast.warning(`${value} is already added to colors`);
        }
      } else if (field === "sizes") {
        if (value && !sizes.includes(value)) {
          setSizes([...sizes, value]);
          e.target.value = "";
        } else if (value) {
          toast.warning(`${value} is already added to sizes`);
        }
      }
    }
  };

  const handleManualAdd = (field) => {
    const inputId = `${field}-input`;
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (field === "colors") {
      if (value && !colors.includes(value)) {
        setColors([...colors, value]);
        input.value = "";
        toast.success(`${value} added to colors`);
      } else if (value) {
        toast.warning(`${value} is already added to colors`);
      }
    } else if (field === "sizes") {
      if (value && !sizes.includes(value)) {
        setSizes([...sizes, value]);
        input.value = "";
        toast.success(`${value} added to sizes`);
      } else if (value) {
        toast.warning(`${value} is already added to sizes`);
      }
    }
  };

  const handleRemoveTag = (field, index) => {
    if (field === "colors") {
      setColors(colors.filter((_, i) => i !== index));
    } else if (field === "sizes") {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  // ✅ Handle new image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImages([...newImages, ...files]);
      
      // Create previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = newImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setNewImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // ✅ Submit form
  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error('You must be logged in to update products.');
        setLoading(false);
        return;
      }

      const form = new FormData();
      
      // Append form fields
      form.append('name', formData.name.trim());
      form.append('description', formData.description.trim());
      form.append('category', formData.category.trim());
      form.append('subCategory', formData.subCategory || '');
      form.append('price', parseFloat(formData.price));
      form.append('discount', parseInt(formData.discount) || 0);
      form.append('bestseller', formData.bestseller.toString());
      form.append('isShow', formData.isShow.toString());
      
      // Append colors and sizes
      colors.forEach((color, index) => {
        form.append(`colors[${index}]`, color);
      });
      
      sizes.forEach((size, index) => {
        form.append(`sizes[${index}]`, size);
      });
      
      // Also send as JSON strings as backup
      form.append('colorsJSON', JSON.stringify(colors));
      form.append('sizesJSON', JSON.stringify(sizes));
      
      // Append existing images
      existingImages.forEach((img, index) => {
        form.append(`existingImages[${index}]`, img);
      });
      
      // Append new images
      newImages.forEach((file) => {
        form.append('images', file);
      });

      console.log("Sending update request for product ID:", id);
      console.log("Form data being sent:", {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        price: formData.price,
        discount: formData.discount,
        bestseller: formData.bestseller,
        isShow: formData.isShow,
        colors: colors,
        sizes: sizes,
        existingImagesCount: existingImages.length,
        newImagesCount: newImages.length
      });

      const response = await axios.put(`http://localhost:5000/products/update/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Update response:", response.data);
      toast.success("Product updated successfully!");
      triggerRefresh();
      navigate("/all");
    } catch (err) {
      console.error("Error updating product:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to update products.');
      } else if (err.response?.status === 404) {
        toast.error('Product not found. It may have been deleted.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Update Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              {...register("name")}
              placeholder="Enter product name"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              {...register("category")}
              placeholder="Enter product category"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-red-500 text-sm">{errors.category?.message}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter product description"
            rows="4"
            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-red-500 text-sm">{errors.description?.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category
            </label>
            <input
              {...register("subCategory")}
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
              {...register("price")}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-red-500 text-sm">{errors.price?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              {...register("discount")}
              placeholder="0"
              min="0"
              max="100"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-red-500 text-sm">{errors.discount?.message}</p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("bestseller")}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Bestseller</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("isShow")}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show Product</span>
          </label>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors: ({colors.length} added)
          </label>
          <div className="flex gap-2 flex-wrap mb-2 min-h-[2rem]">
            {colors.length > 0 ? (
              colors.map((color, i) => (
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
            Sizes: ({sizes.length} added)
          </label>
          <div className="flex gap-2 flex-wrap mb-2 min-h-[2rem]">
            {sizes.length > 0 ? (
              sizes.map((size, i) => (
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
              {existingImages.map((img, i) => (
                <div key={`existing-${i}`} className="relative">
                  <img
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                    alt="existing"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(i)}
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
          disabled={isSubmitting || loading}
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
