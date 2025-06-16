import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateProfile, logout, clearAuthState } from '../../../redux/slices/authSlice';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../storage/fireBase';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { User, Edit, Lock, LogOut, Camera, Package } from 'lucide-react';
import { FaMapLocationDot } from "react-icons/fa6";
import { motion } from 'framer-motion';
import { clearAddressState } from '../../../redux/slices/addressSlice';
import { clearOrderState } from '../../../redux/slices/orderSlice';
import Loading from '../../loading/Loading';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user, isLoading, error, message } = useSelector((state) => state.auth);
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    // Fetch user details on mount
    // useEffect(() => {
    //     // dispatch(getCurrentUser());
    //     return () => {
    //         dispatch(clearAuthState());
    //     };
    // }, [dispatch]);

    // Handle file selection
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(selectedFile.type)) {
                setUploadError('Please select an image file (JPEG, PNG, or GIF)');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setUploadError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setUploadError('');
            handleAvatarUpload(selectedFile);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async (selectedFile) => {
        try {
            const storageRef = ref(storage, `avatars/${Date.now()}_${selectedFile.name}`);
            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);

            dispatch(updateProfile({ avatar: downloadURL })).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    setFile(null);
                }
            });
        } catch (err) {
            setUploadError('Failed to upload avatar');
        }
    };

    // Handle logout
    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearAuthState());
        dispatch(clearAddressState());
        dispatch(clearOrderState())
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (<Loading />) : (
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <User className="h-6 w-6" />
                                    My Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-32 w-32 rounded-full" />
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-6 w-1/2" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{error}</p>
                                        {/* <Button
                                          onClick={() => dispatch(getCurrentUser())}
                                          className="bg-blue-600 hover:bg-blue-700"
                                      >
                                          Retry
                                      </Button> */}
                                    </div>
                                ) : !user ? (
                                    <p className="text-gray-600 text-center">No user data available.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {message && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="bg-green-100 text-green-800 p-3 rounded-md"
                                            >
                                                {message}
                                            </motion.div>
                                        )}
                                        {uploadError && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="bg-red-100 text-red-800 p-3 rounded-md"
                                            >
                                                {uploadError}
                                            </motion.div>
                                        )}
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 relative">
                                                <button
                                                    onClick={handleAvatarClick}
                                                    className="group relative"
                                                    aria-label="Update avatar"
                                                >
                                                    <img
                                                        src={user.avatar || 'https://via.placeholder.com/150'}
                                                        alt="User Avatar"
                                                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <Camera className="h-8 w-8 text-white" />
                                                    </div>
                                                </button>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            {/* User Details */}
                                            <div className="flex-1">
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {user.firstName} {user.lastName || ''}
                                                </h2>
                                                <p className="text-gray-600 mt-1">{user.email}</p>
                                                {user.phone && (
                                                    <p className="text-gray-600 mt-1">{user.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Profile Actions */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            <Button
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Link to="/update-profile">
                                                    <Edit className="h-4 w-4" />
                                                    Update Profile
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Link to="/update-password">
                                                    <Lock className="h-4 w-4" />
                                                    Change Password
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Link to="/user-orders">
                                                    <Package className="h-4 w-4" />
                                                    My Orders
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Link to="/user-address">
                                                    <FaMapLocationDot className="h-4 w-4" />
                                                    My Addresses
                                                </Link>
                                            </Button>
                                            <Button
                                                onClick={handleLogout}
                                                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
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

export default UserProfile;