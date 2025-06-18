import React,{ useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getProducts, clearProductState } from "../../redux/slices/productSlice";
import ProductCard from "../layout/ProductCard";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Star, Zap, Tag, Gift, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=400&q=80",
    title: "Luxury Living Spaces",
    subtitle: "Transform your home with our premium collection",
    gradient: "from-purple-900/70 to-blue-900/70",
  },
  {
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=400&q=80",
    title: "Modern Furniture",
    subtitle: "Discover contemporary designs for every room",
    gradient: "from-emerald-900/70 to-teal-900/70",
  },
  {
    url: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?auto=format&fit=crop&w=1200&h=400&q=80",
    title: "Cozy Comfort",
    subtitle: "Create your perfect sanctuary at home",
    gradient: "from-amber-900/70 to-orange-900/70",
  },
];

const categoryHighlights = [
  { name: "Furniture", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=300&q=80", link: "/category/furniture" },
  { name: "Electronics", image: "https://i.pinimg.com/736x/eb/d8/4a/ebd84aee9bd1feddce359d9803236f4b.jpg", link: "/search?category=Electronics" },
  { name: "Fashion", image: "https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", link: "/search?category=Clothing" },
  { name: "Home & Garden Decor", image: "https://i.pinimg.com/736x/af/01/bd/af01bddb705257d6babb1df1605c1035.jpg", link: "/search?category=Home" },
];

const offerBanners = [
  {
    title: "Big Diwali Sale",
    subtitle: "Up to 70% Off on Furniture & Electronics!",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    cta: "Shop Now",
    link: "/deals/diwali-sale",
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "Flash Sale",
    subtitle: "Grab Deals Before They’re Gone!",
    image: "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cta: "Shop Deals",
    link: "/deals/flash-sale  ",
    gradient: "from-blue-500 to-purple-600",
  },
];


const MemoizedProductCard = React.memo(ProductCard);

const HomePage = () => {
  const dispatch = useDispatch();
  const { searchResults: products, isLoading, error } = useSelector((state) => state.product);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const isMounted = useRef(true);
  const shouldReduceMotion = useReducedMotion();


  const memoizedProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  useEffect(() => {
    isMounted.current = true;
    dispatch(clearProductState());
    const fetchProducts = async () => {
      try {
        console.log("Dispatching getProducts with limit: 12");
        await dispatch(getProducts({ limit: 12 })).unwrap();
        console.log("getProducts succeeded");
      } catch (err) {
        if (isMounted.current) {
          console.error("getProducts failed with error:", err);
          toast.error(err || "Failed to load products");
        }
      }
    };
    fetchProducts();

    return () => {
      isMounted.current = false;
      console.log("Unmounting HomePage, skipping state updates");
    };
  }, [dispatch]);

  useEffect(() => {
    console.log("Products state updated:", { products: memoizedProducts, isLoading, error });
    if (error && !isLoading) {
      toast.error(error);
    }
  }, [memoizedProducts, isLoading, error]);

  useEffect(() => {
    if (!isHovered && isMounted.current) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.6 },
    },
  };

  const slideVariants = {
    enter: (direction) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 1000 : -1000,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: shouldReduceMotion ? 0 : direction < 0 ? 1000 : -1000,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
  };

  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      await dispatch(getProducts({ limit: 12 })).unwrap();
    } catch (err) {
      toast.error(err || "Retry failed");
    } finally {
      setRetryLoading(false);
    }
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
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${carouselImages[currentSlide].gradient} z-10`} />
            <img
              src={carouselImages[currentSlide].url}
              alt={carouselImages[currentSlide].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <motion.div
                className="text-center text-white px-4 max-w-4xl"
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
              >
                <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {carouselImages[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light">
                  {carouselImages[currentSlide].subtitle}
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 text-lg"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Shop Collection
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-8 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white shadow-lg" : "bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>

      {/* Category Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore our wide range of products across top categories</p>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categoryHighlights.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative rounded-xl overflow-hidden shadow-md"
            >
              <Link to={category.link}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <p className="text-white font-semibold text-base sm:text-lg p-3 sm:p-4">{category.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Offer Banners */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {offerBanners.map((banner, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative rounded-xl overflow-hidden shadow-lg"
              >
                <Link to={banner.link}>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-80 flex items-center justify-center`}
                  >
                    <div className="text-center text-white px-4">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2">{banner.title}</h3>
                      <p className="text-base sm:text-lg mb-4">{banner.subtitle}</p>
                      <Button
                        className="bg-white text-gray-900 font-semibold hover:bg-gray-100"
                        size="sm"
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        {banner.cta}
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        className="bg-gradient-to-r from-violet-900 via-purple-900 to-blue-900 text-white py-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Star, value: "50K+", label: "Happy Customers", gradient: "from-yellow-400 to-orange-500" },
              { icon: TrendingUp, value: "10K+", label: "Products Sold", gradient: "from-green-400 to-emerald-500" },
              { icon: Zap, value: "5★", label: "Average Rating", gradient: "from-pink-400 to-rose-500" },
            ].map((stat, index) => (
              <motion.div key={index} className="flex flex-col items-center" variants={itemVariants}>
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 sm:p-4 rounded-full mb-4 sm:mb-6 shadow-2xl`}>
                  <stat.icon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className={`text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r ${stat.gradient.replace('to-', 'to-').replace('from-', 'from-')} bg-clip-text text-transparent`}>
                  {stat.value}
                </h3>
                <p className="text-blue-100 text-base sm:text-lg font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Trending Deals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
        >
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text">
            Trending Deals
          </h2>
          <motion.div
            className="w-24 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 mx-auto mb-6 sm:mb-8 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 1 }}
          />
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Don’t miss out on these hot deals and exclusive offers
          </p>
        </motion.div>

        {isLoading || retryLoading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} variants={itemVariants} className="space-y-4">
                <Skeleton className="h-60 sm:h-72 w-full rounded-2xl" />
                <Skeleton className="h-3 sm:h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 sm:h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
              </motion.div>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <motion.div
                className="text-red-600 mb-4 sm:mb-6"
                animate={{ rotate: shouldReduceMotion ? 0 : [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <svg
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2 sm:mb-3">Something went wrong</h3>
              <p className="text-red-600 mb-4 sm:mb-6">{error}</p>
              <Button
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 font-semibold"
                disabled={retryLoading}
              >
                {retryLoading ? "Retrying..." : "Try Again"}
              </Button>
            </div>
          </motion.div>
        ) : memoizedProducts.length === 0 ? (
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <motion.div
                className="text-gray-500 mb-4 sm:mb-6"
                animate={{ y: shouldReduceMotion ? 0 : [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-3">No products available</h3>
              <p className="text-gray-500">Check back later for new arrivals</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {memoizedProducts.slice(0, 8).map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MemoizedProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
        >
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text">
            Featured Products
          </h2>
          <motion.div
            className="w-24 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 mx-auto mb-6 sm:mb-8 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 1 }}
          />
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked collection of premium products
          </p>
        </motion.div>

        {isLoading || retryLoading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} variants={itemVariants} className="space-y-4">
                <Skeleton className="h-60 sm:h-72 w-full rounded-xl" />
                <Skeleton className="h-3 sm:h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 sm:h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
              </motion.div>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <motion.div
                className="text-red-600 mb-4 sm:mb-6"
                animate={{ rotate: shouldReduceMotion ? 0 : [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <svg
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2 sm:mb-3">Something went wrong</h3>
              <p className="text-red-600 mb-4 sm:mb-6">{error}</p>
              <Button
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 font-semibold"
                disabled={retryLoading}
              >
                {retryLoading ? "Retrying..." : "Try Again"}
              </Button>
            </div>
          </motion.div>
        ) : memoizedProducts.length === 0 ? (
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <motion.div
                className="text-gray-500 mb-4 sm:mb-6"
                animate={{ y: shouldReduceMotion ? 0 : [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-3">No products found</h3>
              <p className="text-gray-500">Check back later for new arrivals</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {memoizedProducts.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MemoizedProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer Promo Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 py-12 sm:py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
          >
            <img
              src="https://images.unsplash.com/photo-1618375619187-8b2991f7893e?auto=format&fit=crop&w=1200&q=80"
              alt="Join Our Newsletter"
              className="w-full h-48 sm:h-64 lg:h-80 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/70 to-indigo-600/70 flex items-center justify-center">
              <div className="text-center text-white px-4 sm:px-6">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Stay Updated with Our Newsletter</h3>
                <p className="text-base sm:text-lg mb-4 sm:mb-6">Get exclusive deals and updates straight to your inbox</p>
                <Button
                  className="bg-white text-indigo-700 font-semibold hover:bg-gray-100"
                  size="lg"
                >
                  <ShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Subscribe Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;