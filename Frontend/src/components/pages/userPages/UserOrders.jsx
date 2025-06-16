import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserOrders, cancelOrder } from '../../../redux/slices/orderSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Eye, Package, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Loading from '../../loading/Loading';

const UserOrders = () => {
    const dispatch = useDispatch();
    const { orders, isLoading, error, message } = useSelector((state) => state.order);
    const [cancelOrderId, setCancelOrderId] = useState(null);

    useEffect(() => {
        dispatch(getUserOrders());
    }, [dispatch]);

    const handleCancelOrder = () => {
        dispatch(cancelOrder({ id: cancelOrderId })).then(() => {
            setCancelOrderId(null);
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (<Loading />) : (
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white shadow-lg mb-6">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Package className="h-6 w-6" />
                                    My Orders
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
                                            onClick={() => dispatch(getUserOrders())}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-gray-600 text-center">No orders found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <motion.div
                                                key={order._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">Order ID: {order._id}</p>
                                                    <p className="text-gray-600">
                                                        Date: {formatDate(order.createdAt)}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Total: ${order.totalAmount.toFixed(2)}
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
                                                <div className="flex gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link to={`/user-orders/${order._id}`}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                    {order.orderStatus === 'pending' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setCancelOrderId(order._id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Cancel Order
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* {message && !cancelOrderId && (
         <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="bg-green-100 text-green-800 p-3 rounded-md mb-6"
         >
             {message}
         </motion.div>
     )} */}

                        <Dialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Cancellation</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setCancelOrderId(null)}>
                                        No, Keep Order
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        disabled={isLoading}
                                    >
                                        Yes, Cancel Order
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                </div>
            )}

        </div>
    );
};

export default UserOrders;