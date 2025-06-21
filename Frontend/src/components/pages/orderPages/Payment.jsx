import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder, clearOrderState } from '../../../redux/slices/orderSlice';
import { createPaymentIntent, getStripeConfig, verifyPayment, clearPaymentState } from '../../../redux/slices/paymentSlice';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { CreditCard, DollarSign, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Loading from '../../loading/Loading';
import { toast } from 'react-toastify';

let stripePromise = null;

const StripePaymentForm = ({ totalAmount, orderId, paymentId, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [processing, setProcessing] = useState(false);
    const [address, setAddress] = useState({
        line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "IN",
    });

    const handleAddressChange = (event) => {
        const { name, value } = event.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            toast.error("Stripe has not been properly initialized");
            setProcessing(false);
            return;
        }

        if (
            !address.line1 ||
            !address.city ||
            !address.state ||
            !address.postal_code ||
            !address.country
        ) {
            toast.error("Please fill in all address fields.");
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer",
                        email: user?.email || "unknown@example.com",
                        address: {
                            line1: address.line1,
                            city: address.city,
                            state: address.state,
                            postal_code: address.postal_code,
                            country: address.country,
                        },
                    },
                },
            });

            if (error) {
                if (error.message.includes("r.stripe.com")) {
                    toast.warn(
                        "Some Stripe services are being blocked by your browser (e.g., ad blocker). The payment may still succeed. Please wait."
                    );
                } else {
                    toast.error(error.message);
                    setProcessing(false);
                    return;
                }
            }

            if (!error || paymentIntent?.status === "succeeded") {
                try {
                    await dispatch(verifyPayment(paymentId))
                        .unwrap()
                        .then(() => {
                            toast.success("Payment successful! Your order is now dispatched.");
                            dispatch(clearPaymentState());
                            dispatch(clearOrderState());
                            navigate('/profile/orders', {
                                state: { message: 'Order placed successfully with online payment!' },
                            });
                        })
                        .catch((err) => {
                            toast.error(err || "Failed to verify payment");
                            setProcessing(false);
                        });
                } catch (verifyError) {
                    toast.error("Payment verification failed. Please contact support.");
                    setProcessing(false);
                }
            }
        } catch (err) {
            if (err.message && err.message.includes("r.stripe.com")) {
                toast.warn(
                    "Stripe telemetry is being blocked by your browser (e.g., ad blocker). The payment may still succeed. Verifying..."
                );
                try {
                    await dispatch(verifyPayment(paymentId))
                        .unwrap()
                        .then(() => {
                            toast.success("Payment successful! Your order is now dispatched.");
                            dispatch(clearPaymentState());
                            dispatch(clearOrderState());
                            navigate('/user-orders', {
                                state: { message: 'Order placed successfully with online payment!' },
                            });
                        })
                        .catch((verifyErr) => {
                            toast.error(verifyErr || "Failed to verify payment");
                            setProcessing(false);
                        });
                } catch (verifyError) {
                    toast.error("Payment verification failed. Please contact support.");
                    setProcessing(false);
                }
            } else {
                toast.error("Payment failed. Please try again.");
                setProcessing(false);
            }
        }
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Pay ${totalAmount.toFixed(2)}</h3>
            <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Billing Address</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Address Line 1</label>
                        <input
                            type="text"
                            name="line1"
                            value={address.line1}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Street address"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="City"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="State"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <input
                            type="text"
                            name="postal_code"
                            value={address.postal_code}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Postal Code"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded"
                            placeholder="Country"
                            required
                            disabled
                        />
                    </div>
                </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            <Button
                onClick={handleSubmit}
                className="mt-4 bg-green-600 hover:bg-green-700 w-full"
                disabled={processing || !stripe || !elements}
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </Button>
        </div>
    );
};

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { shippingAddressId } = location.state || {};
    const { cart } = useSelector((state) => state.cart);
    const { order, isLoading: orderLoading, error: orderError } = useSelector((state) => state.order);
    const { stripeConfig, paymentIntent, paymentId, isLoading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);

    const [paymentMethod, setPaymentMethod] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        if (!shippingAddressId) {
            navigate('/cart/address');
            toast.info("Please select a shipping address to proceed.");
            return;
        }

        dispatch(getStripeConfig())
            .unwrap()
            .then((config) => {
                if (config?.publishableKey) {
                    stripePromise = loadStripe(config.publishableKey);
                } else {
                    setErrorMessage('Failed to load Stripe configuration');
                }
            })
            .catch((err) => {
                setErrorMessage('Failed to fetch Stripe configuration: ' + err);
            });
    }, [dispatch, navigate, shippingAddressId]);

    const handlePaymentMethodSelect = async (method) => {
        setPaymentMethod(method);
        setErrorMessage(null);

        if (method === 'online') {
            const orderData = {
                shippingAddressId,
                paymentMethod: 'online',
            };
            try {
                const result = await dispatch(createOrder(orderData)).unwrap();
                const newOrderId = result._id;
                setOrderId(newOrderId);

                const paymentResult = await dispatch(createPaymentIntent(newOrderId)).unwrap();
                if (!paymentResult.clientSecret) {
                    setErrorMessage("Failed to create payment intent: clientSecret not received");
                }
            } catch (err) {
                setErrorMessage(err || 'Failed to create order or payment intent');
            }
        }
    };

    const handleCashOnDelivery = async () => {
        setErrorMessage(null);
        const orderData = {
            shippingAddressId,
            paymentMethod: 'cash_on_delivery',
        };
        try {
            await dispatch(createOrder(orderData)).unwrap();
            toast.success('Order placed successfully with Cash on Delivery!');
            navigate('/user-orders', { state: { message: 'Order placed successfully with Cash on Delivery!' } });
        } catch (err) {
            setErrorMessage(err || 'Failed to create order');
        }
    };

    const appearance = {
        theme: 'stripe',
    };

    const options = {
        clientSecret: paymentIntent?.clientSecret || '',
        appearance,
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {orderLoading || paymentLoading ? (<Loading />) : (
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
                                {(orderLoading || paymentLoading) ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : (orderError || paymentError || errorMessage) ? (
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{orderError || paymentError || errorMessage}</p>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : !cart || cart.items.length === 0 ? (
                                    <p className="text-gray-600 text-center">Cart is empty. Please add items to proceed.</p>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={() => handlePaymentMethodSelect('online')}
                                                className={`flex-1 ${paymentMethod === 'online' ? 'bg-blue-700' : 'bg-blue-600'} hover:bg-blue-700`}
                                            >
                                                <CreditCard className="h-4 w-4 mr-1" />
                                                Pay via Card
                                            </Button>
                                            <Button
                                                onClick={() => handlePaymentMethodSelect('cash_on_delivery')}
                                                className={`flex-1 ${paymentMethod === 'cash_on_delivery' ? 'bg-blue-700' : 'bg-blue-600'} hover:bg-blue-700`}
                                            >
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Cash on Delivery
                                            </Button>
                                        </div>

                                        {paymentMethod === 'cash_on_delivery' && (
                                            <div className="text-center">
                                                <p className="text-gray-600 mb-4">
                                                    You will pay ${cart.totalPrice.toFixed(2)} upon delivery.
                                                </p>
                                                <Button
                                                    onClick={handleCashOnDelivery}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Place Order
                                                </Button>
                                            </div>
                                        )}

                                        {paymentMethod === 'online' && stripePromise && paymentIntent?.clientSecret && (
                                            <Elements stripe={stripePromise} options={options}>
                                                <StripePaymentForm
                                                    totalAmount={cart.totalPrice}
                                                    orderId={orderId}
                                                    paymentId={paymentId}
                                                    clientSecret={paymentIntent.clientSecret}
                                                />
                                            </Elements>
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