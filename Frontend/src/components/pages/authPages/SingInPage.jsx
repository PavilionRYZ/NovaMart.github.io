import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { login, clearAuthState, googleAuth } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';
import Loading from "../../loading/Loading";


const SignInPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        dispatch(login(formData))
            .unwrap()
            .then(() => {
                toast.success("Logged in successfully", {
                    position: "top-right",
                    autoClose: 3000,
                });
                navigate("/");
            })
            .catch((err) => {
                toast.error(err.message || "Failed to log in", {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black font-['Bubblegum_Sans']">
            {isLoading ? (<Loading />) : (
                <motion.div
                    className="w-full max-w-md p-8 bg-white text-black rounded-lg shadow-lg"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Sign In</h2>
                    {error && (
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 py-3 rounded-full border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 py-3 rounded-full border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end mb-4">
                            <Link
                                to="/forgot-password"
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <motion.button
                            type="submit"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="w-full py-3 rounded-full bg-[#243647] text-white hover:bg-[#1a2b38] transition duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </motion.button>
                    </form>
                    <p className="mt-4 text-center text-gray-700">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-blue-600 hover:underline"
                        >
                            Sign Up
                        </Link>
                    </p>
                    <div className="mt-4 text-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    await dispatch(googleAuth(credentialResponse.credential)).unwrap();
                                    toast.success("Logged in successfully with Google", {
                                        position: "top-right",
                                        autoClose: 3000,
                                    });
                                    navigate("/");
                                } catch (err) {
                                    toast.error(err.message || "Failed to log in with Google", {
                                        position: "top-right",
                                        autoClose: 5000,
                                    });
                                }
                            }}
                            onError={() => {
                                toast.error("Google Sign-In was unsuccessful", {
                                    position: "top-right",
                                    autoClose: 5000,
                                });
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default SignInPage;
