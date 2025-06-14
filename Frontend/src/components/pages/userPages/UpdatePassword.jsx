import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { updatePassword, clearAuthState } from '../../../redux/slices/authSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { motion } from 'framer-motion';

    
const UpdatePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, message } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.oldPassword.trim()) errors.oldPassword = 'Current password is required';
        if (!formData.newPassword.trim()) {
            errors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            errors.newPassword = 'New password must be at least 6 characters';
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            errors.confirmNewPassword = 'Passwords do not match';
        }
        return errors;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        dispatch(updatePassword({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
        })).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                navigate('/profile');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                            <CardTitle className="text-2xl">Change Password</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-red-100 text-red-800 p-3 rounded-md mb-4"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-green-100 text-green-800 p-3 rounded-md mb-4"
                                >
                                    {message}
                                </motion.div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="oldPassword">Current Password</Label>
                                    <Input
                                        id="oldPassword"
                                        name="oldPassword"
                                        type="password"
                                        value={formData.oldPassword}
                                        onChange={handleInputChange}
                                        className={formErrors.oldPassword ? 'border-red-500' : ''}
                                    />
                                    {formErrors.oldPassword && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.oldPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={formErrors.newPassword ? 'border-red-500' : ''}
                                    />
                                    {formErrors.newPassword && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        type="password"
                                        value={formData.confirmNewPassword}
                                        onChange={handleInputChange}
                                        className={formErrors.confirmNewPassword ? 'border-red-500' : ''}
                                    />
                                    {formErrors.confirmNewPassword && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.confirmNewPassword}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                                        disabled={isLoading}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Link to="/profile">Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default UpdatePassword;