import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder, clearOrderState } from "../../../redux/slices/orderSlice";
import {
    createPaymentIntent,
    getStripeConfig,
    verifyPayment,
    clearPaymentState,
} from "../../../redux/slices/paymentSlice";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { CreditCard, DollarSign, ArrowLeft, Shield, CheckCircle2, Wallet, Package } from "lucide-react";
import { motion } from "framer-motion";
import Loading from "../../loading/Loading";
import { toast } from "react-toastify";
import axios from "axios";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { shippingAddressId } = location.state || {};
    const { cart } = useSelector((state) => state.cart);
    const { isLoading: orderLoading, error: orderError } = useSelector((state) => state.order);

    const { stripeConfig, paymentIntent, paymentId, isLoading: paymentLoading, error: paymentError } =
        useSelector((state) => state.payment);

    const { user } = useSelector((state) => state.auth);

    const [paymentMethod, setPaymentMethod] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!shippingAddressId) {
            navigate("/cart/address");
            toast.info("Please select a shipping address to proceed.");
            return;
        }

        dispatch(getStripeConfig())
            .unwrap()
            .catch((err) => setErrorMessage("Failed to fetch Razorpay configuration: " + err));
    }, [dispatch, navigate, shippingAddressId]);

    const handlePaymentMethodSelect = async (method) => {
        setPaymentMethod(method);
        setErrorMessage(null);

        if (method === "cash_on_delivery") {
            return;
        }
    };

    const handleCashOnDelivery = async () => {
        try {
            await dispatch(
                createOrder({ shippingAddressId, paymentMethod: "cash_on_delivery" })
            ).unwrap();
            toast.success("Order placed successfully with Cash on Delivery!");
            navigate("/user-orders", {
                state: { message: "Order placed successfully with Cash on Delivery!" }
            });
        } catch (err) {
            setErrorMessage(err || "Failed to create order");
        }
    };

    const initiateOnlinePayment = async () => {
        setProcessing(true);

        try {
            const orderResult = await dispatch(
                createOrder({ shippingAddressId, paymentMethod: "online" })
            ).unwrap();

            const newOrderId = orderResult._id;
            setOrderId(newOrderId);

            const paymentResult = await dispatch(
                createPaymentIntent(newOrderId)
            ).unwrap();

            openRazorpayCheckout(newOrderId, paymentResult);

        } catch (err) {
            setErrorMessage(err || "Failed to initiate payment");
            setProcessing(false);
        }
    };

    const openRazorpayCheckout = async (orderIdToUse, paymentIntentData) => {
        const ok = await loadRazorpayScript();
        if (!ok) {
            toast.error("Failed to load Razorpay checkout.");
            setProcessing(false);
            return;
        }

        const keyId = stripeConfig?.keyId;
        const razorpayOrderId = paymentIntentData?.orderId;

        if (!keyId || !razorpayOrderId) {
            toast.error("Razorpay config/order missing.");
            setProcessing(false);
            return;
        }

        const options = {
            key: keyId,
            order_id: razorpayOrderId,
            amount: Math.round((cart?.totalPrice || 0) * 100),
            currency: "INR",
            name: "NovaMart",
            description: `Payment for order #${orderIdToUse}`,
            prefill: {
                name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
                email: user?.email || "",
                contact: user?.phone || "",
            },
            handler: async (response) => {
                try {
                    await dispatch(
                        verifyPayment({
                            paymentId: response.razorpay_payment_id,
                            orderId: orderIdToUse
                        })
                    ).unwrap();

                    toast.success("Payment successful! Your order is now dispatched.");
                    dispatch(clearPaymentState());
                    dispatch(clearOrderState());
                    navigate("/user-orders", {
                        state: { message: "Order placed successfully with online payment!" },
                    });
                } catch (err) {
                    toast.error(err || "Failed to verify payment");
                    await cancelFailedOrder(orderIdToUse);
                } finally {
                    setProcessing(false);
                }
            },
            modal: {
                ondismiss: async () => {
                    toast.warning("Payment cancelled.");
                    await cancelFailedOrder(orderIdToUse);
                    setProcessing(false);
                },
            },
            theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const cancelFailedOrder = async (orderIdToCancel) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/v1/orders/cancel/${orderIdToCancel}`,
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Failed to cancel order:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            {orderLoading || paymentLoading ? (
                <Loading />
            ) : (
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Button
                            onClick={() => navigate("/cart/address")}
                            variant="ghost"
                            className="text-gray-700 hover:text-blue-600 hover:bg-white/50 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Address
                        </Button>
                    </motion.div>

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
                                    <CardTitle className="flex items-center gap-3 text-3xl font-bold mb-2">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <Wallet className="h-7 w-7" />
                                        </div>
                                        Complete Your Payment
                                    </CardTitle>
                                    <p className="text-blue-100 text-sm ml-14">Choose your preferred payment method</p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8">
                                {orderError || paymentError || errorMessage ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center bg-red-50 border border-red-200 rounded-xl p-8"
                                    >
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="h-8 w-8 text-red-600" />
                                        </div>
                                        <p className="text-red-700 mb-6 text-lg font-medium">
                                            {orderError || paymentError || errorMessage}
                                        </p>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Try Again
                                        </Button>
                                    </motion.div>
                                ) : !cart || cart.items.length === 0 ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">Your cart is empty. Please add items to proceed.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Order Summary */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium mb-1">Order Total</p>
                                                    <p className="text-4xl font-bold text-gray-900">
                                                        ₹{cart.totalPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                                                    <Package className="h-10 w-10 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-blue-200">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">{cart.items.length}</span> {cart.items.length === 1 ? 'item' : 'items'} in your cart
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Payment Methods */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                Select Payment Method
                                            </h3>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {/* Online Payment Card */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <button
                                                        onClick={() => handlePaymentMethodSelect("online")}
                                                        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "online"
                                                                ? "border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-100"
                                                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`p-3 rounded-lg ${paymentMethod === "online"
                                                                    ? "bg-blue-600"
                                                                    : "bg-gray-100"
                                                                }`}>
                                                                <CreditCard className={`h-6 w-6 ${paymentMethod === "online"
                                                                        ? "text-white"
                                                                        : "text-gray-600"
                                                                    }`} />
                                                            </div>
                                                            {paymentMethod === "online" && (
                                                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                            Online Payment
                                                        </h4>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            Pay securely using UPI, Cards, NetBanking & Wallets
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-green-600" />
                                                            <span className="text-xs text-green-700 font-medium">100% Secure</span>
                                                        </div>
                                                    </button>
                                                </motion.div>

                                                {/* Cash on Delivery Card */}
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <button
                                                        onClick={() => handlePaymentMethodSelect("cash_on_delivery")}
                                                        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${paymentMethod === "cash_on_delivery"
                                                                ? "border-green-600 bg-green-50 shadow-lg ring-4 ring-green-100"
                                                                : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className={`p-3 rounded-lg ${paymentMethod === "cash_on_delivery"
                                                                    ? "bg-green-600"
                                                                    : "bg-gray-100"
                                                                }`}>
                                                                <DollarSign className={`h-6 w-6 ${paymentMethod === "cash_on_delivery"
                                                                        ? "text-white"
                                                                        : "text-gray-600"
                                                                    }`} />
                                                            </div>
                                                            {paymentMethod === "cash_on_delivery" && (
                                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                            Cash on Delivery
                                                        </h4>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            Pay with cash when your order is delivered
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-blue-600" />
                                                            <span className="text-xs text-blue-700 font-medium">Pay on Delivery</span>
                                                        </div>
                                                    </button>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {paymentMethod === "cash_on_delivery" && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-green-600 rounded-lg">
                                                        <DollarSign className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 font-medium">Amount Payable on Delivery</p>
                                                        <p className="text-2xl font-bold text-gray-900">₹{cart.totalPrice.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleCashOnDelivery}
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                                    Confirm Order
                                                </Button>
                                            </motion.div>
                                        )}

                                        {paymentMethod === "online" && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-600 rounded-lg">
                                                        <CreditCard className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                                                        <p className="text-2xl font-bold text-gray-900">₹{cart.totalPrice.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={initiateOnlinePayment}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="h-5 w-5 mr-2" />
                                                            Proceed to Secure Payment
                                                        </>
                                                    )}
                                                </Button>
                                                <p className="text-xs text-center text-gray-500 mt-3">
                                                    Your payment information is encrypted and secure
                                                </p>
                                            </motion.div>
                                        )}

                                        {paymentMethod === "online" && (!paymentIntent?.orderId || !stripeConfig?.keyId) && (
                                            <div className="space-y-3">
                                                <Skeleton className="h-16 w-full rounded-xl" />
                                                <Skeleton className="h-16 w-full rounded-xl" />
                                            </div>
                                        )}

                                        {/* Security Badge */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200"
                                        >
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span>SSL Encrypted & PCI DSS Compliant</span>
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

export default Payment;
