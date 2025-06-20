import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input, Form, Alert } from 'antd';
import { forgotPassword } from '../../../redux/slices/authSlice';
import Loading from '../../loading/Loading';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, message } = useSelector((state) => state.auth);
    const [email, setEmail] = useState('');

    const onFinish = async (values) => {
        const result = await dispatch(forgotPassword({ email: values.email }));
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
                    <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
                    {message && <Alert message={message} type="success" showIcon className="mb-4" />}
                    {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                    <Form
                        name="forgotPassword"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        layout="vertical"
                        initialValues={{ email }}
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ validator: validateEmail }]}
                        >
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;