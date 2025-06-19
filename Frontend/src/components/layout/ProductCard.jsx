import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Star, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { addItemToCart } from "../../redux/slices/cartSlice";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getProductReviews } from "../../redux/slices/reviewSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { reviews, isLoading: reviewsLoading } = useSelector((state) => state.review);
  const productId = product._id;
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState(product.rating || 0);

  // Fetch reviews if not already populated and rating is needed
  useEffect(() => {
    if (product.reviews && product.reviews.length > 0 && !product.rating && !reviewsLoading) {
      dispatch(getProductReviews({ id: productId }));
    }
  }, [dispatch, product.reviews, product.rating, productId, reviewsLoading]);

  // Calculate average rating when reviews are fetched
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avg = totalRating / reviews.length;
      setAverageRating(avg.toFixed(1));
    } else if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      // If reviews are populated in product (e.g., from getProductById)
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avg = totalRating / product.reviews.length;
      setAverageRating(avg.toFixed(1));
    } else {
      setAverageRating(product.rating || 0);
    }
  }, [reviews, product.reviews, product.rating]);

  const handleAddToCart = () => {
    dispatch(addItemToCart({ productId, quantity }));
    setQuantity(1);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
    setQuantity((prev) => prev - 1);
    }
  };

  const originalPrice = product.discount > 0
    ? product.price / (1 - product.discount / 100)
    : null;

  const isOutOfStock = product.stock === 0 || !product.isActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{
        initial: { duration: 0.4 },
        hover: { duration: 0.3, ease: "easeOut" },
      }}
      className="group w-full"
    >
      <Card className="relative h-[400px] sm:h-[450px] bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl">
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <motion.img
            src={product.images[0] || "https://via.placeholder.com/400x450"}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          {/* Stock Badge */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm ${product.stock > 10
                ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                : product.stock > 0
                ? 'bg-amber-500/90 text-white border border-amber-400/50'
                : 'bg-red-500/90 text-white border border-red-400/50'
              }`}
          >
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
          </motion.span>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20"
            >
              -{product.discount}%
            </motion.div>
          )}
        </div>

        {/* Quick View Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full shadow-xl backdrop-blur-md bg-white/95 hover:bg-white border-0 h-12 w-12 p-0"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Product Name */}
            <Link to={`/product/${product._id}`}>
              <h3 className="text-white font-bold text-lg sm:text-xl hover:text-blue-300 transition-colors duration-200 line-clamp-2 drop-shadow-lg">
                {product.name || 'Unnamed Product'}
              </h3>
            </Link>

            {/* Rating */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <Star
                      className={`h-4 w-4 sm:h-5 sm:w-5 drop-shadow-sm ${i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium drop-shadow-sm">
                ({averageRating})
              </span>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <p className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
                ${(product.price || 0).toFixed(2)}
              </p>
              {originalPrice && originalPrice > product.price && (
                <p className="text-white/70 text-sm line-through drop-shadow-sm">
                  ${originalPrice.toFixed(2)}
                </p>
              )}
            </motion.div>

            {/* Quantity and Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 pt-2"
            >
              {/* Quantity Selector */}
              <div className="flex items-center bg-white/20 backdrop-blur-md rounded-lg border border-white/30 overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity === 1 || isOutOfStock}
                  className="h-8 w-8 rounded-none text-white hover:bg-white/20 p-0 border-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-white font-semibold w-10 text-center h-8 flex items-center justify-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="h-8 w-8 rounded-none text-white hover:bg-white/20 p-0 border-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className={`flex-1 transition-all duration-300 font-semibold py-2 rounded-lg shadow-lg backdrop-blur-md border border-white/30 ${isOutOfStock
                    ? 'bg-gray-500/60 text-white/70 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 text-white transform hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                disabled={isOutOfStock}
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                  whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                >
                  {!isOutOfStock && <ShoppingCart className="h-4 w-4" />}
                  <span className="drop-shadow-sm">
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </span>
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            backgroundClip: 'padding-box',
          }}
        />
      </Card>
    </motion.div>
  );
};

export default ProductCard;