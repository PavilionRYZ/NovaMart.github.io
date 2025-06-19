import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getSellerOrders, updateOrderStatus, clearOrderState } from "../../../redux/slices/orderSlice";
import { Card, Table, Select, Tag, Typography, Avatar, Space, Tooltip, Badge, Row, Col } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import Loading from "../../loading/Loading";


const { Option } = Select;
const { Title, Text } = Typography;

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error, message } = useSelector((state) => state.order);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    dispatch(getSellerOrders());
    return () => dispatch(clearOrderState());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const handleStatusChange = async (orderId, status) => {
    setSelectedStatus((prev) => ({ ...prev, [orderId]: status }));
    try {
      await dispatch(updateOrderStatus({ orderId, orderStatus: status })).unwrap();
    } catch (err) {
      toast.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      dispatched: 'blue',
      shipped: 'purple',
      delivered: 'green'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      dispatched: <SendOutlined />,
      shipped: <TruckOutlined />,
      delivered: <CheckCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      width: 150,
      responsive: ['md'],
      render: (id) => (
        <Text
          code
          copyable={{ text: id }}
          style={{ fontSize: '12px' }}
        >
          #{id.slice(-8)}
        </Text>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <Text
              strong
              style={{
                fontSize: '14px',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
              }}
            >
              {`${record.user?.firstName || 'N/A'} ${record.user?.lastName || ''}`.trim()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (total) => (
        <Text
          strong
          style={{
            color: '#52c41a',
            fontSize: '14px',
            display: 'block'
          }}
        >
          ${total?.toFixed(2) || '0.00'}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 130,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          icon={getStatusIcon(status)}
          style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            margin: 0
          }}
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Dispatched', value: 'dispatched' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
      ],
      onFilter: (value, record) => record.orderStatus === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Select
          value={selectedStatus[record._id] || record.orderStatus}
          onChange={(value) => handleStatusChange(record._id, value)}
          disabled={record.orderStatus === "delivered"}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="pending">Pending</Option>
          <Option value="dispatched">Dispatched</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
        </Select>
      ),
    },
  ];

  // Mobile-friendly columns
  const mobileColumns = [
    {
      title: "Order Details",
      key: "details",
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Text code style={{ fontSize: '11px' }}>
              #{record._id.slice(-8)}
            </Text>
            <Tag
              color={getStatusColor(record.orderStatus)}
              icon={getStatusIcon(record.orderStatus)}
              style={{ fontSize: '11px', margin: 0 }}
            >
              {record.orderStatus}
            </Tag>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Space size="small">
              <Avatar size="small" icon={<UserOutlined />} />
              <Text style={{ fontSize: '13px' }}>
                {`${record.user?.firstName || 'N/A'} ${record.user?.lastName || ''}`.trim()}
              </Text>
            </Space>
            <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
              ${record.totalAmount?.toFixed(2) || '0.00'}
            </Text>
          </div>

          <Select
            value={selectedStatus[record._id] || record.orderStatus}
            onChange={(value) => handleStatusChange(record._id, value)}
            disabled={record.orderStatus === "delivered"}
            style={{ width: '100%' }}
            size="small"
          >
            <Option value="pending">Pending</Option>
            <Option value="dispatched">Dispatched</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </div>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: "16px",
        marginLeft: "0",
        minHeight: '100vh',
        background: '#f5f5f5'
      }}
      className="xl:ml-64"
    >
      {isLoading ? (<Loading />) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Card
              title={
                <Space>
                  <Badge count={orders.length} showZero color="#1890ff">
                    <ShoppingCartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  </Badge>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    Orders Management
                  </Title>
                </Space>
              }
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e8e8e8'
              }}
              // className="sm:rounded-none sm:border-0 sm:shadow-none"
              bodyStyle={{ padding: '16px' }}
              headStyle={{ padding: '0 16px' }}
              className="sm:m-0 sm:rounded-none [&_.ant-card-head]:border-b [&_.ant-card-head]:border-gray-200 [&_.ant-card-head-title]:py-4 [&_.ant-card-body]:p-3 sm:[&_.ant-card-body]:p-3"
            >
              {orders.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px dashed #d9d9d9'
                  }}
                >
                  <ShoppingCartOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                  <Title level={5} style={{ color: '#595959', margin: '0 0 8px 0' }}>
                    No orders found
                  </Title>
                  <Text style={{ color: '#8c8c8c' }}>
                    Orders will appear here when customers place them
                  </Text>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table
                      columns={columns}
                      dataSource={orders}
                      rowKey="_id"
                      loading={isLoading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showQuickJumper: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} orders`,
                        style: { textAlign: 'center' }
                      }}
                      scroll={{ x: 800 }}
                      size="middle"
                      className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-thead>tr>th]:px-2 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-tbody>tr>td]:px-2 [&_.ant-table-tbody>tr>td]:py-3 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr>td]:align-middle [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-select-selector]:rounded [&_.ant-select-selector]:border [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector:hover]:border-blue-400"
                    />
                  </div>

                  {/* Mobile Table */}
                  <div className="block md:hidden">
                    <Table
                      columns={mobileColumns}
                      dataSource={orders}
                      rowKey="_id"
                      loading={isLoading}
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        simple: true
                      }}
                      showHeader={false}
                      size="small"
                      className="[&_.ant-table-pagination]:text-center [&_.ant-table-pagination]:mt-4 [&_.ant-table-pagination]:mb-0"
                    />
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </motion.div>
  );
};

export default Orders;