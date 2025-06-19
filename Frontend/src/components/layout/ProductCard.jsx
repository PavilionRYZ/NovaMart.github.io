import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Star, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { addItemToCart } from "../../redux/slices/cartSlice";
import { motion } from "framer-motion";
import { useState } from "react";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const productId = product._id;
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        dispatch(addItemToCart({ productId, quantity }));
        setQuantity(1);
    };

    const handleIncreaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
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
            whileHover={{ y: -3 }}
            transition={{
                initial: { duration: 0.4 },
                hover: { duration: 0.2 },
            }}
            className="group w-full"
        >
            <Card className="flex flex-col h-[420px] sm:h-[450px] bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl">
                {/* Discount Badge */}
                {product.discount > 0 && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md"
                    >
                        -{product.discount}%
                    </motion.div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span
                        className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm ${product.stock > 10
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : product.stock > 0
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                    >
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                    </span>
                </div>

                {/* Image Section */}
                <CardHeader className="p-0 relative overflow-hidden">
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="relative group"
                    >
                        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img
                                src={product.images[0] || "https://via.placeholder.com/300"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                        {/* Quick View Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-full shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-0 h-8 w-8 p-0"
                            >
                                <Eye className="h-3 w-3" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </CardHeader>

                {/* Content Section */}
                <CardContent className="flex-1 p-3 sm:p-4 flex flex-col">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Product Name */}
                        <CardTitle className="mb-2">
                            <Link to={`/product/${product._id}`}>
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                    {product.name || 'Unnamed Product'}
                                </h3>
                            </Link>
                        </CardTitle>

                        {/* Rating */}
                        <motion.div
                            className="flex items-center gap-1 mb-3"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, rotate: -180 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                    >
                                        <Star
                                            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating || 0)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-200"
                                                }`}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <span className="ml-1 text-xs sm:text-sm text-gray-500 font-medium">
                                ({(product.rating || 0).toFixed(1)})
                            </span>
                        </motion.div>

                        {/* Price */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 mt-auto"
                        >
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                                ${(product.price || 0).toFixed(2)}
                            </p>
                            {originalPrice && originalPrice > product.price && (
                                <p className="text-xs sm:text-sm text-gray-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                </CardContent>

                {/* Footer Section */}
                <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col gap-2">
                    <motion.div
                        className="w-full flex flex-col gap-2"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDecreaseQuantity}
                                    disabled={quantity === 1 || isOutOfStock}
                                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-none hover:bg-gray-50 p-0"
                                >
                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="text-sm font-medium w-8 sm:w-10 text-center bg-gray-50 h-7 sm:h-8 flex items-center justify-center">
                                    {quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleIncreaseQuantity}
                                    disabled={quantity >= product.stock || isOutOfStock}
                                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-none hover:bg-gray-50 p-0"
                                >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            onClick={handleAddToCart}
                            className={`w-full transition-all duration-300 text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow-md ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                            disabled={isOutOfStock}
                        >
                            <motion.div
                                className="flex items-center justify-center gap-1.5 sm:gap-2"
                                whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                            >
                                {!isOutOfStock && <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />}
                                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                            </motion.div>
                        </Button>
                    </motion.div>
                </CardFooter>

                {/* Hover Overlay Effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                />
            </Card>
        </motion.div>
    );
};

export default ProductCard;