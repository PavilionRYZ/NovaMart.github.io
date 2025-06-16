import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCart, updateItemQuantity, removeItemFromCart } from '../../../redux/slices/cartSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (<Loading />) : (<div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <ShoppingCart className="h-6 w-6" />
                                Your Cart
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : error ? (
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Button
                                        onClick={() => dispatch(getCart())}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : !cart || cart.items.length === 0 ? (
                                <p className="text-gray-600 text-center">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-6">
                                    {/* Cart Items */}
                                    <div className="space-y-4">
                                        {cart.items.map((item, index) => (
                                            <motion.div
                                                key={item.product._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-gray-600">
                                                        Price: ${item.product.price * (1 - (item.product.discount || 0) / 100)}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Subtotal: ${(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDecreaseQuantity(item.product._id, item.quantity)}
                                                        disabled={item.quantity === 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span>{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleIncreaseQuantity(item.product._id, item.quantity)}
                                                        disabled={item.quantity >= item.product.stock}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(item.product._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Total Price */}
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">
                                            Total: ${cart.totalPrice.toFixed(2)}
                                        </p>
                                        <Button
                                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                                            onClick={handleProceedToBuy}
                                        >
                                            Proceed to Buy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>)}

        </div>
    );
};

export default Cart;