import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { PlusCircle, Upload, Loader, X } from "lucide-react";
import { useCreateProduct } from "../queries/useProduct";

const categories = [
  "sofa",
  "dining",
  "beds",
  "wardrobes",
  "stools",
  "doors",
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "", 
    category: "",
    images: [],
  });

  const createProductMutation = useCreateProduct();

  const handleSubmit = (e) => {
  e.preventDefault();
  createProductMutation.mutate(newProduct, {
    onSuccess: () => {
      setNewProduct({ name: "", description: "", price: "",  stock: "", category: "", images: [] });
    },
  });
};

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // Check total image count limit
    if (newProduct.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      e.target.value = ""; // reset file input
      return;
    }

    // Validate each file size
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5MB size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const imagePromises = validFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        })
    );

    try {
      const base64Images = await Promise.all(imagePromises);
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
    } catch (err) {
      console.error("Error reading image files:", err);
      toast.error("Failed to read one or more images. Please try again.");
    }

    e.target.value = ""; // reset so same file can be re-selected if needed
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2
						focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
						 focus:border-emerald-500"
            required
          />
        </div>

        {/* Price — min="0.01" prevents zero or negative values */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            step="0.01"
            min="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
						 focus:border-emerald-500"
            required
          />
        </div>

        {/* Stock */}
<div>
  <label
    htmlFor="stock"
    className="block text-sm font-medium text-gray-300"
  >
    Stock Quantity
  </label>
  <input
    type="number"
    id="stock"
    name="stock"
    value={newProduct.stock}
    onChange={(e) =>
      setNewProduct({ ...newProduct, stock: e.target.value })
    }
    step="1"
    min="0"
    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
    py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
     focus:border-emerald-500"
    required
  />
</div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md
						 shadow-sm py-2 px-3 text-white focus:outline-none 
						 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

     {/* Image Upload + Drag & Drop */}
<div
  onDragOver={(e) => {
    e.preventDefault();
  }}
  onDrop={(e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    handleImageChange({ target: { files } });
  }}
  className="mt-1"
>
  {/* Hidden input */}
  <input
    type="file"
    id="images"
    className="sr-only"
    accept="image/*"
    multiple
    onChange={handleImageChange}
    disabled={newProduct.images.length >= MAX_IMAGES}
  />

  {/* Upload Button */}
  <label
    htmlFor="images"
    className={`cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md 
    shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
    inline-flex items-center gap-2
    ${newProduct.images.length >= MAX_IMAGES ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <Upload className="h-5 w-5" />
    Upload Images
  </label>

 {/* Drag & Drop Upload Area */}
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageChange({ target: { files } });
  }}
  className="mt-1 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center bg-gray-800 hover:border-emerald-500 transition"
>
  {/* Hidden input */}
  <input
    type="file"
    id="images"
    className="sr-only"
    accept="image/*"
    multiple
    onChange={handleImageChange}
    disabled={newProduct.images.length >= MAX_IMAGES}
  />

  <label htmlFor="images" className="cursor-pointer block">
    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />

    <p className="text-sm text-gray-300">
      Drag & drop images here
    </p>

    <p className="text-xs text-gray-500 mt-1">
      or click to browse files (max {MAX_IMAGES})
    </p>
  </label>
</div>


  {/* Image Previews */}
  {newProduct.images.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {newProduct.images.map((img, index) => (
        <div key={index} className="relative group">
          <img
            src={img}
            alt={`preview ${index + 1}`}
            className="h-20 w-full object-cover rounded"
          />

          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white 
            rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
					shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 
					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={createProductMutation.isPending}
          >
{createProductMutation.isPending ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;