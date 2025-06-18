import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { getSellerProducts, deleteProduct, clearProductState } from "../../../redux/slices/productSlice";
import { Card, Table, Button, Modal, Pagination, Typography, Space, Tag, Image, Tooltip, Empty, Row, Col, Statistic } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, ShopOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, isLoading, error, message, pagination } = useSelector((state) => state.product);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: "" });
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);

  useEffect(() => {
    dispatch(getSellerProducts({ page: currentPage, limit: pagination.limit }));
    return () => dispatch(clearProductState());
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(deleteDialog.productId)).unwrap();
      setDeleteDialog({ open: false, productId: null, productName: "" });
    } catch (err) {
      toast.error(err);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock', icon: <WarningOutlined /> };
    if (stock < 10) return { color: 'orange', text: 'Low Stock', icon: <WarningOutlined /> };
    return { color: 'green', text: 'In Stock', icon: <CheckCircleOutlined /> };
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      width: '25%',
      render: (name, record) => (
        <Space>
          <Image
            src={record.images?.[0] || '/placeholder-image.png'}
            alt={name}
            width={50}
            height={50}
            style={{
              borderRadius: '8px',
              objectFit: 'cover',
              border: '2px solid rgba(102, 126, 234, 0.1)'
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
          <div>
            <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.brand || 'No Brand'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: '15%',
      render: (price, record) => (
        <div>
          <Text strong style={{ fontSize: '18px', color: '#667eea' }}>
            ${price?.toFixed(2)}
          </Text>
          {record.discount > 0 && (
            <div>
              <Tag color="red" style={{ fontSize: '10px' }}>
                {record.discount}% OFF
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: '15%',
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <Space>
            <Text strong style={{ fontSize: '16px' }}>{stock}</Text>
            <Tag
              color={status.color}
              icon={status.icon}
              style={{ fontSize: '11px' }}
            >
              {status.text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: '15%',
      render: (category) => (
        <Tag
          color="blue"
          style={{
            borderRadius: '12px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: '12%',
      render: (isActive) => (
        <Tag
          color={isActive ? 'green' : 'red'}
          icon={isActive ? <CheckCircleOutlined /> : <WarningOutlined />}
          style={{
            borderRadius: '12px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: '500'
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: '18%',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="ghost"
                icon={<EyeOutlined />}
                size="small"
                style={{
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  color: '#667eea',
                  borderRadius: '8px'
                }}
                onClick={() => {/* Add view functionality */ }}
              />
            </motion.div>
          </Tooltip>
          <Tooltip title="Edit Product">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px'
                }}
                onClick={() => navigate(`/seller-dashboard/products/edit/${record._id}`)}
              />
            </motion.div>
          </Tooltip>
          <Tooltip title="Delete Product">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                style={{ borderRadius: '8px' }}
                onClick={() => setDeleteDialog({
                  open: true,
                  productId: record._id,
                  productName: record.name
                })}
              />
            </motion.div>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2, duration: 0.5 }
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 32px'
    }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
            Style={{ padding: '24px 32px' }}
          >
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space align="center">
                <div>
                  <Title level={2} style={{
                    margin: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '32px',
                    fontWeight: '700'
                  }}>
                    <ShopOutlined style={{ marginRight: '12px' }} />
                    Product Management
                  </Title>
                  <Text style={{ fontSize: '16px', color: '#6b7280' }}>
                    Manage your product catalog and inventory
                  </Text>
                </div>
              </Space>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/seller-dashboard/products/create')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: '48px',
                    borderRadius: '12px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  Add New Product
                </Button>
              </motion.div>
            </Space>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}
              >
                <Statistic
                  title="Total Products"
                  value={totalProducts}
                  valueStyle={{ color: '#667eea', fontSize: '28px', fontWeight: '700' }}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}
              >
                <Statistic
                  title="Active Products"
                  value={activeProducts}
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '700' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}
              >
                <Statistic
                  title="Low Stock"
                  value={lowStockProducts}
                  valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: '700' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center'
                }}
              >
                <Statistic
                  title="Out of Stock"
                  value={outOfStockProducts}
                  valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: '700' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Products Table */}
        <motion.div variants={cardVariants}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: 'none',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
            Style={{ padding: '32px' }}
          >
            {products.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ color: '#6b7280', margin: '16px 0' }}>
                      No Products Found
                    </Title>
                    <Text style={{ fontSize: '16px', color: '#9ca3af' }}>
                      Start building your catalog by adding your first product
                    </Text>
                  </div>
                }
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => navigate('/seller-dashboard/products/create')}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      height: '48px',
                      borderRadius: '12px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    Add Your First Product
                  </Button>
                </motion.div>
              </Empty>
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={products}
                  rowKey="_id"
                  pagination={false}
                  loading={isLoading}
                  size="large"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                  scroll={{ x: 1000 }}
                />
                <div style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                    Showing {products.length} of {pagination.total} products
                  </Text>
                  <Pagination
                    current={currentPage}
                    total={pagination.total}
                    pageSize={pagination.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteDialog.open && (
            <Modal
              title={
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  <Text strong style={{ fontSize: '18px' }}>Confirm Deletion</Text>
                </Space>
              }
              open={deleteDialog.open}
              onOk={handleDelete}
              onCancel={() => setDeleteDialog({ open: false, productId: null, productName: "" })}
              okText="Delete Product"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
                size: 'large',
                style: {
                  borderRadius: '8px',
                  height: '40px',
                  fontWeight: '600'
                }
              }}
              cancelButtonProps={{
                size: 'large',
                style: {
                  borderRadius: '8px',
                  height: '40px'
                }
              }}
              centered
              maskClosable={false}
            >
              <div style={{ padding: '16px 0' }}>
                <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  Are you sure you want to delete <Text strong>"{deleteDialog.productName}"</Text>?
                  This action cannot be undone and will permanently remove the product from your catalog.
                </Text>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Products;
