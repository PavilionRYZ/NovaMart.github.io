import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { FaFacebook, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: 'All Products', path: '#' },
            { name: 'Categories', path: '#' },
            { name: 'Deals', path: '#' },
            { name: 'New Arrivals', path: '#' },
        ],
        support: [
            { name: 'Contact Us', path: '#' },
            { name: 'FAQs', path: '#' },
            { name: 'About Us', path: '/about' },
            { name: 'Track Order', path: '#' },
        ],
        company: [
            { name: 'Careers', path: '#' },
            { name: 'Privacy Policy', path: '#' },
            { name: 'Terms of Service', path: '#' },
        ],
    };

    const socialLinks = [
        // { icon: FaFacebook, path: 'https://facebook.com', label: 'Facebook' },
        // { icon: FaXTwitter, path: 'https://twitter.com', label: 'Twitter' },
        { icon: FaGithub, path: 'https://github.com/PavilionRYZ', label: 'GitHub' },
        { icon: FaLinkedinIn, path: "https://www.linkedin.com/in/subhra-sundar-sinha-779538181/", label: 'LinkedIn' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const handleNewsletterSignup = (e) => {
        e.preventDefault();
        alert('Thank you for subscribing!');
    };

    return (
        <motion.footer
            className="bg-gray-900 text-gray-300 py-12 sm:py-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    {/* Brand and Newsletter */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">
                            <Link to="/" className="hover:text-blue-400 transition-colors duration-200">
                                NovaMart
                            </Link>
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your one-stop shop for quality products. Discover the best deals and elevate your shopping experience.
                        </p>
                        <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Subscribe
                            </Button>
                        </form>
                    </motion.div>

                    {/* Shop Links */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-2">
                            {footerLinks.shop.map((link) => (
                                <motion.li key={link.name} variants={itemVariants}>
                                    <Link
                                        to={link.path}
                                        className="text-sm hover:text-blue-400 transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support Links */}
                    <motion.div variants={itemVariants}>
                        <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <motion.li key={link.name} variants={itemVariants}>
                                    <Link
                                        to={link.path}
                                        className="text-sm hover:text-blue-400 transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact and Social */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
                        <ul className="space-y-3 text-sm">
                            <motion.li variants={itemVariants} className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-400" />
                                <a
                                    href="mailto:support@shopsphere.com"
                                    className="hover:text-blue-400 transition-colors duration-200"
                                >
                                    support@NovaMart.com
                                </a>
                            </motion.li>
                            <motion.li variants={itemVariants} className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-400" />
                                <a
                                    href="tel:+1234567890"
                                    className="hover:text-blue-400 transition-colors duration-200"
                                >
                                    +91-8597366993
                                </a>
                            </motion.li>
                            <motion.li variants={itemVariants} className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
                                <span>Tech City, IN</span>
                            </motion.li>
                        </ul>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.2, color: '#3b82f6' }}
                                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                                >
                                    <social.icon className="h-5 w-5" />
                                    <span className="sr-only">{social.label}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Copyright */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400"
                >
                    &copy; {currentYear} ShopSphere. All rights reserved.
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;