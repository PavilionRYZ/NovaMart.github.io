import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllAddress, createAddress, selectAddress } from '../../../redux/slices/addressSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { MapPin, Plus, ArrowLeft, Home, CheckCircle2, Phone, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import Loading from '../../loading/Loading';

const AddressSelection = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { addresses, selectedAddress, isLoading, error, message } = useSelector((state) => state.address);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        mobileNo: '',
    });

    useEffect(() => {
        dispatch(getAllAddress());
    }, [dispatch]);

    const handleAddAddress = async () => {
        setFormError('');

        const requiredFields = ['street', 'city', 'state', 'country', 'zipCode', 'mobileNo'];
        const emptyFields = requiredFields.filter((field) => !newAddress[field].trim());

        if (emptyFields.length > 0) {
            const errorMessage = `Please fill in all fields: ${emptyFields.join(', ')}`;
            setFormError(errorMessage);
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Attempting to create address:', newAddress);
            const result = await dispatch(createAddress(newAddress)).unwrap();
            console.log('Address created successfully:', result);

            setShowAddForm(false);
            setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '', mobileNo: '' });
            setFormError('');

            dispatch(getAllAddress());

        } catch (err) {
            console.error('Failed to add address:', err);
            setFormError(err || 'Failed to add address. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setNewAddress(prev => ({ ...prev, [field]: value }));
        if (formError) {
            setFormError('');
        }
    };

    const handleProceed = () => {
        if (selectedAddress) {
            navigate('/cart/payment', { state: { shippingAddressId: selectedAddress._id } });
        }
    };

    console.log('Current addresses:', addresses);
    console.log('Selected address:', selectedAddress);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
    console.log('Message:', message);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            {isLoading && !showAddForm ? (
                <Loading />
            ) : (
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <Button
                            onClick={() => navigate("/cart")}
                            variant="ghost"
                            className="text-gray-700 hover:text-blue-600 hover:bg-white/50 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cart
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                            {/* Header */}
                            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white pb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <CardTitle className="flex items-center gap-3 text-3xl font-bold mb-2">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <MapPin className="h-7 w-7" />
                                        </div>
                                        Delivery Address
                                    </CardTitle>
                                    <p className="text-blue-100 text-sm ml-14">
                                        {showAddForm ? 'Add a new delivery address' : 'Select or add a delivery address'}
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8">
                                {/* Error State */}
                                {error && !showAddForm && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <MapPin className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-900 mb-1">Error Loading Addresses</p>
                                                <p className="text-red-700 text-sm mb-3">{error}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => dispatch(getAllAddress())}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        size="sm"
                                                    >
                                                        Retry
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowAddForm(true)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        size="sm"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add New Address
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Empty State */}
                                {addresses.length === 0 && !showAddForm && !error ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MapPin className="h-12 w-12 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Yet</h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            Add your first delivery address to get started with your order
                                        </p>
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Add Your First Address
                                        </Button>
                                    </motion.div>
                                ) : showAddForm ? (
                                    /* Add Address Form */
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Home className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Add New Address</h3>
                                        </div>

                                        {formError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4"
                                            >
                                                <p className="text-red-800 text-sm font-medium">{formError}</p>
                                            </motion.div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="street" className="text-gray-700 font-semibold mb-2 block">
                                                    Street Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="street"
                                                    value={newAddress.street}
                                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                                    placeholder="House/Flat No, Building Name, Street"
                                                    className={`h-12 rounded-lg ${formError.includes('street') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="city" className="text-gray-700 font-semibold mb-2 block">
                                                    City <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="city"
                                                    value={newAddress.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    placeholder="Enter city"
                                                    className={`h-12 rounded-lg ${formError.includes('city') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="state" className="text-gray-700 font-semibold mb-2 block">
                                                    State <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="state"
                                                    value={newAddress.state}
                                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                                    placeholder="Enter state"
                                                    className={`h-12 rounded-lg ${formError.includes('state') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="zipCode" className="text-gray-700 font-semibold mb-2 block">
                                                    Zip Code <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="zipCode"
                                                    value={newAddress.zipCode}
                                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                                    placeholder="Enter zip code"
                                                    className={`h-12 rounded-lg ${formError.includes('zipCode') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="country" className="text-gray-700 font-semibold mb-2 block">
                                                    Country <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="country"
                                                    value={newAddress.country}
                                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                                    placeholder="Enter country"
                                                    className={`h-12 rounded-lg ${formError.includes('country') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="mobileNo" className="text-gray-700 font-semibold mb-2 block">
                                                    Mobile Number <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="mobileNo"
                                                        type="tel"
                                                        value={newAddress.mobileNo}
                                                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                                        placeholder="+91-9876543210"
                                                        className={`h-12 pl-12 rounded-lg ${formError.includes('mobileNo') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddForm(false);
                                                    setFormError('');
                                                    setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '', mobileNo: '' });
                                                }}
                                                disabled={isSubmitting}
                                                className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-50 font-semibold"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddAddress}
                                                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                                        Save Address
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* Address List */
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Your Saved Addresses</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} available
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => setShowAddForm(true)}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                                size="sm"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add New
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {addresses.map((address, index) => (
                                                <motion.div
                                                    key={address._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${selectedAddress && selectedAddress._id === address._id
                                                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-4 ring-blue-100'
                                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                                        }`}
                                                    onClick={() => dispatch(selectAddress(address))}
                                                >
                                                    {/* Selected Badge */}
                                                    {selectedAddress && selectedAddress._id === address._id && (
                                                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Selected
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`p-2 rounded-lg ${selectedAddress && selectedAddress._id === address._id
                                                                ? 'bg-blue-600'
                                                                : 'bg-gray-100'
                                                            }`}>
                                                            <Home className={`h-5 w-5 ${selectedAddress && selectedAddress._id === address._id
                                                                    ? 'text-white'
                                                                    : 'text-gray-600'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1 pt-1">
                                                            <p className="font-bold text-gray-900 mb-2 leading-relaxed">
                                                                {address.street}
                                                            </p>
                                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                                {address.city}, {address.state} - {address.zipCode}
                                                            </p>
                                                            <p className="text-sm text-gray-700 mt-1">
                                                                {address.country}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                                                                <Phone className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {address.mobileNo}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Proceed Button */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="pt-6 border-t border-gray-200"
                                        >
                                            <Button
                                                onClick={handleProceed}
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!selectedAddress}
                                            >
                                                {selectedAddress ? (
                                                    <>
                                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                                        Proceed to Payment
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="h-5 w-5 mr-2" />
                                                        Select an Address to Continue
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {message && !showAddForm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mt-6"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <p className="text-green-800 font-medium">{message}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AddressSelection;
