import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAddress, createAddress, updateAddress, deleteAddress, clearAddressState } from '../../../redux/slices/addressSlice';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Skeleton } from '../../ui/skeleton';
import { MapPin, Plus, Edit, Trash2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Addresses = () => {
    const dispatch = useDispatch();
    const { addresses, isLoading, error, message } = useSelector((state) => state.address);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        mobileNo: '',
        isDefault: false,
    });
    const [editData, setEditData] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        dispatch(getAllAddress());
        return () => dispatch(clearAddressState());
    }, [dispatch]);

    const validateForm = (data) => {
        const errors = {};


        if (!data.street.trim()) errors.street = 'Street is required';
        if (!data.city.trim()) errors.city = 'City is required';
        if (!data.state.trim()) errors.state = 'State is required';
        if (!data.country.trim()) errors.country = 'Country is required';
        if (!data.zipCode.trim()) errors.zipCode = 'ZIP code is required';
        if (!data.mobileNo.trim()) errors.mobileNo = 'Mobile number is required';

        return errors;
    };


    const handleInputChange = (e, setData) => {
        const { name, value, type, checked } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };


    const handleCreate = () => {
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        dispatch(createAddress(formData)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                setFormData({
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    zipCode: '',
                    mobileNo: '',
                    isDefault: false,
                });
                setIsCreateOpen(false);
                setFormErrors({});
            }
        });
    };


    const handleEdit = (address) => {
        setEditData({
            id: address._id,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            zipCode: address.zipCode,
            mobileNo: address.mobileNo,
            isDefault: address.isDefault,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        const errors = validateForm(editData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        dispatch(updateAddress({ id: editData.id, addressData: editData })).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                setIsEditOpen(false);
                setEditData(null);
                setFormErrors({});
            }
        });
    };

    const handleDelete = () => {
        dispatch(deleteAddress({ id: deleteId })).then(() => {
            setDeleteId(null);
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Address List */}
                    <Card className="bg-white shadow-lg mb-6">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <MapPin className="h-6 w-6" />
                                My Addresses
                            </CardTitle>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Address
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
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
                            ) : addresses.length === 0 ? (
                                <p className="text-gray-600 text-center">No addresses found. Add one to get started!</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {addresses.map((address) => (
                                        <motion.div
                                            key={address._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border rounded-lg p-4 bg-gray-50 relative"
                                        >
                                            {address.isDefault && (
                                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                    Default
                                                </span>
                                            )}
                                            <p className="font-medium">{address.street}</p>
                                            <p>{address.city}, {address.state} {address.zipCode}</p>
                                            <p>{address.country}</p>
                                            <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                <Phone className="h-3 w-3" />
                                                {address.mobileNo}
                                            </p>
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(address)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteId(address._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Create Address Dialog */}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {error && !isEditOpen && !deleteId && (
                                    <div className="bg-red-100 text-red-800 p-3 rounded-md">{error}</div>
                                )}
                                <div>
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        className={formErrors.street ? 'border-red-500' : ''}
                                    />
                                    {formErrors.street && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        className={formErrors.city ? 'border-red-500' : ''}
                                    />
                                    {formErrors.city && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        className={formErrors.state ? 'border-red-500' : ''}
                                    />
                                    {formErrors.state && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        className={formErrors.country ? 'border-red-500' : ''}
                                    />
                                    {formErrors.country && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="zipCode">ZIP Code</Label>
                                    <Input
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        placeholder="Enter ZIP code"
                                        className={formErrors.zipCode ? 'border-red-500' : ''}
                                    />
                                    {formErrors.zipCode && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="mobileNo">Mobile Number</Label>
                                    <Input
                                        id="mobileNo"
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        placeholder="Enter mobile number"
                                        className={formErrors.mobileNo ? 'border-red-500' : ''}
                                    />
                                    {formErrors.mobileNo && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.mobileNo}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="isDefault"
                                        name="isDefault"
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => handleInputChange(e, setFormData)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isDefault">Set as default</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    Add Address
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Address Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Address</DialogTitle>
                            </DialogHeader>
                            {editData && (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {error && !isCreateOpen && !deleteId && (
                                        <div className="bg-red-100 text-red-800 p-3 rounded-md">{error}</div>
                                    )}
                                    <div>
                                        <Label htmlFor="editStreet">Street</Label>
                                        <Input
                                            id="editStreet"
                                            name="street"
                                            value={editData.street}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            className={formErrors.street ? 'border-red-500' : ''}
                                        />
                                        {formErrors.street && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="editCity">City</Label>
                                        <Input
                                            id="editCity"
                                            name="city"
                                            value={editData.city}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            className={formErrors.city ? 'border-red-500' : ''}
                                        />
                                        {formErrors.city && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="editState">State</Label>
                                        <Input
                                            id="editState"
                                            name="state"
                                            value={editData.state}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            className={formErrors.state ? 'border-red-500' : ''}
                                        />
                                        {formErrors.state && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="editCountry">Country</Label>
                                        <Input
                                            id="editCountry"
                                            name="country"
                                            value={editData.country}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            className={formErrors.country ? 'border-red-500' : ''}
                                        />
                                        {formErrors.country && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="editZipCode">ZIP Code</Label>
                                        <Input
                                            id="editZipCode"
                                            name="zipCode"
                                            value={editData.zipCode}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            placeholder="Enter ZIP code"
                                            className={formErrors.zipCode ? 'border-red-500' : ''}
                                        />
                                        {formErrors.zipCode && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="editMobileNo">Mobile Number</Label>
                                        <Input
                                            id="editMobileNo"
                                            name="mobileNo"
                                            value={editData.mobileNo}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            placeholder="Enter mobile number"
                                            className={formErrors.mobileNo ? 'border-red-500' : ''}
                                        />
                                        {formErrors.mobileNo && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.mobileNo}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="editIsDefault"
                                            name="isDefault"
                                            type="checkbox"
                                            checked={editData.isDefault}
                                            onChange={(e) => handleInputChange(e, setEditData)}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="editIsDefault">Set as default</Label>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to delete this address? This action cannot be undone.</p>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteId(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                >
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            </div>
        </div>
    );
};

export default Addresses;