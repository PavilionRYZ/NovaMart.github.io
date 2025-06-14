import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../layout/ProductCard";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Star, Zap } from "lucide-react";

const carouselImages = [
    {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=400&q=80",
        title: "Luxury Living Spaces",
        subtitle: "Transform your home with our premium collection",
        gradient: "from-purple-900/70 to-blue-900/70"
    },
    {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=400&q=80",
        title: "Modern Furniture",
        subtitle: "Discover contemporary designs for every room",
        gradient: "from-emerald-900/70 to-teal-900/70"
    },
    {
        url: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?auto=format&fit=crop&w=1200&h=400&q=80",
        title: "Cozy Comfort",
        subtitle: "Create your perfect sanctuary at home",
        gradient: "from-amber-900/70 to-orange-900/70"
    },
];

const HomePage = () => {
    const dispatch = useDispatch();
    const { products, isLoading, error } = useSelector((state) => state.product);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        dispatch(getProducts({ isActive: true, limit: 12 }));
    }, [dispatch]);

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [isHovered]);

    // const handlePrevSlide = () => {
    //     setCurrentSlide((prev) =>
    //         prev === 0 ? carouselImages.length - 1 : prev - 1
    //     );
    // };

    // const handleNextSlide = () => {
    //     setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    // };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Hero Carousel */}
            <div
                className="relative w-full h-[600px] overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <AnimatePresence mode="wait" custom={currentSlide}>
                    <motion.div
                        key={currentSlide}
                        custom={currentSlide}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.5 },
                            scale: { duration: 0.7 }
                        }}
                        className="absolute inset-0"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${carouselImages[currentSlide].gradient} z-10`} />
                        <img
                            src={carouselImages[currentSlide].url}
                            alt={carouselImages[currentSlide].title}
                            className="w-full h-full object-cover"
                        />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <motion.div
                                className="text-center text-white px-4 max-w-4xl"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <motion.h1
                                    className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                >
                                    {carouselImages[currentSlide].title}
                                </motion.h1>
                                <motion.p
                                    className="text-xl md:text-2xl mb-8 text-blue-100 font-light"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                >
                                    {carouselImages[currentSlide].subtitle}
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9, duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 text-lg"
                                    >
                                        <Sparkles className="mr-3 h-6 w-6" />
                                        Shop Collection
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 border-white/30 backdrop-blur-md shadow-2xl transition-all duration-300 h-12 w-12 rounded-full"
                            onClick={handlePrevSlide}
                        >
                            <ChevronLeft className="h-6 w-6 text-white" />
                        </Button>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 border-white/30 backdrop-blur-md shadow-2xl transition-all duration-300 h-12 w-12 rounded-full"
                            onClick={handleNextSlide}
                        >
                            <ChevronRight className="h-6 w-6 text-white" />
                        </Button>
                    </motion.div>
                </motion.div> */}

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
                    {carouselImages.map((_, index) => (
                        <motion.button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-3 w-8 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? "bg-white shadow-lg"
                                    : "bg-white/40 hover:bg-white/60"
                                }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                        />
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <motion.div
                className="bg-gradient-to-r from-violet-900 via-purple-900 to-blue-900 text-white py-20 relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 animate-pulse" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div
                            className="flex flex-col items-center group"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.div
                                className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full mb-6 shadow-2xl"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Star className="h-12 w-12 text-white" />
                            </motion.div>
                            <h3 className="text-4xl font-black mb-3 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">50K+</h3>
                            <p className="text-blue-100 text-lg font-medium">Happy Customers</p>
                        </motion.div>

                        <motion.div
                            className="flex flex-col items-center group"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.div
                                className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full mb-6 shadow-2xl"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <TrendingUp className="h-12 w-12 text-white" />
                            </motion.div>
                            <h3 className="text-4xl font-black mb-3 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">10K+</h3>
                            <p className="text-blue-100 text-lg font-medium">Products Sold</p>
                        </motion.div>

                        <motion.div
                            className="flex flex-col items-center group"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.div
                                className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-full mb-6 shadow-2xl"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Zap className="h-12 w-12 text-white" />
                            </motion.div>
                            <h3 className="text-4xl font-black mb-3 bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">5★</h3>
                            <p className="text-blue-100 text-lg font-medium">Average Rating</p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-5xl font-black text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text">
                        Featured Products
                    </h2>
                    <motion.div
                        className="w-32 h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 mx-auto mb-8 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: 128 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                    />
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Discover our handpicked collection of premium products designed to elevate your lifestyle
                    </p>
                </motion.div>

                {isLoading ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {[...Array(8)].map((_, i) => (
                            <motion.div key={i} variants={itemVariants} className="space-y-4">
                                <Skeleton className="h-72 w-full rounded-2xl" />
                                <Skeleton className="h-4 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : error ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                            <motion.div
                                className="text-red-600 mb-6"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-red-800 mb-3">
                                Something went wrong
                            </h3>
                            <p className="text-red-600 mb-6">{error}</p>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => dispatch(getProducts({ isActive: true, limit: 12 }))}
                                    className="bg-red-600 hover:bg-red-700 font-semibold"
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : products.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                            <motion.div
                                className="text-gray-400 mb-6"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-700 mb-3">
                                No products found
                            </h3>
                            <p className="text-gray-500">
                                Check back later for new arrivals
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id}
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Newsletter Section */}
            {/* <motion.div
                className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-20 relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-pulse" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.h3
                        className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Stay in the Loop
                    </motion.h3>
                    <motion.p
                        className="text-xl text-gray-300 mb-10 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Subscribe to our newsletter for exclusive deals, new arrivals, and insider tips
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <motion.input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 bg-white shadow-lg"
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-8 py-4 rounded-xl font-bold shadow-lg">
                                Subscribe
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div> */}
        </div>
    );
};

export default HomePage;