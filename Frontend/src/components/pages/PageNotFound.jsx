import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const svgVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
    },
};

const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 1.5, ease: 'easeInOut' },
    },
};

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
};

const PageNotFound = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-3xl w-full text-center space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* SVG Illustration */}
                <motion.div variants={svgVariants}>
                    <svg
                        className="mx-auto h-64 w-64 text-blue-600"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="4"
                            variants={pathVariants}
                        />
                        <motion.path
                            d="M70 80 L90 100 L70 120"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            variants={pathVariants}
                        />
                        <motion.path
                            d="M130 80 L110 100 L130 120"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            variants={pathVariants}
                        />
                        <motion.text
                            x="100"
                            y="160"
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="24"
                            fontWeight="bold"
                            variants={itemVariants}
                        >
                            404
                        </motion.text>
                    </svg>
                </motion.div>

                {/* Error Message */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-600">
                        Oops! It looks like you're lost in space. The page you're looking for doesn't exist.
                    </p>
                </motion.div>

                {/* Back to Home Button */}
                <motion.div variants={itemVariants}>
                    <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <Link to="/">Back to Home</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PageNotFound;