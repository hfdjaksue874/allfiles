import mongoose from "mongoose";
import colorConvert from "color-convert"; // install: npm install color-convert

// Helper: convert string (like "red") or hex shorthand to full hex
const toHex = (val) => {
  if (!val) return val;

  // If already in hex (#RRGGBB)
  if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
    return val.toUpperCase();
  }

  try {
    // Convert color name to HEX
    const rgb = colorConvert.keyword.rgb(val); 
    if (rgb) {
      return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
    }
  } catch {
    return val; // fallback: keep original
  }

  return val;
};

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  colors: {
    type: [String],
    required: true,
    set: (arr) => arr.map((c) => toHex(c)) // auto-convert to HEX
  },
  stock:{
    type: String,
    required: true,
    enum: ['inStock', 'outOfStock'],
    default: 'inStock'
  },
  quantity: { type: Number, required: true },
  sizes: { type: [String], required: true },
  bestseller: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now, required: false }
}, { timestamps: true });

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;
