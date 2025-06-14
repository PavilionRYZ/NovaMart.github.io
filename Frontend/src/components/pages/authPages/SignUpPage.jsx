import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt } from "react-icons/fa";
import { signup, clearAuthState, googleAuth } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';
import Loading from "../../loading/Loading";
const SignUpPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        dispatch(signup(formData))
            .then(() => {
                toast.success("Please verify your OTP", {
                    position: "top-right",
                    autoClose: 3000,
                });
                navigate("/verify-otp", { state: { email: formData.email } });
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "Failed to sign up", {
                    position: "top-right",
                    autoClose: 5000,
                });
            });
    };

    useEffect(() => {
        dispatch(clearAuthState());
        return () => {
            dispatch(clearAuthState());
        };
    }, [dispatch]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-['Bubblegum_Sans']">
            <motion.div
                className="w-full max-w-md bg-white rounded-lg shadow-sm p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">Create your account</h1>

                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-gray-800 outline-none transition-colors"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-gray-800 outline-none transition-colors"
                                placeholder="Enter your last name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                        <div className="relative">
                            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-gray-800 outline-none transition-colors"
                                placeholder="Enter your mobile number"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-gray-800 outline-none transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 text-gray-800 outline-none transition-colors"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full py-3 rounded-lg bg-[#243647] hover:bg-gray-400 text-white font-medium transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </motion.button>
                </form>

                <div className="mt-6">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            try {
                                await dispatch(googleAuth(credentialResponse.credential)).unwrap();
                                toast.success("Signed up successfully with Google", {
                                    position: "top-right",
                                    autoClose: 3000,
                                });
                                navigate("/");
                            } catch (err) {
                                toast.error(err.message || "Failed to sign up with Google", {
                                    position: "top-right",
                                    autoClose: 5000,
                                });
                            }
                        }}
                        onError={() => {
                            toast.error("Google Sign-Up was unsuccessful", {
                                position: "top-right",
                                autoClose: 5000,
                            });
                        }}
                    />
                </div>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-blue-500 hover:underline">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignUpPage;
