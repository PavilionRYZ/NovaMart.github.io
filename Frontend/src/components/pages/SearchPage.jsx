import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, clearProductState } from '../../redux/slices/productSlice';
import ProductCard from '../layout/ProductCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Search } from 'lucide-react';
import { Badge } from '../ui/badge';

const SearchPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { searchResults, isLoading, error, pagination } = useSelector((state) => state.product);

    // State for filters
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        category: searchParams.get('category') || 'all',
        minPrice: searchParams.get('price[gte]') || '',
        maxPrice: searchParams.get('price[lte]') || '',
        page: Number(searchParams.get('page')) || 1,
    });

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Clothing', label: 'Clothing' },
        { value: 'Books', label: 'Books' },
        { value: 'Home', label: 'Home & Garden' },
        { value: 'Kitchen', label: 'Kitchen & Dining' },
        { value: 'Beauty', label: 'Beauty' },
        { value: 'Toys', label: 'Toys & Games' },
        { value: 'Health', label: 'Health & Wellness' },
        { value: 'Food', label: 'Food & Grocery' },
        { value: 'Furniture', label: 'Furniture & Home Decor' },
    ];

    useEffect(() => {
        const queryFilters = {
            keyword: filters.keyword || undefined,
            category: filters.category !== 'all' ? filters.category : undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            page: filters.page,
            limit: 12,
        };

        dispatch(getProducts(queryFilters));


        const params = new URLSearchParams();
        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.category !== 'all') params.set('category', filters.category);
        if (filters.minPrice) params.set('price[gte]', filters.minPrice);
        if (filters.maxPrice) params.set('price[lte]', filters.maxPrice);
        if (filters.page > 1) params.set('page', filters.page);
        setSearchParams(params, { replace: true });

        return () => {
            dispatch(clearProductState());
        };
    }, [filters, dispatch, setSearchParams]);

    const handleFilterChange = (name, value) => {
        if (name === 'minPrice' || name === 'maxPrice') {
            if (value && Number(value) < 0) return;
            if (name === 'maxPrice' && filters.minPrice && Number(value) < Number(filters.minPrice)) return;
            if (name === 'minPrice' && filters.maxPrice && Number(value) > Number(filters.maxPrice)) return;
        }
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1,
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
        setFilters(prev => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            keyword: prev.keyword.trim(),
            page: 1,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: '',
            category: 'all',
            minPrice: '',
            maxPrice: '',
            page: 1,
        });
    };

    const isBestSeller = (product) => (product.reviews?.length || 0) > 50;

    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen mx-auto flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Refine By</h2>
                    {/* Category */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                        <Select
                            value={filters.category}
                            onValueChange={(value) => handleFilterChange('category', value)}
                        >
                            <SelectTrigger className="rounded-md">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Price Range */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="rounded-md"
                                min="0"
                            />
                            <span className="text-gray-500">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="rounded-md"
                                min="0"
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        className="w-full rounded-md hover:bg-gray-50"
                    >
                        Clear All Filters
                    </Button>
                </div>

                {/* Results Section */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="mb-6">
                        <div className="relative max-w-2xl">
                            <Input
                                type="text"
                                placeholder="Search products by name..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                className="pr-10 h-12 rounded-full shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <Search className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                            </button>
                        </div>
                    </form>

                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {filters.keyword ? `Results for "${filters.keyword}"` : 'Products'}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {pagination?.total || 0} results
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} className="h-96 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button
                                onClick={() => dispatch(getProducts({ ...filters }))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Retry
                            </Button>
                        </div>
                    ) : safeSearchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No products found.</p>
                            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                                <a href="/">Shop Now</a>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {safeSearchResults.map((product) => (
                                    <div key={product._id} className="relative">
                                        {isBestSeller(product) && (
                                            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                                                Best Seller
                                            </Badge>
                                        )}
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination?.totalPages > 1 && (
                                <div className="mt-8 flex justify-center gap-2 flex-wrap">
                                    <Button
                                        disabled={pagination?.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        variant="outline"
                                        className="px-4 py-2 disabled:opacity-50"
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            variant={pagination?.page === page ? 'default' : 'outline'}
                                            className={`px-4 py-2 ${pagination?.page === page
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        disabled={pagination?.page === pagination?.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        variant="outline"
                                        className="px-4 py-2 disabled:opacity-50"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;