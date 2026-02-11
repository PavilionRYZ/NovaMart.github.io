import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCart, updateItemQuantity, removeItemFromCart } from '../../../redux/slices/cartSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, Package, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Loading from "../../loading/Loading";

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, isLoading, error } = useSelector((state) => state.cart);

    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    const handleIncreaseQuantity = (productId, currentQuantity) => {
        dispatch(updateItemQuantity({ productId, quantity: currentQuantity + 1 }));
    };

    const handleDecreaseQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            dispatch(updateItemQuantity({ productId, quantity: currentQuantity - 1 }));
        }
    };

    const handleRemoveItem = (productId) => {
        dispatch(removeItemFromCart({ productId }));
    };

    const handleProceedToBuy = () => {
        if (cart && cart.items.length > 0) {
            navigate('/cart/address');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            {isLoading ? (
                <Loading />
            ) : (
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                            {/* Header */}
                            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white pb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                <ShoppingCart className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                                                {cart && cart.items.length > 0 && (
                                                    <p className="text-blue-100 text-sm mt-1">
                                                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8">
                                {error ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center bg-red-50 border-l-4 border-red-500 rounded-xl p-8"
                                    >
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="h-8 w-8 text-red-600" />
                                        </div>
                                        <p className="text-red-700 mb-6 text-lg font-medium">{error}</p>
                                        <Button
                                            onClick={() => dispatch(getCart())}
                                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Try Again
                                        </Button>
                                    </motion.div>
                                ) : !cart || cart.items.length === 0 ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShoppingBag className="h-12 w-12 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            Looks like you haven't added anything to your cart yet
                                        </p>
                                        <Button
                                            onClick={() => navigate('/search')}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <ShoppingBag className="h-5 w-5 mr-2" />
                                            Start Shopping
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Cart Items */}
                                        <div className="space-y-4">
                                            {cart.items.map((item, index) => {
                                                const discountedPrice = item.product.price * (1 - (item.product.discount || 0) / 100);
                                                const subtotal = discountedPrice * item.quantity;
                                                const hasDiscount = item.product.discount && item.product.discount > 0;

                                                // Get the first image from the images array, or use a fallback
                                                const productImage = item.product.images && item.product.images.length > 0
                                                    ? item.product.images[0]
                                                    : null;

                                                return (
                                                    <motion.div
                                                        key={item.product._id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <div className="flex flex-col lg:flex-row gap-6">
                                                            {/* Product Image */}
                                                            <div className="w-full lg:w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {productImage ? (
                                                                    <img
                                                                        src={productImage}
                                                                        alt={item.product.name}
                                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                                        onError={(e) => {
                                                                            // Fallback to icon if image fails to load
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div
                                                                    className={`w-full h-full flex items-center justify-center ${productImage ? 'hidden' : 'flex'}`}
                                                                >
                                                                    <Package className="h-12 w-12 text-blue-600" />
                                                                </div>
                                                            </div>

                                                            {/* Product Details */}
                                                            <div className="flex-1 space-y-3">
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                                        {item.product.name}
                                                                    </h3>
                                                                    {hasDiscount && (
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                                                <Tag className="h-3 w-3" />
                                                                                {item.product.discount}% OFF
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-600">Price: </span>
                                                                        {hasDiscount ? (
                                                                            <>
                                                                                <span className="font-bold text-gray-900">
                                                                                    ${discountedPrice.toFixed(2)}
                                                                                </span>
                                                                                <span className="text-gray-500 line-through ml-2">
                                                                                    ${item.product.price.toFixed(2)}
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="font-bold text-gray-900">
                                                                                ${item.product.price.toFixed(2)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="h-4 w-px bg-gray-300"></div>
                                                                    <div>
                                                                        <span className="text-gray-600">Subtotal: </span>
                                                                        <span className="font-bold text-blue-600 text-base">
                                                                            ${subtotal.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    {item.product.stock <= 10 && (
                                                                        <>
                                                                            <div className="h-4 w-px bg-gray-300"></div>
                                                                            <span className="text-orange-600 text-xs font-semibold">
                                                                                Only {item.product.stock} left in stock!
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Quantity Controls */}
                                                                <div className="flex items-center gap-3 pt-2">
                                                                    <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                                                                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDecreaseQuantity(item.product._id, item.quantity)}
                                                                            disabled={item.quantity === 1}
                                                                            className="h-8 w-8 p-0 hover:bg-white disabled:opacity-40"
                                                                        >
                                                                            <Minus className="h-4 w-4" />
                                                                        </Button>
                                                                        <span className="w-12 text-center font-bold text-gray-900">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleIncreaseQuantity(item.product._id, item.quantity)}
                                                                            disabled={item.quantity >= item.product.stock}
                                                                            className="h-8 w-8 p-0 hover:bg-white disabled:opacity-40"
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Remove Button */}
                                                            <div className="flex lg:flex-col justify-end lg:justify-start items-start">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(item.product._id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Order Summary */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-600 rounded-lg">
                                                        <ShoppingCart className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-gray-700">
                                                    <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
                                                    <span className="font-semibold">${cart.totalPrice.toFixed(2)}</span>
                                                </div>
                                                <div className="border-t border-blue-200 pt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                                        <span className="text-3xl font-bold text-blue-600">
                                                            ${cart.totalPrice.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                onClick={handleProceedToBuy}
                                            >
                                                Proceed to Checkout
                                                <ArrowRight className="h-5 w-5 ml-2" />
                                            </Button>

                                            <p className="text-center text-xs text-gray-600 mt-4">
                                                Free shipping on orders above $50
                                            </p>
                                        </motion.div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Cart;
