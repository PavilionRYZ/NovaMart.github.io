import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, clearAuthState } from '../../../redux/slices/authSlice';
import { clearAddressState } from '../../../redux/slices/addressSlice';
import { clearOrderState } from '../../../redux/slices/orderSlice';
import { Layout, Avatar, Button, Space, Typography, Badge, Dropdown, Card, Row, Col } from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  MenuOutlined
} from '@ant-design/icons';
import Loading from '../../loading/Loading';


const { Content } = Layout;
const { Title, Text } = Typography;

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeNav, setActiveNav] = useState('dashboard');

  // const handleLogout = () => {
  //   if (window.confirm('Are you sure you want to logout?')) {
  //     dispatch(logout());
  //     dispatch(clearAuthState());
  //     dispatch(clearAddressState());
  //     dispatch(clearOrderState());
  //     navigate('/');
  //   }
  // };

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, path: '/seller-dashboard' },
    { key: 'orders', label: 'Orders', icon: <ShoppingCartOutlined />, path: '/seller-dashboard/orders' },
    { key: 'products', label: 'Products', icon: <ShopOutlined />, path: '/seller-dashboard/products' },
    { key: 'add-product', label: 'Add Product', icon: <PlusOutlined />, path: '/seller-dashboard/products/create' }
  ];


  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.1, duration: 0.6, ease: "easeOut" }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    }),
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <Layout style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {isLoading ? (<Loading />) : (
        <Content style={{
          padding: '40px 32px',
          background: 'transparent'
        }}>
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Card */}
            <Card
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: 'none',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                marginBottom: '32px',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <Row align="middle" justify="space-between">
                <Col span={18}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Title level={1} style={{
                      margin: 0,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '42px',
                      fontWeight: '700'
                    }}>
                      Welcome back, {user?.firstName || user?.name || 'User'}! 👋
                    </Title>
                    <Text style={{
                      fontSize: '18px',
                      color: '#6b7280',
                      marginTop: '12px',
                      display: 'block',
                      lineHeight: '1.6'
                    }}>
                      Ready to manage your store and boost your sales today? Let's make it happen!
                    </Text>
                  </motion.div>
                </Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <div style={{
                      fontSize: '80px',
                      opacity: 0.8,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}>
                      🚀
                    </div>
                  </motion.div>
                </Col>
              </Row>
            </Card>

            {/* Navigation Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              {navigationItems.map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={item.key}>
                  <motion.div
                    custom={index}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <Link to={item.path} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable
                        onClick={() => setActiveNav(item.key)}
                        style={{
                          background: activeNav === item.key
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '16px',
                          border: activeNav === item.key ? 'none' : '1px solid rgba(102, 126, 234, 0.1)',
                          boxShadow: activeNav === item.key
                            ? '0 12px 32px rgba(102, 126, 234, 0.3)'
                            : '0 8px 24px rgba(0, 0, 0, 0.08)',
                          textAlign: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        bodyStyle={{ padding: '32px 24px' }}
                      >
                        <div style={{
                          fontSize: '48px',
                          marginBottom: '16px',
                          color: activeNav === item.key ? 'white' : '#667eea'
                        }}>
                          {item.icon}
                        </div>
                        <Title level={4} style={{
                          margin: 0,
                          color: activeNav === item.key ? 'white' : '#1a1a1a',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          {item.label}
                        </Title>
                        <Text style={{
                          fontSize: '14px',
                          color: activeNav === item.key ? 'rgba(255,255,255,0.8)' : '#6b7280',
                          marginTop: '8px',
                          display: 'block'
                        }}>
                          {item.key === 'dashboard' && 'Overview & Analytics'}
                          {item.key === 'orders' && 'Manage Orders'}
                          {item.key === 'products' && 'Product Catalog'}
                          {item.key === 'add-product' && 'Create New Product'}
                        </Text>
                      </Card>
                    </Link>
                  </motion.div>
                </Col>
              ))}
            </Row>
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            </Row>
          </motion.div>
        </Content>
      )}
    </Layout>
  );
};

export default SellerDashboard;