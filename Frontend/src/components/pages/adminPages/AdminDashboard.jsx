import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Table, Button, Input, Select, Modal, Skeleton, Space } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SyncOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
    getAllUsers,
    changeUserRole,
    deleteUser,
    clearAdminState,
} from '../../../redux/slices/adminSlice';

const { Option } = Select;

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { users, pagination, isLoading, error, message } = useSelector((state) => state.admin);


    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            toast.error('Access denied. Admins only.', { position: 'top-right', autoClose: 3000 });
            navigate('/signin');
        }
    }, [isAuthenticated, user, navigate]);


    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        role: undefined,
        isActive: undefined,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [roleModal, setRoleModal] = useState({
        open: false,
        userId: null,
        email: '',
        currentRole: '',
        newRole: '',
    });
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        userId: null,
        email: '',
    });
    useEffect(() => {
        console.log('Dispatching getAllUsers with filters:', filters);
        if (isAuthenticated && user?.role === 'admin') {
            dispatch(getAllUsers(filters));
        }
    }, [dispatch, filters, isAuthenticated, user]);

    useEffect(() => {
        if (message && !isLoading) {
            toast.success(message, { position: 'top-right', autoClose: 3000 });
            // dispatch(clearAdminState());
        }
        if (error && !isLoading) {
            toast.error(error, { position: 'top-right', autoClose: 3000 });
            // dispatch(clearAdminState());
        }
    }, [message, error, isLoading, dispatch]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === '' ? undefined : value,
            page: 1,
        }));
    };

    const handleSortToggle = (field) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    const openRoleModal = (user) => {
        setRoleModal({
            open: true,
            userId: user._id,
            email: user.email,
            currentRole: user.role,
            newRole: user.role,
        });
    };

    const handleRoleChange = () => {
        if (roleModal.newRole === roleModal.currentRole) {
            toast.error('New role must be different', { position: 'top-right' });
            return;
        }
        dispatch(
            changeUserRole({
                id: roleModal.userId,
                newRole: roleModal.newRole,
            })
        );
        setRoleModal((prev) => ({ ...prev, open: false }));
    };

    const openDeleteModal = (user) => {
        setDeleteModal({
            open: true,
            userId: user._id,
            email: user.email,
        });
    };

    const handleDeleteUser = () => {
        dispatch(deleteUser({ id: deleteModal.userId }));
        setDeleteModal((prev) => ({ ...prev, open: false }));
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const columns = [
        {
            title: (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSortToggle('email')}
                >
                    Email
                    {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </div>
            ),
            dataIndex: 'email',
            key: 'email',
            render: (text) => <span className="text-sm">{text}</span>,
        },
        {
            title: (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSortToggle('firstName')}
                >
                    First Name
                    {filters.sortBy === 'firstName' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </div>
            ),
            dataIndex: 'firstName',
            key: 'firstName',
            responsive: ['sm'],
            render: (text) => <span className="text-sm">{text || '-'}</span>,
        },
        {
            title: (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSortToggle('lastName')}
                >
                    Last Name
                    {filters.sortBy === 'lastName' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </div>
            ),
            dataIndex: 'lastName',
            key: 'lastName',
            responsive: ['sm'],
            render: (text) => <span className="text-sm">{text || '-'}</span>,
        },
        {
            title: (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSortToggle('role')}
                >
                    Role
                    {filters.sortBy === 'role' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </div>
            ),
            dataIndex: 'role',
            key: 'role',
            render: (text) => <span className="text-sm capitalize">{text}</span>,
        },
        // {
        //     title: (
        //         <div
        //             className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
        //             onClick={() => handleSortToggle('isActive')}
        //         >
        //             Status
        //             {filters.sortBy === 'isActive' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
        //         </div>
        //     ),
        //     dataIndex: 'isActive',
        //     key: 'isActive',
        //     render: (isActive) => (
        //         <span
        //             className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        //                 }`}
        //         >
        //             {isActive ? 'Active' : 'Inactive'}
        //         </span>
        //     ),
        // },
        {
            title: (
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSortToggle('createdAt')}
                >
                    Created At
                    {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </div>
            ),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => (
                <span className="text-sm">{new Date(text).toLocaleDateString()}</span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openRoleModal(record)}
                        className="text-blue-600 hover:text-blue-800"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => openDeleteModal(record)}
                        className="text-red-600 hover:text-red-800"
                    />
                </Space>
            ),
        },
    ];

    const handleRefresh = () => {
        dispatch(getAllUsers(filters));
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            Manage users, roles, and associated data
                        </p>
                    </div>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Refresh
                    </Button>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center"
                >
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search by email or name..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-full"
                        />
                    </div>
                    <Select
                        value={filters.role}
                        onChange={(value) => handleFilterChange('role', value)}
                        placeholder="Filter by role"
                        className="w-full sm:w-40"
                        allowClear
                    >
                        <Option value="">All Roles</Option>
                        <Option value="user">User</Option>
                        <Option value="seller">Seller</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                    <Select
                        value={filters.isActive}
                        onChange={(value) => handleFilterChange('isActive', value)}
                        placeholder="Filter by status"
                        className="w-full sm:w-40"
                        allowClear
                    >
                        <Option value="">All Statuses</Option>
                        <Option value="true">Active</Option>
                        <Option value="false">Inactive</Option>
                    </Select>
                </motion.div>

                {/* Users Table */}
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="_id"
                        pagination={false}
                        loading={{
                            spinning: isLoading,
                            indicator: <Skeleton active paragraph={{ rows: filters.limit }} />,
                        }}
                        locale={{ emptyText: 'No users found. Click "Refresh" to try again or add users.' }}
                        scroll={{ x: 'max-content' }}
                    />
                </motion.div>

                {/* Pagination */}
                {pagination && (
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between mt-6"
                    >
                        <p className="text-sm text-gray-600">
                            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                            {Math.min(
                                pagination.currentPage * pagination.limit,
                                pagination.totalUsers
                            )}{' '}
                            of {pagination.totalUsers} users
                        </p>
                        <Space>
                            <Button
                                icon={<LeftOutlined />}
                                disabled={pagination.currentPage === 1}
                                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                            />
                            <Button
                                icon={<RightOutlined />}
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                            />
                        </Space>
                    </motion.div>
                )}

                {/* Role Change Modal */}
                <Modal
                    title="Change User Role"
                    open={roleModal.open}
                    onCancel={() => setRoleModal((prev) => ({ ...prev, open: false }))}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setRoleModal((prev) => ({ ...prev, open: false }))}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleRoleChange}
                            loading={isLoading}
                        >
                            Update Role
                        </Button>,
                    ]}
                >
                    <p>Update the role for {roleModal.email}</p>
                    <Select
                        value={roleModal.newRole}
                        onChange={(value) => setRoleModal((prev) => ({ ...prev, newRole: value }))}
                        className="w-full mt-4"
                    >
                        <Option value="user">User</Option>
                        <Option value="seller">Seller</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    title="Delete User"
                    open={deleteModal.open}
                    onCancel={() => setDeleteModal((prev) => ({ ...prev, open: false }))}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setDeleteModal((prev) => ({ ...prev, open: false }))}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            danger
                            onClick={handleDeleteUser}
                            loading={isLoading}
                        >
                            Delete User
                        </Button>,
                    ]}
                >
                    <div className="flex items-start gap-2 text-red-600">
                        <ExclamationCircleOutlined className="mt-1" />
                        <p>
                            Are you sure you want to delete {deleteModal.email}? This will also
                            remove their cart, addresses, payments, and deactivate their products
                            if they are a seller. This action cannot be undone.
                        </p>
                    </div>
                </Modal>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;