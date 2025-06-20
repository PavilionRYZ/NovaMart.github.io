import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input, Form, Alert } from 'antd';
import { resetPassword } from '../../../redux/slices/authSlice';
import Loading from '../../loading/Loading';

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useParams();
    const { isLoading, error, message } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({ email: '', newPassword: '', confirmNewPassword: '' });

    useEffect(() => {
        if (!token || token.length !== 64) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const onFinish = async (values) => {
        const result = await dispatch(resetPassword({
            token,
            email: values.email,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword
        }));
        if (result.payload && !result.error) {
            navigate('/signin');
        }
    };

    const onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
    };

    const validateEmail = (_, value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            return Promise.reject(new Error('Email is required'));
        } else if (!emailRegex.test(value)) {
            return Promise.reject(new Error('Invalid email format'));
        }
        return Promise.resolve();
    };

    const validatePassword = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('New password is required'));
        } else if (value.length < 6) {
            return Promise.reject(new Error('Password must be at least 6 characters'));
        }
        return Promise.resolve();
    };

    const validateConfirmPassword = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Confirm password is required'));
        } else if (value !== formData.newPassword) {
            return Promise.reject(new Error('Passwords do not match'));
        }
        return Promise.resolve();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-100 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {isLoading ? (<Loading />) : (
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                    {message && <Alert message={message} type="success" showIcon className="mb-4" />}
                    {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                    <Form
                        name="resetPassword"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        initialValues={formData}
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ validator: validateEmail }]}
                        >
                            <Input
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[{ validator: validatePassword }]}
                        >
                            <Input.Password
                                name="newPassword"
                                placeholder="Enter new password"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmNewPassword"
                            label="Confirm New Password"
                            rules={[{ validator: validateConfirmPassword }]}
                        >
                            <Input.Password
                                name="confirmNewPassword"
                                placeholder="Confirm new password"
                                value={formData.confirmNewPassword}
                                onChange={handleInputChange}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <motion.button
                                type="submit"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="w-full py-3 rounded-full bg-[#243647] text-white hover:bg-[#1a2b38] transition duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </motion.button>
                        </Form.Item>
                    </Form>
                    <p className="text-center mt-4">
                        <Link to="/signin" className="text-blue-600 hover:underline">Back to Login</Link>
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default ResetPassword;