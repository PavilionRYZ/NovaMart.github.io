import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "../ui/sheet";
import { Menu, Search, ShoppingCart, User, LogOut, UserCircle, Package, Settings } from "lucide-react";
import { MdAdminPanelSettings } from "react-icons/md";
import { MdSell } from "react-icons/md";
import { clearAuthState, logout } from "../../redux/slices/authSlice";
import { getCart } from "../../redux/slices/cartSlice";
// import { getProducts } from "../../redux/slices/productSlice";
import Loading from "../loading/Loading";
import { clearAddressState } from "../../redux/slices/addressSlice";
import { clearOrderState } from "../../redux/slices/orderSlice";
import { clearAdminState } from "../../redux/slices/adminSlice";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading: authLoading } = useSelector((state) => state.auth);
    const { cart, isLoading: cartLoading } = useSelector((state) => state.cart);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Calculate cart item count
    const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    // Fetch cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated && !cart) {
            dispatch(getCart());
        }
    }, [isAuthenticated, dispatch, cart]);

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            dispatch(clearAuthState());
            dispatch(clearAddressState());
            dispatch(clearOrderState());
            dispatch(clearAdminState());
            setIsMobileMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Search", path: "/search" },
        { name: 'About Us', path: '/about' },
    ];

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-18">
                    {/* Logo */}
                    <div className="flex-shrink-0 group">
                        <Link
                            to="/"
                            className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                        >
                            NovaMart
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* Navigation Links */}
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "text-blue-600 bg-blue-50 shadow-sm"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>

                        {/* Cart Icon */}
                        <Link to="/cart" className="relative group">
                            <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                {cartLoading ? (
                                    <div className="h-6 w-6 flex items-center justify-center">
                                        <Loading size="xs" color="gray-600" />
                                    </div>
                                ) : (
                                    <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                                )}
                                {cartItemCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                                    >
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </Badge>
                                )}
                            </div>
                        </Link>

                        {/* User Authentication */}
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center space-x-2 h-10 px-3 rounded-full hover:bg-gray-100 transition-all duration-200"
                                        disabled={authLoading}
                                    >
                                        {authLoading ? (
                                            <Loading size="xs" color="gray-600" />
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">
                                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-700">
                                                    {user?.firstName || "User"}
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2">
                                    <div className="px-3 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="w-full flex items-center">
                                            <UserCircle className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/user-orders" className="w-full flex items-center">
                                            <Package className="mr-2 h-4 w-4" />
                                            Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    {user?.role === "admin" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin-dashboard" className="w-full flex items-center">
                                                    <MdAdminPanelSettings className="mr-2 h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/seller-dashboard" className="w-full flex items-center">
                                                    <MdSell className="mr-2 h-4 w-4" />
                                                    Seller Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {user?.role === "seller" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/seller-dashboard" className="w-full flex items-center">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Seller Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/signin">
                                    <Button variant="ghost" className="rounded-full hover:bg-gray-100">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="lg:hidden flex items-center space-x-3">
                        {/* Mobile Cart */}
                        <Link to="/cart" className="relative">
                            <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                {cartLoading ? (
                                    <div className="h-6 w-6 flex items-center justify-center">
                                        <Loading size="xs" color="gray-600" />
                                    </div>
                                ) : (
                                    <ShoppingCart className="h-6 w-6 text-gray-700" />
                                )}
                                {cartItemCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                                    >
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </Badge>
                                )}
                            </div>
                        </Link>

                        {/* Mobile Menu Trigger */}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                                <div className="flex flex-col h-full">
                                    {/* Mobile Header */}
                                    <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                                        <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                                        {isAuthenticated && user && (
                                            <div className="mt-3 flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <span className="text-white font-semibold">
                                                        {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Content */}
                                    <div className="flex-1 p-6 space-y-4">
                                        {/* Mobile Navigation */}
                                        <div className="space-y-2">
                                            {navItems.map((item) => (
                                                <NavLink
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={({ isActive }) =>
                                                        `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                                            ? "text-blue-600 bg-blue-50"
                                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                                        }`
                                                    }
                                                >
                                                    {item.name}
                                                </NavLink>
                                            ))}
                                        </div>

                                        {/* Mobile User Menu */}
                                        {isAuthenticated ? (
                                            <div className="space-y-2 pt-4 border-t">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    <UserCircle className="mr-3 h-5 w-5" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/user-orders"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Package className="mr-3 h-5 w-5" />
                                                    Orders
                                                </Link>
                                                {user?.role === "admin" && (
                                                    <>
                                                        <Link
                                                            to="/admin-dashboard"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <MdAdminPanelSettings className="mr-3 h-5 w-5" />
                                                            Admin Dashboard
                                                        </Link>
                                                        <Link
                                                            to="/seller-dashboard"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <MdSell className="mr-3 h-5 w-5" />
                                                            Seller Dashboard
                                                        </Link>
                                                    </>
                                                )}
                                                {user?.role === "seller" && (
                                                    <Link
                                                        to="/seller-dashboard"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <MdSell className="mr-3 h-5 w-5" />
                                                        Seller Dashboard
                                                    </Link>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 pt-4 border-t">
                                                <Link
                                                    to="/signin"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                                >
                                                    Sign In
                                                </Link>
                                                <Link
                                                    to="/signup"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="block px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-center"
                                                >
                                                    Sign Up
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Footer */}
                                    {isAuthenticated && (
                                        <div className="p-6 border-t bg-gray-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="mr-2 h-5 w-5" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;