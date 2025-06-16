import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../../redux/slices/orderSlice';
import {getPaymentByOrderId} from '../../../redux/slices/paymentSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Package, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { order, isLoading, error, message } = useSelector((state) => state.order);
    // const { payment, isLoadingPayment, errorPayment, messagePayment } = useSelector((state) => state.payment);
    useEffect(() => {
        // console.log('Order ID from useParams:', id);
        if (id && typeof id === 'string') {
            dispatch(getOrderById({ id }))
                .unwrap()
                .catch((err) => {
                    // console.error('Get Order Error:', err);
                    if (err === 'Not authorized to view this order') {
                        navigate('/user-orders', { state: { error: 'You are not authorized to view this order.' } });
                    } else if (err === 'Invalid token' || err === 'No token provided') {
                        navigate('/login');
                    } else {
                        navigate('/user-orders', { state: { error: 'Failed to fetch order details.' } });
                    }
                });
        } else {
            // console.error('Invalid order ID:', id);
            navigate('/user-orders', { state: { error: 'Invalid order ID.' } });
        }
    }, [dispatch, id, navigate]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // console.log('Order object:', order);

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Package className="h-6 w-6" />
                                    Order Details
                                </CardTitle>
                                <Button asChild variant="ghost" className="text-white">
                                    <Link to="/user-orders">
                                        <ArrowLeft className="h-5 w-5 mr-1" />
                                        Back to Orders
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!id || typeof id !== 'string' ? (
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">Invalid order ID.</p>
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <Link to="/profile/orders">Back to Orders</Link>
                                    </Button>
                                </div>
                            ) : isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ) : error ? (
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Button
                                        onClick={() => dispatch(getOrderById({ id }))}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : !order ? (
                                <p className="text-gray-600 text-center">Order not found.</p>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Order #{order._id}
                                        </h3>
                                        <p className="text-gray-600">
                                            Placed on: {formatDate(order.createdAt)}
                                        </p>
                                        <p
                                            className={`text-sm font-medium ${order.orderStatus === 'pending'
                                                ? 'text-yellow-600'
                                                : order.orderStatus === 'completed'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}
                                        >
                                            Status: {order.orderStatus}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Items
                                        </h3>
                                        <div className="space-y-3">
                                            {Array.isArray(order.products) && order.products.length > 0 ? (
                                                order.products.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-lg p-3 bg-gray-50 flex justify-between"
                                                    >
                                                        <Link to={`/product/${item.product._id}`}>
                                                            <div>
                                                                <p className="font-medium">{item.product.name}</p>
                                                                {/* //show the product image  */}
                                                                <img
                                                                    src={`${item.product.images[0]}`}
                                                                    alt={item.product.name}
                                                                    className="w-20 h-20 object-cover rounded-md"
                                                                />
                                                                <p className="text-gray-600">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                        <p className="font-medium">
                                                            ${(item.product.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600">No items found in this order.</p>
                                            )}
                                        </div>
                                        <p className="mt-3 text-lg font-semibold">
                                            Total: ${order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Shipping Address
                                        </h3>
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <p>{order.shippingAddress.street}</p>
                                            <p>
                                                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                                {order.shippingAddress.zipCode}
                                            </p>
                                            <p>{order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Payment Details
                                        </h3>
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <p>Method: {order.paymentMethod}</p>
                                            {/* {order.paymentMethod === 'online' && (
                                                <p>Status: {order.paymentStatus}</p>
                                            )} */}
                                            <p>Amount: ${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderDetails;