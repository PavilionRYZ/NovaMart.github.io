import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { verifyOtp, clearAuthState } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import Loading from "../../loading/Loading";

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: location.state?.email || "",
        otp: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.email) {
            toast.error("Email is required", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/signup");
            return;
        }

        dispatch(verifyOtp(formData))
            .unwrap()
            .then(() => {
                toast.success("OTP verified successfully", {
                    position: "top-right",
                    autoClose: 3000,
                });
                { isLoading ? <Loading /> : navigate("/signin") }
            })
            .catch((err) => {
                toast.error(err.message || "Failed to verify OTP", {
                    position: "top-right",
                    autoClose: 5000,
                });
            });
    };

    useEffect(() => {
        dispatch(clearAuthState());
        if (!location.state?.email) {
            toast.error("Please sign up first", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/signup");
        }
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch, location.state, navigate]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {isLoading ? (<Loading />) : (
                <motion.div
                    className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-3xl font-bold text-center text-gray-900">Verify OTP</h2>
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1 relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    OTP
                                </label>
                                <div className="mt-1 relative">
                                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your OTP"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => alert("Resend OTP functionality not implemented")}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Resend OTP
                            </button>
                        </div>

                        <motion.button
                            type="submit"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </motion.button>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default OtpVerificationPage;
