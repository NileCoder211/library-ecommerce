import { motion } from "framer-motion";
import { Trash, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { useAllProducts, useDeleteProduct, useToggleFeatured, useUpdateStock } from "../queries/useProduct";

const ProductsList = () => {
  const { data: products = [] } = useAllProducts();
  const deleteProductMutation = useDeleteProduct();
  const toggleFeaturedMutation = useToggleFeatured();
  const updateStockMutation = useUpdateStock();

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Featured
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700">
              {/* Product */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={product.images?.[0]?.url}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {product.name}
                    </div>
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  KES {product.price.toFixed(2)}
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.category}</div>
              </td>

              {/* Featured */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleFeaturedMutation.mutate(product._id)}
                  disabled={toggleFeaturedMutation.isPending}
                  className={`p-1 rounded-full ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-600 text-gray-300"
                  } hover:bg-yellow-500 transition-colors duration-200`}
                >
                  <Star className="h-5 w-5" />
                </button>
              </td>

              {/* Stock */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() =>
                    updateStockMutation.mutate({
                      productId: product._id,
                      stock: product.stock === 0 ? 1 : 0,
                    })
                  }
                  disabled={updateStockMutation.isPending}
                  className="transition hover:scale-110"
                  title={product.stock === 0 ? "Set In Stock" : "Set Out of Stock"}
                >
                  {product.stock === 0 ? (
                    <ToggleLeft className="h-7 w-7 text-gray-500 hover:text-red-500 transition" />
                  ) : (
                    <ToggleRight className="h-7 w-7 text-green-500 hover:text-green-400 transition" />
                  )}
                </button>
              </td>

              {/* Delete */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => deleteProductMutation.mutate(product._id)}
                  disabled={deleteProductMutation.isPending}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ProductsList;