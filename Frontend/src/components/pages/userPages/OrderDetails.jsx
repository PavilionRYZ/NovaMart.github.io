import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../../redux/slices/orderSlice';
import { getPaymentByOrderId } from '../../../redux/slices/paymentSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Package, ArrowLeft, MapPin, CreditCard, Calendar, DollarSign, ShoppingBag, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Placeholder image for missing product images
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80?text=No+Image';

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { order, isLoading, error, message } = useSelector((state) => state.order);

    useEffect(() => {
        if (id && typeof id === 'string') {
            dispatch(getOrderById({ id }))
                .unwrap()
                .catch((err) => {
                    console.error('Get Order Error:', err);
                    if (err === 'Not authorized to view this order') {
                        navigate('/user-orders', { state: { error: 'You are not authorized to view this order.' } });
                    } else if (err === 'Invalid token' || err === 'No token provided') {
                        navigate('/login');
                    } else {
                        navigate('/user-orders', { state: { error: 'Failed to fetch order details.' } });
                    }
                });
        } else {
            console.error('Invalid order ID:', id);
            navigate('/user-orders', { state: { error: 'Invalid order ID.' } });
        }

        return () => {
            // Cleanup if needed
        };
    }, [dispatch, id, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get status configuration
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: Clock,
                label: 'Pending'
            },
            processing: {
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: Package,
                label: 'Processing'
            },
            shipped: {
                color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                icon: Truck,
                label: 'Shipped'
            },
            delivered: {
                color: 'bg-green-100 text-green-700 border-green-200',
                icon: CheckCircle,
                label: 'Delivered'
            },
            completed: {
                color: 'bg-green-100 text-green-700 border-green-200',
                icon: CheckCircle,
                label: 'Completed'
            },
            cancelled: {
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: XCircle,
                label: 'Cancelled'
            }
        };
        return configs[status?.toLowerCase()] || configs.pending;
    };

    const statusConfig = order ? getStatusConfig(order.orderStatus) : null;
    const StatusIcon = statusConfig?.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Button
                            onClick={() => navigate("/user-orders")}
                            variant="ghost"
                            className="text-gray-700 hover:text-blue-600 hover:bg-white/50 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                    </motion.div>

                    <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                        {/* Header */}
                        <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white pb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Package className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold">Order Details</h1>
                                        {order && (
                                            <p className="text-blue-100 text-sm mt-1">
                                                Order #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            {!id || typeof id !== 'string' ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center bg-red-50 border-l-4 border-red-500 rounded-xl p-8"
                                >
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <p className="text-red-700 mb-6 text-lg font-medium">Invalid order ID.</p>
                                    <Button
                                        asChild
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Link to="/user-orders">Back to Orders</Link>
                                    </Button>
                                </motion.div>
                            ) : isLoading ? (
                                <div className="space-y-6">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>
                            ) : error ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center bg-red-50 border-l-4 border-red-500 rounded-xl p-8"
                                >
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <p className="text-red-700 mb-6 text-lg font-medium">{error}</p>
                                    <Button
                                        onClick={() => dispatch(getOrderById({ id }))}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            ) : !order ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 text-lg">Order not found.</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Order Summary Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Order Date</p>
                                                        <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Total Amount</p>
                                                        <p className="font-bold text-gray-900 text-xl">
                                                            ${order.totalAmount ? order.totalAmount.toFixed(2) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {StatusIcon && (
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border-2 ${statusConfig.color}`}>
                                                    <StatusIcon className="h-5 w-5" />
                                                    {statusConfig.label}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Order Items */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white rounded-2xl border-2 border-gray-200 p-6"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                                            <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {Array.isArray(order.products) && order.products.length > 0 ? (
                                                order.products.map((item, index) => {
                                                    if (!item.product || typeof item.product !== 'object') {
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center gap-4"
                                                            >
                                                                <img
                                                                    src={PLACEHOLDER_IMAGE}
                                                                    alt="Unavailable"
                                                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-600">Product details unavailable</p>
                                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity || 'N/A'}</p>
                                                                </div>
                                                                <p className="font-bold text-gray-900">N/A</p>
                                                            </div>
                                                        );
                                                    }

                                                    const imageUrl = Array.isArray(item.product.images) && item.product.images.length > 0
                                                        ? item.product.images[0]
                                                        : PLACEHOLDER_IMAGE;

                                                    return (
                                                        <Link
                                                            key={item.product._id || index}
                                                            to={`/product/${item.product._id || '#'}`}
                                                            className="block"
                                                        >
                                                            <div className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-4">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={item.product.name || 'Product Image'}
                                                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100"
                                                                    onError={(e) => {
                                                                        e.target.src = PLACEHOLDER_IMAGE;
                                                                    }}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-gray-900 truncate">{item.product.name || 'Unnamed Product'}</p>
                                                                    <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{item.quantity || 1}</span></p>
                                                                    <p className="text-sm text-gray-600">Price: <span className="font-semibold">${item.product.price?.toFixed(2) || 'N/A'}</span></p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                                    <p className="font-bold text-blue-600 text-lg">
                                                                        ${(item.product.price && item.quantity
                                                                            ? (item.product.price * item.quantity).toFixed(2)
                                                                            : 'N/A')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-gray-600 text-center py-8">No items found in this order.</p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Shipping & Payment Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Shipping Address */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                {order.shippingAddress ? (
                                                    <div className="space-y-1 text-gray-700">
                                                        <p className="font-semibold">{order.shippingAddress.street || 'N/A'}</p>
                                                        <p>
                                                            {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''}{' '}
                                                            {order.shippingAddress.zipCode || ''}
                                                        </p>
                                                        <p>{order.shippingAddress.country || 'N/A'}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">No shipping address provided.</p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Payment Details */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Method:</span>
                                                    <span className="font-semibold text-gray-900 capitalize">
                                                        {order.paymentMethod || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Amount:</span>
                                                    <span className="font-bold text-green-600 text-lg">
                                                        ${order.totalAmount ? order.totalAmount.toFixed(2) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
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
