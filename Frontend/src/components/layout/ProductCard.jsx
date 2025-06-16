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
        setQuantity(1); // Reset quantity after adding to cart
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
            whileHover={{ y: -5 }}
            transition={{
                initial: { duration: 0.5 },
                hover: { duration: 0.2 },
            }}
            className="group"
        >
            <Card className="flex flex-col h-full bg-gradient-to-br from-white via-gray-50 to-white border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                {/* Floating discount badge */}
                {product.discount > 0 && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                        className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                    >
                        -{product.discount}%
                    </motion.div>
                )}

                <CardHeader className="p-0 relative overflow-hidden">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="relative group"
                    >
                        <div >
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                    src={product.images[0] || "https://via.placeholder.com/300"}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        </div>

                        {/* Quick view button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <Button size="sm" variant="secondary" className="rounded-full shadow-lg backdrop-blur-sm bg-white/90">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </CardHeader>

                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 flex flex-col justify-between"
                    >
                        <CardTitle className="text-base font-semibold mb-2 h-12 flex flex-col items-start">
                            {product.stock && (
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock > 10
                                        ? 'bg-green-100 text-green-800'
                                        : product.stock > 0
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                                </span>
                            )}
                            <Link to={`/product/${product._id}`}>
                                <div
                                    className="hover:text-primary transition-colors duration-200 hover:underline decoration-2 underline-offset-2 line-clamp-2"
                                >
                                    {product.name}
                                </div>
                            </Link>

                        </CardTitle>

                        <motion.div
                            className="flex items-center justify-between mb-3"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, rotate: -180 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <Star
                                            className={`h-4 w-4 ${i < Math.floor(product.rating || 0)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    </motion.div>
                                ))}
                                <span className="ml-2 text-sm text-gray-600 font-medium">
                                    ({(product.rating || 0).toFixed(1)})
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-between mt-auto"
                        >
                            <div className="flex items-center gap-3">
                                <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    ${(product.price || 0).toFixed(2)}
                                </p>
                                {originalPrice && originalPrice > product.price && (
                                    <p className="text-sm text-gray-500 line-through">
                                        ${originalPrice.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </CardContent>

                <CardFooter className="p-3 sm:p-4 lg:p-5 pt-0">
                    <motion.div
                        className="w-full flex flex-col items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-200 rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDecreaseQuantity}
                                disabled={quantity === 1 || isOutOfStock}
                                className="h-8 w-8 rounded-none hover:bg-gray-100"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-10 text-center">
                                {quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleIncreaseQuantity}
                                disabled={quantity >= product.stock || isOutOfStock}
                                className="h-8 w-8 rounded-none hover:bg-gray-100"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            onClick={handleAddToCart}
                            className={`flex-1 transition-all duration-300 text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl ${isOutOfStock
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transform hover:-translate-y-0.5'
                                }`}
                            disabled={isOutOfStock}
                        >
                            <motion.div
                                className="flex items-center justify-center space-x-2"
                                whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                            >
                                {!isOutOfStock && <ShoppingCart className="h-4 w-4" />}
                                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                            </motion.div>
                        </Button>
                    </motion.div>
                </CardFooter>

                {/* Hover overlay effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                />
            </Card>


        </motion.div>
    );
};

export default ProductCard;