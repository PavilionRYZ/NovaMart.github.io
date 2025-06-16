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
    // const { cart } = useSelector((state) => state.cart);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
    });

    useEffect(() => {
        dispatch(getAllAddress());
    }, [dispatch]);

    const handleAddAddress = () => {
        dispatch(createAddress(newAddress)).then(() => {
            setShowAddForm(false);
            setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '' });
        });
    };

    const handleProceed = () => {
        if (selectedAddress) {
            navigate('/cart/payment', { state: { shippingAddressId: selectedAddress._id } });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (<Loading />) : (
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
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{error}</p>
                                        <Button
                                            onClick={() => dispatch(getAllAddress())}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : addresses.length === 0 && !showAddForm ? (
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-4">No addresses found.</p>
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add New Address
                                        </Button>
                                    </div>
                                ) : showAddForm ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Add New Address</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="street">Street</Label>
                                                <Input
                                                    id="street"
                                                    value={newAddress.street}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, street: e.target.value })
                                                    }
                                                    placeholder="Enter street"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={newAddress.city}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, city: e.target.value })
                                                    }
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    value={newAddress.state}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, state: e.target.value })
                                                    }
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={newAddress.country}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, country: e.target.value })
                                                    }
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="zipCode">Zip Code</Label>
                                                <Input
                                                    id="zipCode"
                                                    value={newAddress.zipCode}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, zipCode: e.target.value })
                                                    }
                                                    placeholder="Enter zip code"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAddForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddAddress}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Save Address
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((address) => (
                                            <motion.div
                                                key={address._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`border rounded-lg p-4 bg-gray-50 cursor-pointer ${selectedAddress && selectedAddress._id === address._id
                                                    ? 'border-blue-600'
                                                    : ''
                                                    }`}
                                                onClick={() => dispatch(selectAddress(address))}
                                            >
                                                <p>{address.street}</p>
                                                <p>
                                                    {address.city}, {address.state} {address.zipCode}
                                                </p>
                                                <p>{address.country}</p>
                                            </motion.div>
                                        ))}
                                        <div className="flex justify-between">
                                            <Button
                                                onClick={() => setShowAddForm(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add New Address
                                            </Button>
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