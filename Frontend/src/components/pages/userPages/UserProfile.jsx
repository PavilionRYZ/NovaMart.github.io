import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateProfile, logout, clearAuthState } from '../../../redux/slices/authSlice';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../storage/fireBase';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { User, Edit, Lock, LogOut, Camera, Package, Mail, Phone, Upload } from 'lucide-react';
import { FaMapLocationDot } from "react-icons/fa6";
import { motion, AnimatePresence } from 'framer-motion';
import { clearAddressState } from '../../../redux/slices/addressSlice';
import { clearOrderState } from '../../../redux/slices/orderSlice';
import Loading from '../../loading/Loading';
import { v4 as uuidv4 } from "uuid";

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user, isLoading, error, message } = useSelector((state) => state.auth);
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(selectedFile.type)) {
                setUploadError('Please select an image file (JPEG, PNG, GIF, or WebP)');
                return;
            }
            if (selectedFile.size > 2 * 1024 * 1024) { // Match Firebase Storage rules
                setUploadError('File size must be less than 2MB');
                return;
            }

            // Check if user is authenticated
            if (!user || !user._id) {
                setUploadError('You must be logged in to upload an avatar.');
                return;
            }

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(selectedFile);

            setFile(selectedFile);
            setUploadError('');
            handleAvatarUpload(selectedFile);
        }
    };

    const handleAvatarUpload = async (selectedFile) => {
        setIsUploading(true);
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const uuid = uuidv4();
                const extension = selectedFile.name.split('.').pop();
                const fileName = `${user?._id}.${uuid}.${extension}`;

                const storageRef = ref(storage, `avatars/${user._id || 'user'}/${fileName}`);

                const metadata = {
                    contentType: selectedFile.type,
                    customMetadata: {
                        uploadedAt: new Date().toISOString(),
                        userId: user._id || 'unknown'
                    }
                };

                const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
                const downloadURL = await getDownloadURL(snapshot.ref);

                const result = await dispatch(updateProfile({ avatar: downloadURL }));

                if (result.meta.requestStatus === 'fulfilled') {
                    setFile(null);
                    setPreviewUrl(null);
                    return; // Success, exit the function
                } else {
                    throw new Error('Failed to update profile');
                }
            } catch (err) {
                attempt++;
                console.error(`Attempt ${attempt} failed:`, err);
                if (attempt === maxRetries) {
                    setUploadError(`Failed to upload avatar after ${maxRetries} attempts: ${err.message}`);
                    setPreviewUrl(null);
                    break;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        setIsUploading(false);
    };

    // Handle logout with confirmation
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(logout());
            dispatch(clearAuthState());
            dispatch(clearAddressState());
            dispatch(clearOrderState());
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const buttonVariants = {
        hover: {
            scale: 1.02,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            {isLoading ? (
                <Loading />
            ) : (
                <motion.div
                    className="max-w-5xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your account settings and preferences</p>
                    </motion.div>

                    {/* Main Profile Card */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                            {/* Gradient Header */}
                            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
                                </div>
                                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold relative z-10">
                                    <User className="h-8 w-8" />
                                    Profile Dashboard
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-8">
                                <AnimatePresence>
                                    {/* Success Message */}
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 p-4 rounded-xl mb-6 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                {message}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {uploadError && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-800 p-4 rounded-xl mb-6 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                {uploadError}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {error ? (
                                    <motion.div
                                        className="text-center py-12"
                                        variants={itemVariants}
                                    >
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                                            <p className="text-red-600 mb-4 font-medium">{error}</p>
                                        </div>
                                    </motion.div>
                                ) : !user ? (
                                    <motion.div
                                        className="text-center py-12"
                                        variants={itemVariants}
                                    >
                                        <p className="text-gray-600">No user data available.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Profile Info Section */}
                                        <motion.div
                                            className="flex flex-col lg:flex-row gap-8 items-start"
                                            variants={itemVariants}
                                        >
                                            {/* Avatar Section */}
                                            <div className="flex-shrink-0 mx-auto lg:mx-0">
                                                <div className="relative group">
                                                    <motion.button
                                                        onClick={handleAvatarClick}
                                                        className="relative block"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        aria-label="Update avatar"
                                                        disabled={isUploading}
                                                    >
                                                        <div className="relative">
                                                            <img
                                                                src={previewUrl || user.avatar || 'https://via.placeholder.com/200x200/6366f1/ffffff?text=User'}
                                                                alt="User Avatar"
                                                                className="h-40 w-40 rounded-2xl object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                                                            />
                                                            {isUploading && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                                                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                            <div className="text-center text-white">
                                                                <Camera className="h-8 w-8 mx-auto mb-2" />
                                                                <span className="text-sm font-medium">Change Photo</span>
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        disabled={isUploading}
                                                    />
                                                </div>
                                            </div>

                                            {/* User Details */}
                                            <div className="flex-1 text-center lg:text-left">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                                        {user.firstName} {user.lastName || ''}
                                                    </h2>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                                                            <Mail className="h-5 w-5 text-blue-500" />
                                                            <span className="font-medium">{user.email}</span>
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                                                                <Phone className="h-5 w-5 text-green-500" />
                                                                <span className="font-medium">{user.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        Active Account
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.div>

                                        {/* Action Buttons Grid */}
                                        <motion.div
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                            variants={itemVariants}
                                        >
                                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                                <Button
                                                    asChild
                                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                                                >
                                                    <Link to="/update-profile" className="flex items-center justify-center gap-3">
                                                        <Edit className="h-5 w-5" />
                                                        <span className="font-medium">Update Profile</span>
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                                <Button
                                                    asChild
                                                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                                                >
                                                    <Link to="/update-password" className="flex items-center justify-center gap-3">
                                                        <Lock className="h-5 w-5" />
                                                        <span className="font-medium">Change Password</span>
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                                <Button
                                                    asChild
                                                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                                                >
                                                    <Link to="/user-orders" className="flex items-center justify-center gap-3">
                                                        <Package className="h-5 w-5" />
                                                        <span className="font-medium">My Orders</span>
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                                <Button
                                                    asChild
                                                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                                                >
                                                    <Link to="/user-address" className="flex items-center justify-center gap-3">
                                                        <FaMapLocationDot className="h-5 w-5" />
                                                        <span className="font-medium">My Addresses</span>
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="sm:col-span-2 lg:col-span-1"
                                            >
                                                <Button
                                                    onClick={handleLogout}
                                                    className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                                                >
                                                    <LogOut className="h-5 w-5 mr-3" />
                                                    <span className="font-medium">Logout</span>
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default UserProfile;