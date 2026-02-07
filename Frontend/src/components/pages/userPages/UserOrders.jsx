import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserOrders, cancelOrder } from '../../../redux/slices/orderSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import {
    Eye, Package, XCircle, ShoppingBag, Calendar, DollarSign, CheckCircle,
    Clock, Truck, AlertCircle, Filter, SlidersHorizontal, X, ArrowUpDown,
    ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Loading from '../../loading/Loading';

const UserOrders = () => {
    const dispatch = useDispatch();
    const { orders, isLoading, error, message } = useSelector((state) => state.order);
    const [cancelOrderId, setCancelOrderId] = useState(null);

    // Filter and Sort States
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
    const [dateRange, setDateRange] = useState('all'); // all, today, week, month, 3months, 6months, year
    const [amountRange, setAmountRange] = useState('all'); // all, 0-50, 50-100, 100-200, 200+

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

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter('all');
        setSortBy('date-desc');
        setDateRange('all');
        setAmountRange('all');
    };

    // Check if any filters are active
    const hasActiveFilters = statusFilter !== 'all' || dateRange !== 'all' || amountRange !== 'all' || sortBy !== 'date-desc';

    // Filter and sort orders
    const filteredAndSortedOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        let filtered = [...orders];

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.orderStatus.toLowerCase() === statusFilter);
        }

        // Date Range Filter
        if (dateRange !== 'all') {
            const now = new Date();
            const orderDate = (order) => new Date(order.createdAt);

            switch (dateRange) {
                case 'today':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'week':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 7 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'month':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 30 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case '3months':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 90 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case '6months':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 180 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'year':
                    filtered = filtered.filter(order => {
                        const diff = now - orderDate(order);
                        return diff < 365 * 24 * 60 * 60 * 1000;
                    });
                    break;
            }
        }

        // Amount Range Filter
        if (amountRange !== 'all') {
            switch (amountRange) {
                case '0-50':
                    filtered = filtered.filter(order => order.totalAmount >= 0 && order.totalAmount < 50);
                    break;
                case '50-100':
                    filtered = filtered.filter(order => order.totalAmount >= 50 && order.totalAmount < 100);
                    break;
                case '100-200':
                    filtered = filtered.filter(order => order.totalAmount >= 100 && order.totalAmount < 200);
                    break;
                case '200-500':
                    filtered = filtered.filter(order => order.totalAmount >= 200 && order.totalAmount < 500);
                    break;
                case '500+':
                    filtered = filtered.filter(order => order.totalAmount >= 500);
                    break;
            }
        }

        // Sort
        switch (sortBy) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'amount-desc':
                filtered.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'amount-asc':
                filtered.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
        }

        return filtered;
    }, [orders, statusFilter, dateRange, amountRange, sortBy]);

    // Get status styling
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
        return configs[status.toLowerCase()] || configs.pending;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
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
                        {/* Header Section */}
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                                <p className="text-gray-600">Track and manage your orders</p>
                            </motion.div>
                        </div>

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
                                                <Package className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">Order History</h2>
                                                {orders && orders.length > 0 && (
                                                    <p className="text-blue-100 text-sm mt-1">
                                                        {filteredAndSortedOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8">
                                {/* Success Message */}
                                <AnimatePresence>
                                    {message && !cancelOrderId && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <p className="text-green-800 font-medium">{message}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Filter and Sort Section */}
                                {orders && orders.length > 0 && !error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6"
                                    >
                                        {/* Filter Toggle Button */}
                                        <div className="flex items-center justify-between mb-4">
                                            <Button
                                                onClick={() => setShowFilters(!showFilters)}
                                                variant="outline"
                                                className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300"
                                            >
                                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                                Filters & Sort
                                                {hasActiveFilters && (
                                                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </Button>

                                            {hasActiveFilters && (
                                                <Button
                                                    onClick={clearFilters}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>

                                        {/* Filter Panel */}
                                        <AnimatePresence>
                                            {showFilters && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200 space-y-6">
                                                        {/* Status Filter */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                                <Filter className="inline h-4 w-4 mr-1" />
                                                                Order Status
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                                                {['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => setStatusFilter(status)}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                                                                ? 'bg-blue-600 text-white shadow-lg'
                                                                                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                                                                            }`}
                                                                    >
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Date Range Filter */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                                <Calendar className="inline h-4 w-4 mr-1" />
                                                                Date Range
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                                                {[
                                                                    { value: 'all', label: 'All Time' },
                                                                    { value: 'today', label: 'Today' },
                                                                    { value: 'week', label: 'Last 7 Days' },
                                                                    { value: 'month', label: 'Last 30 Days' },
                                                                    { value: '3months', label: 'Last 3 Months' },
                                                                    { value: '6months', label: 'Last 6 Months' },
                                                                    { value: 'year', label: 'Last Year' }
                                                                ].map((range) => (
                                                                    <button
                                                                        key={range.value}
                                                                        onClick={() => setDateRange(range.value)}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range.value
                                                                                ? 'bg-green-600 text-white shadow-lg'
                                                                                : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
                                                                            }`}
                                                                    >
                                                                        {range.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Amount Range Filter */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                                <DollarSign className="inline h-4 w-4 mr-1" />
                                                                Order Amount
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                                                {[
                                                                    { value: 'all', label: 'All Amounts' },
                                                                    { value: '0-50', label: '$0 - $50' },
                                                                    { value: '50-100', label: '$50 - $100' },
                                                                    { value: '100-200', label: '$100 - $200' },
                                                                    { value: '200-500', label: '$200 - $500' },
                                                                    { value: '500+', label: '$500+' }
                                                                ].map((range) => (
                                                                    <button
                                                                        key={range.value}
                                                                        onClick={() => setAmountRange(range.value)}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${amountRange === range.value
                                                                                ? 'bg-purple-600 text-white shadow-lg'
                                                                                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-300'
                                                                            }`}
                                                                    >
                                                                        {range.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Sort Options */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                                <ArrowUpDown className="inline h-4 w-4 mr-1" />
                                                                Sort By
                                                            </label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {[
                                                                    { value: 'date-desc', label: 'Newest First', icon: ArrowDown },
                                                                    { value: 'date-asc', label: 'Oldest First', icon: ArrowUp },
                                                                    { value: 'amount-desc', label: 'Highest Amount', icon: ArrowDown },
                                                                    { value: 'amount-asc', label: 'Lowest Amount', icon: ArrowUp }
                                                                ].map((sort) => {
                                                                    const SortIcon = sort.icon;
                                                                    return (
                                                                        <button
                                                                            key={sort.value}
                                                                            onClick={() => setSortBy(sort.value)}
                                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${sortBy === sort.value
                                                                                    ? 'bg-indigo-600 text-white shadow-lg'
                                                                                    : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-300'
                                                                                }`}
                                                                        >
                                                                            <SortIcon className="h-4 w-4" />
                                                                            {sort.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Active Filters Display */}
                                        {hasActiveFilters && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-wrap gap-2 mt-4"
                                            >
                                                {statusFilter !== 'all' && (
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        Status: {statusFilter}
                                                        <button onClick={() => setStatusFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {dateRange !== 'all' && (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        Date: {dateRange}
                                                        <button onClick={() => setDateRange('all')} className="hover:bg-green-200 rounded-full p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {amountRange !== 'all' && (
                                                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                                        Amount: {amountRange}
                                                        <button onClick={() => setAmountRange('all')} className="hover:bg-purple-200 rounded-full p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {error ? (
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
                                            onClick={() => dispatch(getUserOrders())}
                                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Try Again
                                        </Button>
                                    </motion.div>
                                ) : orders.length === 0 ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShoppingBag className="h-12 w-12 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            You haven't placed any orders yet. Start shopping to see your orders here!
                                        </p>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Link to="/products">
                                                <ShoppingBag className="h-5 w-5 mr-2" />
                                                Start Shopping
                                            </Link>
                                        </Button>
                                    </motion.div>
                                ) : filteredAndSortedOrders.length === 0 ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Filter className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            No orders match your current filters. Try adjusting your filter criteria.
                                        </p>
                                        <Button
                                            onClick={clearFilters}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Clear All Filters
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="space-y-4"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {filteredAndSortedOrders.map((order, index) => {
                                            const statusConfig = getStatusConfig(order.orderStatus);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <motion.div
                                                    key={order._id}
                                                    variants={itemVariants}
                                                    className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300"
                                                >
                                                    <div className="flex flex-col lg:flex-row gap-6">
                                                        {/* Order Icon */}
                                                        <div className="flex-shrink-0">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-blue-600" />
                                                            </div>
                                                        </div>

                                                        {/* Order Details */}
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                                <div>
                                                                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                                                                    <p className="font-bold text-gray-900 font-mono text-sm">
                                                                        #{order._id.slice(-8).toUpperCase()}
                                                                    </p>
                                                                </div>
                                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                                                                    <StatusIcon className="h-4 w-4" />
                                                                    {statusConfig.label}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">Order Date</p>
                                                                        <p className="font-medium text-gray-900 text-sm">
                                                                            {formatDate(order.createdAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <DollarSign className="h-4 w-4 text-green-500" />
                                                                    <div>
                                                                        <p className="text-xs text-gray-500">Total Amount</p>
                                                                        <p className="font-bold text-gray-900 text-base">
                                                                            ${order.totalAmount.toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Items Count */}
                                                            {order.items && order.items.length > 0 && (
                                                                <div className="pt-2 border-t border-gray-200">
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-semibold text-gray-900">{order.items.length}</span> {order.items.length === 1 ? 'item' : 'items'} in this order
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex lg:flex-col gap-2 justify-end lg:justify-start">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                className="flex-1 lg:flex-initial hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-lg"
                                                                size="sm"
                                                            >
                                                                <Link to={`/user-orders/${order._id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </Button>
                                                            {order.orderStatus === 'pending' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setCancelOrderId(order._id)}
                                                                    className="flex-1 lg:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cancel Confirmation Dialog */}
                        <Dialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
                            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 max-w-md">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <AlertCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <DialogTitle className="text-2xl font-bold text-gray-900">
                                            Cancel Order?
                                        </DialogTitle>
                                    </div>
                                </DialogHeader>
                                <div className="py-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        Are you sure you want to cancel this order? This action cannot be undone and any payment will be refunded within 5-7 business days.
                                    </p>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCancelOrderId(null)}
                                        className="rounded-xl hover:bg-gray-50"
                                    >
                                        Keep Order
                                    </Button>
                                    <Button
                                        onClick={handleCancelOrder}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Cancelling...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Cancel Order
                                            </>
                                        )}
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
