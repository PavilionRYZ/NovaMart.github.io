import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getSingleProduct, clearProductState } from "../../../redux/slices/productSlice";
import { getProductReviews, createReview, toggleLikeReview, markReviewHelpful, replyReview, clearReviewState } from "../../../redux/slices/reviewSlice";
import { addItemToCart } from "../../../redux/slices/cartSlice";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import { Star, ShoppingCart, Heart, MessageCircle, ThumbsUp, Plus, Minus, Send, Loader2, X } from "lucide-react";
import { storage } from "../../../storage/fireBase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { product, isLoading: productLoading, error: productError } = useSelector((state) => state.product);
    const { reviews, isLoading: reviewsLoading, error: reviewsError } = useSelector((state) => state.review);
    const { user, isAuthenticated } = useSelector((state) => state.auth || { user: null, isAuthenticated: false });

    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [newReview, setNewReview] = useState({ rating: 0, comment: "", images: [] });
    const [replyText, setReplyText] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        dispatch(getSingleProduct(id))
            .unwrap()
            .catch((err) => toast.error(err || "Failed to load product"));
        dispatch(getProductReviews({ id }))
            .unwrap()
            .catch((err) => toast.error(err || "Failed to load reviews"));

        return () => {
            dispatch(clearProductState());
            dispatch(clearReviewState());
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const handleaddItemToCart = () => {
        if (!product) return;
        if (quantity > product.stock) {
            toast.error("Quantity exceeds available stock");
            return;
        }
        dispatch(addItemToCart({ product, quantity }));
        setQuantity(1);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error("You can upload a maximum of 5 images.");
            return;
        }

        const validFiles = files.filter((file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                toast.error(`${file.name} is not an image file.`);
            }
            const isUnderSizeLimit = file.size <= 2 * 1024 * 1024;
            if (!isUnderSizeLimit) {
                toast.error(`${file.name} exceeds the 2MB size limit.`);
            }
            return isImage && isUnderSizeLimit;
        });

        setImageFiles((prev) => [...prev, ...validFiles]);
        const previews = validFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    };

    const handleRemoveImage = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => {
            const url = prev[index];
            URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const uploadImagesToFirebase = async () => {
        if (imageFiles.length === 0) return [];

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const uuid = uuidv4(); 
                const extension = file.name.split(".").pop();
                const fileName = `productReviews/${id}_${user?._id}_${uuid}.${extension}`; 

                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                uploadedUrls.push(downloadURL);
            }
            return uploadedUrls;
        } catch (error) {
            console.error("Error uploading images to Firebase:", error);
            throw new Error("Failed to upload images. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please log in to submit a review");
            return;
        }
        if (newReview.rating < 1 || newReview.rating > 5) {
            toast.error("Rating must be between 1 and 5");
            return;
        }
        if (!newReview.comment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        try {
            const imageUrls = await uploadImagesToFirebase();
            const reviewData = { ...newReview, images: imageUrls };

            await dispatch(createReview({ id, reviewData })).unwrap();
            setNewReview({ rating: 0, comment: "", images: [] });
            setImageFiles([]);
            setImagePreviews([]);
            toast.success("Review submitted successfully");
            dispatch(getProductReviews({ id }))
                .unwrap()
                .catch((err) => toast.error(err || "Failed to reload reviews"));
        } catch (error) {
            toast.error(error.message || "Failed to submit review");
        }
    };

    const handleLikeReview = (reviewId) => {
        if (!isAuthenticated) {
            toast.error("Please log in to like a review");
            return;
        }
        dispatch(toggleLikeReview({ id: reviewId }))
            .unwrap()
            .catch((err) => toast.error(err || "Failed to toggle like"));
    };

    const handleMarkHelpful = (reviewId) => {
        if (!isAuthenticated) {
            toast.error("Please log in to mark a review as helpful");
            return;
        }
        dispatch(markReviewHelpful({ id: reviewId }))
            .unwrap()
            .catch((err) => toast.error(err || "Failed to mark as helpful"));
    };

    const handleReplySubmit = (reviewId) => {
        if (!isAuthenticated) {
            toast.error("Please log in to reply to a review");
            return;
        }
        if (!replyText) {
            toast.error("Reply cannot be empty");
            return;
        }
        dispatch(replyReview({ id: reviewId, comment: replyText }))
            .unwrap()
            .then(() => {
                setReplyText("");
                toast.success("Reply added successfully");
            })
            .catch((err) => toast.error(err || "Failed to add reply"));
    };

    if (productLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4 rounded-lg" />
                        <Skeleton className="h-6 w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-5/6 rounded-lg" />
                        <Skeleton className="h-12 w-40 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 text-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-12 max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-red-800 mb-3">Error</h3>
                    <p className="text-red-600">{productError || "Product not found"}</p>
                </div>
            </div>
        );
    }

    const discountedPrice =
        product.discount > 0
            ? (product.price * (1 - product.discount / 100)).toFixed(2)
            : product.price;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-96 object-cover rounded-lg mb-4"
                            />
                            <div className="flex space-x-2 overflow-x-auto">
                                {product.images.map((img, index) => (
                                    <motion.img
                                        key={index}
                                        src={img}
                                        alt={`${product.name}-${index}`}
                                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === img ? "border-blue-500" : "border-transparent"}`}
                                        onClick={() => setSelectedImage(img)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                        <h1 className="text-4xl font-black text-gray-900">{product.name}</h1>
                        <div className="flex items-center space-x-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ${discountedPrice}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-xl text-gray-500 line-through">
                                    ${product.price.toFixed(2)}
                                </span>
                            )}
                            {product.discount > 0 && (
                                <span className="bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.round(product.ratings || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                                ({product.reviews?.length || 0} reviews)
                            </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold">Category:</span> {product.category}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Brand:</span> {product.brand || "N/A"}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Stock:</span>{" "}
                                {product.stock > 0 ? (
                                    <span className="text-green-600">{product.stock} in stock</span>
                                ) : (
                                    <span className="text-red-600">Out of stock</span>
                                )}
                            </p>
                            {product.seller && (
                                <p className="text-gray-700">
                                    <span className="font-semibold">Sold by:</span>{" "}
                                    <Link
                                        to={`/seller/${product.seller._id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {product.seller.firstName} {product.seller.lastName}
                                    </Link>
                                </p>
                            )}
                        </div>
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Specifications
                                </h3>
                                <ul className="list-disc list-inside text-gray-600">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <li key={key}>
                                            <span className="font-medium">{key}:</span> {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center border rounded-lg">
                                <motion.button
                                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    className="p-2 text-gray-600 hover:text-gray-900"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Minus className="h-5 w-5" />
                                </motion.button>
                                <span className="px-4 py-2 text-gray-900">{quantity}</span>
                                <motion.button
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    className="p-2 text-gray-600 hover:text-gray-900"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="h-5 w-5" />
                                </motion.button>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={handleaddItemToCart}
                                    disabled={product.stock === 0}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="mt-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-3xl font-black text-gray-900 mb-8">
                        Customer Reviews
                    </h2>

                    {isAuthenticated && (
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                                Write a Review
                            </h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Rating (1-5)
                                    </label>
                                    <div className="flex space-x-2">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.button
                                                key={i}
                                                type="button"
                                                onClick={() => setNewReview((prev) => ({ ...prev, rating: i + 1 }))}
                                                className={`p-1 ${i < newReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Star className="h-8 w-8 fill-current" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Comment
                                    </label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) =>
                                            setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                                        }
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                        rows="5"
                                        placeholder="Share your experience with this product..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Add Images (Optional, max 5, 5MB each)
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {imagePreviews.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index}`}
                                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center -mt-2 -mr-2 hover:bg-red-600"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Submit Review"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>
                    )}

                    {reviewsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : reviewsError ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-600">{reviewsError}</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <motion.div
                                    key={review._id}
                                    variants={itemVariants}
                                    className="bg-white rounded-2xl shadow-lg p-8"
                                >
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={review.user?.avatar || "https://via.placeholder.com/40"}
                                            alt={review.user?.firstName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating
                                                                    ? "text-yellow-400 fill-current"
                                                                    : "text-gray-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="text-gray-700 mt-2">{review.comment}</p>
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex space-x-2 mt-2">
                                                    {review.images.map((img, index) => (
                                                        <img
                                                            key={index}
                                                            src={img}
                                                            alt={`Review image ${index}`}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-4 mt-4">
                                                <motion.button
                                                    onClick={() => handleLikeReview(review._id)}
                                                    className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Heart
                                                        className={`h-5 w-5 ${review.likes.includes(user?._id)
                                                            ? "text-red-500 fill-current"
                                                            : ""
                                                            }`}
                                                    />
                                                    <span>{review.likes.length}</span>
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleMarkHelpful(review._id)}
                                                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <ThumbsUp className="h-5 w-5" />
                                                    <span>{review.helpful} Helpful</span>
                                                </motion.button>
                                            </div>
                                            {review.replies && review.replies.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {review.replies.map((reply, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-50 rounded-lg p-3 flex items-start space-x-3"
                                                        >
                                                            <img
                                                                src={reply.user?.avatar || "https://via.placeholder.com/30"}
                                                                alt={reply.user?.firstName}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {reply.user?.firstName} {reply.user?.lastName}{" "}
                                                                    <span className="text-sm text-gray-500">
                                                                        ({reply.user?.role})
                                                                    </span>
                                                                </p>
                                                                <p className="text-gray-700">{reply.comment}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {(user?.role === "seller" || user?.role === "admin") && (
                                                <div className="mt-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="text"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Add a reply..."
                                                        />
                                                        <motion.button
                                                            onClick={() => handleReplySubmit(review._id)}
                                                            className="p-2 bg-blue-600 text-white rounded-lg"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Send className="h-5 w-5" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetails;