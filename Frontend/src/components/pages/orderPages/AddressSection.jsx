import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllAddress, createAddress, selectAddress } from '../../../redux/slices/addressSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { MapPin, Plus, ArrowLeft } from 'lucide-react';
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
        // Clear previous errors
        setFormError('');

        // Validate required fields
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

            // Reset form and close it
            setShowAddForm(false);
            setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '', mobileNo: '' });
            setFormError('');

            // Re-fetch addresses to ensure UI updates
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
        // Clear form error when user starts typing
        if (formError) {
            setFormError('');
        }
    };

    const handleProceed = () => {
        if (selectedAddress) {
            navigate('/cart/payment', { state: { shippingAddressId: selectedAddress._id } });
        }
    };

    // Debug: Log current state
    console.log('Current addresses:', addresses);
    console.log('Selected address:', selectedAddress);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
    console.log('Message:', message);

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {isLoading && !showAddForm ? (
                <Loading />
            ) : (
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-white shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <MapPin className="h-6 w-6" />
                                        Select Delivery Address
                                    </CardTitle>
                                    <Button asChild variant="ghost" className="text-white">
                                        <a href="/cart">
                                            <ArrowLeft className="h-5 w-5 mr-1" />
                                            Back to Cart
                                        </a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {error && !showAddForm && (
                                    <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                                        <p className="font-semibold">Error:</p>
                                        <p>{error}</p>
                                        <div className="mt-2">
                                            <Button
                                                onClick={() => dispatch(getAllAddress())}
                                                className="bg-blue-600 hover:bg-blue-700 mr-2"
                                                size="sm"
                                            >
                                                Retry
                                            </Button>
                                            <Button
                                                onClick={() => setShowAddForm(true)}
                                                className="bg-green-600 hover:bg-green-700"
                                                size="sm"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add New Address
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {addresses.length === 0 && !showAddForm && !error ? (
                                    <div className="text-center py-8">
                                        <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 mb-4 text-lg">No addresses found.</p>
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Your First Address
                                        </Button>
                                    </div>
                                ) : showAddForm ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Add New Address</h3>

                                        {formError && (
                                            <div className="bg-red-100 text-red-800 p-3 rounded-md">
                                                {formError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="street">Street Address *</Label>
                                                <Input
                                                    id="street"
                                                    value={newAddress.street}
                                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                                    placeholder="Enter street address"
                                                    className={formError.includes('street') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City *</Label>
                                                <Input
                                                    id="city"
                                                    value={newAddress.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    placeholder="Enter city"
                                                    className={formError.includes('city') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State *</Label>
                                                <Input
                                                    id="state"
                                                    value={newAddress.state}
                                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                                    placeholder="Enter state"
                                                    className={formError.includes('state') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">Country *</Label>
                                                <Input
                                                    id="country"
                                                    value={newAddress.country}
                                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                                    placeholder="Enter country"
                                                    className={formError.includes('country') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="zipCode">Zip Code *</Label>
                                                <Input
                                                    id="zipCode"
                                                    value={newAddress.zipCode}
                                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                                    placeholder="Enter zip code"
                                                    className={formError.includes('zipCode') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="mobileNo">Mobile Number *</Label>
                                                <Input
                                                    id="mobileNo"
                                                    type="tel"
                                                    value={newAddress.mobileNo}
                                                    onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                                    placeholder="Enter mobile number (e.g., +91-9876543210)"
                                                    className={formError.includes('mobileNo') ? 'border-red-500' : ''}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddForm(false);
                                                    setFormError('');
                                                    setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '', mobileNo: '' });
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddAddress}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Address'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Your Addresses</h3>
                                            <Button
                                                onClick={() => setShowAddForm(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                size="sm"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add New
                                            </Button>
                                        </div>

                                        {addresses.map((address) => (
                                            <motion.div
                                                key={address._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddress && selectedAddress._id === address._id
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                onClick={() => dispatch(selectAddress(address))}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium">{address.street}</p>
                                                        <p className="text-gray-600">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </p>
                                                        <p className="text-gray-600">{address.country}</p>
                                                        <p className="text-gray-600 font-medium">📱 {address.mobileNo}</p>
                                                    </div>
                                                    {selectedAddress && selectedAddress._id === address._id && (
                                                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                                            Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                onClick={handleProceed}
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={!selectedAddress}
                                            >
                                                Proceed to Payment
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {message && !showAddForm && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-green-100 text-green-800 p-3 rounded-md mt-4"
                                    >
                                        {message}
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