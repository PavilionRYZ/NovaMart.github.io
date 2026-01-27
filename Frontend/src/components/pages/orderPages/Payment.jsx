import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder, clearOrderState } from "../../../redux/slices/orderSlice";
import {
    createPaymentIntent,
    // keep same name (your backend route is /payments/config but now returns keyId)
    getStripeConfig,
    verifyPayment,
    clearPaymentState,
} from "../../../redux/slices/paymentSlice";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { CreditCard, DollarSign, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Loading from "../../loading/Loading";
import { toast } from "react-toastify";

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

    // reuse same slice fields you already have
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

        if (method === "online") {
            try {
                const result = await dispatch(
                    createOrder({ shippingAddressId, paymentMethod: "online" })
                ).unwrap();

                const newOrderId = result._id;
                setOrderId(newOrderId);

                // backend returns { orderId, amount, currency, keyId }
                await dispatch(createPaymentIntent(newOrderId)).unwrap();
            } catch (err) {
                setErrorMessage(err || "Failed to create order or payment order");
            }
        }
    };

    const handleCashOnDelivery = async () => {
        try {
            await dispatch(
                createOrder({ shippingAddressId, paymentMethod: "cash_on_delivery" })
            ).unwrap();
            toast.success("Order placed successfully with Cash on Delivery!");
            navigate("/user-orders", { state: { message: "Order placed successfully with Cash on Delivery!" } });
        } catch (err) {
            setErrorMessage(err || "Failed to create order");
        }
    };

    const openRazorpay = async () => {
        setProcessing(true);

        const ok = await loadRazorpayScript();
        if (!ok) {
            toast.error("Failed to load Razorpay checkout.");
            setProcessing(false);
            return;
        }

        const keyId = stripeConfig?.keyId; // from /payments/config
        const razorpayOrderId = paymentIntent?.orderId; // from /payments/intent

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
            description: `Payment for order #${orderId}`,
            prefill: {
                name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
                email: user?.email || "",
                contact: user?.phone || "",
            },
            handler: async (response) => {
                try {
                    // response.razorpay_payment_id is the PAYMENT id
                    await dispatch(
                        verifyPayment({ paymentId: response.razorpay_payment_id, orderId })
                    ).unwrap();

                    toast.success("Payment successful! Your order is now dispatched.");
                    dispatch(clearPaymentState());
                    dispatch(clearOrderState());
                    navigate("/profile/orders", {
                        state: { message: "Order placed successfully with online payment!" },
                    });
                } catch (err) {
                    toast.error(err || "Failed to verify payment");
                } finally {
                    setProcessing(false);
                }
            },
            modal: {
                ondismiss: () => {
                    toast.warning("Payment cancelled.");
                    setProcessing(false);
                },
            },
            theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {orderLoading || paymentLoading ? (
                <Loading />
            ) : (
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <CreditCard className="h-6 w-6" />
                                        Payment Options
                                    </CardTitle>
                                    <Button asChild variant="ghost" className="text-white">
                                        <a href="/cart/address">
                                            <ArrowLeft className="h-5 w-5 mr-1" />
                                            Back to Address
                                        </a>
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                {orderError || paymentError || errorMessage ? (
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{orderError || paymentError || errorMessage}</p>
                                        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                                            Retry
                                        </Button>
                                    </div>
                                ) : !cart || cart.items.length === 0 ? (
                                    <p className="text-gray-600 text-center">Cart is empty. Please add items to proceed.</p>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={() => handlePaymentMethodSelect("online")}
                                                className={`flex-1 ${paymentMethod === "online" ? "bg-blue-700" : "bg-blue-600"} hover:bg-blue-700`}
                                            >
                                                <CreditCard className="h-4 w-4 mr-1" />
                                                Pay Online (Razorpay)
                                            </Button>

                                            <Button
                                                onClick={() => handlePaymentMethodSelect("cash_on_delivery")}
                                                className={`flex-1 ${paymentMethod === "cash_on_delivery" ? "bg-blue-700" : "bg-blue-600"} hover:bg-blue-700`}
                                            >
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Cash on Delivery
                                            </Button>
                                        </div>

                                        {paymentMethod === "cash_on_delivery" && (
                                            <div className="text-center">
                                                <p className="text-gray-600 mb-4">You will pay ₹{cart.totalPrice.toFixed(2)} upon delivery.</p>
                                                <Button onClick={handleCashOnDelivery} className="bg-green-600 hover:bg-green-700">
                                                    Place Order
                                                </Button>
                                            </div>
                                        )}

                                        {paymentMethod === "online" && paymentIntent?.orderId && stripeConfig?.keyId && (
                                            <div className="text-center">
                                                <p className="text-gray-600 mb-3">Total: ₹{cart.totalPrice.toFixed(2)}</p>
                                                <Button
                                                    onClick={openRazorpay}
                                                    className="bg-green-600 hover:bg-green-700 w-full"
                                                    disabled={processing}
                                                >
                                                    {processing ? "Opening..." : "Pay with Razorpay"}
                                                </Button>
                                            </div>
                                        )}

                                        {paymentMethod === "online" && (!paymentIntent?.orderId || !stripeConfig?.keyId) && (
                                            <div className="space-y-4">
                                                <Skeleton className="h-12 w-full" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        )}
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
