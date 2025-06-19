import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getSellerProducts, updateProduct, clearProductState } from "../../../redux/slices/productSlice";
import { storage } from "../../../storage/fireBase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Form, Input, Button, Card, Select, Upload, Spin, Row, Col, Typography, Switch, Space, Divider, Alert, Progress } from "antd";
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined, EditOutlined, ShopOutlined } from "@ant-design/icons";
import Loading from "../../loading/Loading";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, isLoading, error, message } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUpdateSubmitted, setIsUpdateSubmitted] = useState(false);

  useEffect(() => {
    dispatch(clearProductState());
    dispatch(getSellerProducts());
    return () => dispatch(clearProductState());
  }, [dispatch]);

  useEffect(() => {
    const foundProduct = products.find((p) => p._id === id);
    if (foundProduct) {
      form.setFieldsValue({
        name: foundProduct.name,
        description: foundProduct.description,
        price: foundProduct.price,
        stock: foundProduct.stock,
        category: foundProduct.category,
        discount: foundProduct.discount,
        brand: foundProduct.brand,
        isActive: foundProduct.isActive,
      });
      setFileList(foundProduct.images.map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index}`,
        status: "done",
        url,
      })));
    }
  }, [products, id, form]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message && isUpdateSubmitted) {
      toast.success(message);
      setIsUpdateSubmitted(false);
      navigate("/seller-dashboard/products");
    }
  }, [error, message, navigate, isUpdateSubmitted]);

  const handleUpload = async (file) => {
    if (!user || !user._id) {
      setUploadError("You must be logged in to upload images.");
      toast.error("Please sign in to upload images");
      setUploading(false);
      return null;
    }
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        setUploadProgress(30 + attempt * 20);
        const uuid = uuidv4();
        const extension = file.name.split(".").pop();
        const fileName = `${user._id}.${uuid}.${extension}`;
        const storageRef = ref(storage, `products/${user._id}/${fileName}`);
        const metadata = {
          contentType: file.type,
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            userId: user._id,
          },
        };

        setUploadProgress(70);
        console.log(`Uploading file: ${fileName}, attempt ${attempt + 1}`);
        const snapshot = await uploadBytes(storageRef, file, metadata);
        setUploadProgress(90);
        const url = await getDownloadURL(snapshot.ref);
        setUploadProgress(100);
        console.log(`Upload successful: ${url}`);
        return url;
      } catch (err) {
        attempt++;
        const errorMsg = `Attempt ${attempt} failed: ${err.code || err.message}`;
        console.error(errorMsg, err);
        if (attempt === maxRetries) {
          setUploadError(`Failed to upload image after ${maxRetries} attempts: ${err.code || err.message}`);
          toast.error(`Upload failed: ${err.code || err.message}`);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    setUploading(false);
    setUploadProgress(0);
    return null;
  };

  const onFinish = async (values) => {
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    setIsUpdateSubmitted(true);

    try {
      if (!user || !user._id) {
        throw new Error("You must be logged in to update a product");
      }

      // Find the product to get its existing images
      const foundProduct = products.find((p) => p._id === id);
      const existingImages = foundProduct?.images || [];

      // Check if there are any images (existing or new)
      if (fileList.length === 0 && existingImages.length === 0) {
        throw new Error("Please upload at least one image or ensure the product already has images");
      }

      setUploadProgress(20);
      console.log(`Starting upload of ${fileList.length} files`);

      // Process fileList: keep existing URLs and upload new files
      const imageUrls = await Promise.all(
        fileList.map(async (file, index) => {
          if (file.url) {
            console.log(`Keeping existing image ${index + 1}: ${file.url}`);
            return file.url;
          }
          const fileToUpload = file.originFileObj || file;
          if (fileToUpload instanceof File) {
            console.log(`Processing new file ${index + 1}: ${fileToUpload.name}`);
            setUploadProgress(20 + ((index + 1) / fileList.length) * 60);
            const url = await handleUpload(fileToUpload);
            console.log(`File ${index + 1} uploaded: ${url}`);
            return url;
          }
          console.warn(`File ${index + 1} is not a valid File object:`, file);
          return null;
        })
      );

      // Filter out null URLs and fall back to existing images if fileList is empty
      let filteredImageUrls = imageUrls.filter((url) => url !== null);
      if (filteredImageUrls.length === 0 && existingImages.length > 0) {
        console.log("No new images uploaded, using existing images:", existingImages);
        filteredImageUrls = existingImages;
      }

      if (filteredImageUrls.length === 0) {
        throw new Error("No valid images available for the product");
      }

      setUploadProgress(90);
      const productData = {
        ...values,
        images: filteredImageUrls,
        isActive: values.isActive || false,
      };

      console.log(`Updating product with data:`, productData);
      await dispatch(updateProduct({ productId: id, productData })).unwrap();
      setUploadProgress(100);
      setFileList([]); // Clear fileList only on successful update
    } catch (err) {
      console.error("Product update error:", err);
      toast.error(err.message || "Failed to update product");
      setIsUpdateSubmitted(false);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const isValidType = validTypes.includes(file.type);
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isValidType) {
        toast.error("You can only upload JPEG, PNG, GIF, or WebP files!");
        return false;
      }
      if (!isLt5M) {
        toast.error("Image must be smaller than 5MB!");
        return false;
      }
      const fileWithUid = {
        ...file,
        uid: file.uid || uuidv4(),
        originFileObj: file,
      };
      setFileList((prev) => [...prev, fileWithUid]);
      console.log(`Added file to fileList: ${file.name}`);
      return false;
    },
    fileList,
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2, duration: 0.5 },
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 32px",
      }}
    >
      {isLoading ? (<Loading />) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: "32px" }}>
            <Card
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                padding: "24px 32px"
              }}
            >
              <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
                <Space align="center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="ghost"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate("/seller-dashboard/products")}
                      style={{
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                        color: "#667eea",
                        borderRadius: "12px",
                        height: "48px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                      }}
                    >
                      Back to Products
                    </Button>
                  </motion.div>
                  <div style={{ marginLeft: "24px" }}>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: "32px",
                        fontWeight: "700",
                      }}
                    >
                      <EditOutlined style={{ marginRight: "12px" }} />
                      Edit Product
                    </Title>
                    <Text style={{ fontSize: "16px", color: "#6b7280" }}>Update your product information and details</Text>
                  </div>
                </Space>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                  <ShopOutlined style={{ fontSize: "48px", color: "#667eea", opacity: 0.6 }} />
                </motion.div>
              </Space>
            </Card>
          </motion.div>

          {/* Main Edit Form */}
          <motion.div variants={cardVariants}>
            <Card
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: "none",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ padding: "48px" }}
            >
              <Spin spinning={isLoading || uploading} size="large">
                {uploading && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ marginBottom: "24px" }}
                  >
                    <Progress
                      percent={uploadProgress}
                      status={uploadProgress === 100 ? "success" : "active"}
                      strokeColor={{
                        "0%": "#667eea",
                        "100%": "#764ba2",
                      }}
                      style={{ marginBottom: "8px" }}
                    />
                    <Text type="secondary">{uploadProgress < 100 ? "Uploading images..." : "Upload complete!"}</Text>
                  </motion.div>
                )}

                {uploadError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "24px" }}>
                    <Alert
                      message="Upload Error"
                      description={uploadError}
                      type="error"
                      showIcon
                      closable
                      onClose={() => setUploadError("")}
                    />
                  </motion.div>
                )}

                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                  {/* Basic Information Section */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Title level={4} style={{ color: "#1a1a1a", marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
                      📝 Basic Information
                    </Title>

                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Product Name</Text>}
                          name="name"
                          rules={[{ required: true, message: "Please enter product name" }]}
                        >
                          <Input
                            placeholder="Enter product name"
                            style={{
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              height: "48px",
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Brand</Text>}
                          name="brand"
                          rules={[{ required: true, message: "Please enter brand name" }]}
                        >
                          <Input
                            placeholder="Enter brand name"
                            style={{
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              height: "48px",
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label={<Text strong style={{ fontSize: "16px" }}>Description</Text>}
                      name="description"
                      rules={[{ required: true, message: "Please enter product description" }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Describe your product in detail..."
                        style={{
                          borderRadius: "12px",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                        }}
                      />
                    </Form.Item>
                  </motion.div>

                  <Divider style={{ margin: "40px 0" }} />

                  {/* Pricing & Inventory Section */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Title level={4} style={{ color: "#1a1a1a", marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
                      💰 Pricing & Inventory
                    </Title>

                    <Row gutter={24}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Price ($)</Text>}
                          name="price"
                          rules={[{ required: true, message: "Please enter product price" }]}
                        >
                          <Input
                            type="number"
                            min={0}
                            placeholder="0.00"
                            prefix="$"
                            style={{
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              height: "48px",
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Stock Quantity</Text>}
                          name="stock"
                          rules={[{ required: true, message: "Please enter stock quantity" }]}
                        >
                          <Input
                            type="number"
                            min={0}
                            placeholder="Enter quantity"
                            style={{
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              height: "48px",
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Discount (%)</Text>}
                          name="discount"
                          rules={[{ type: "number", min: 0, max: 100 }]}
                        >
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            suffix="%"
                            style={{
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              height: "48px",
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </motion.div>

                  <Divider style={{ margin: "40px 0" }} />

                  {/* Category & Media Section */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Title level={4} style={{ color: "#1a1a1a", marginBottom: "24px", fontSize: "20px", fontWeight: "600" }}>
                      🏷️ Category & Media
                    </Title>

                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Category</Text>}
                          name="category"
                          rules={[{ required: true, message: "Please select a category" }]}
                        >
                          <Select
                            placeholder="Select a category"
                            style={{
                              borderRadius: "12px",
                              height: "48px",
                            }}
                          >
                            <Option value="Electronics">📱 Electronics</Option>
                            <Option value="Clothing">👕 Clothing</Option>
                            <Option value="Books">📚 Books</Option>
                            <Option value="Home">🏠 Home & Garden</Option>
                            <Option value="Sports">⚽ Sports & Outdoors</Option>
                            <Option value="Beauty">💄 Beauty & Health</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong style={{ fontSize: "16px" }}>Product Status</Text>}
                          name="isActive"
                          valuePropName="checked"
                        >
                          <div
                            style={{
                              padding: "12px 16px",
                              background: "rgba(102, 126, 234, 0.05)",
                              borderRadius: "12px",
                              border: "1px solid rgba(102, 126, 234, 0.1)",
                            }}
                          >
                            <Space align="center">
                              <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                style={{
                                  backgroundColor: "#667eea",
                                }}
                              />
                              <Text style={{ fontSize: "16px", color: "#6b7280" }}>Make product visible to customers</Text>
                            </Space>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label={<Text strong style={{ fontSize: "16px" }}>Product Images</Text>}
                      name="images"
                      rules={[{ required: false, message: "Please upload at least one image" }]}
                    >
                      <Upload
                        {...uploadProps}
                        listType="picture-card"
                        multiple
                        className="custom-upload"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        style={{ borderRadius: "12px" }}
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ textAlign: "center" }}>
                          <UploadOutlined style={{ fontSize: "32px", color: "#667eea", marginBottom: "8px" }} />
                          <div style={{ color: "#6b7280", fontSize: "14px" }}>Click or drag files here</div>
                          <div style={{ color: "#999999", fontSize: "12px", marginTop: "4px" }}>Max 5MB per image</div>
                        </motion.div>
                      </Upload>
                    </Form.Item>
                  </motion.div>

                  <Divider style={{ margin: "40px 0" }} />

                  {/* Action Buttons */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ textAlign: "center" }}>
                    <Space size="large">
                      <Button
                        size="large"
                        onClick={() => navigate("/seller-dashboard/products")}
                        style={{
                          height: "56px",
                          borderRadius: "16px",
                          paddingLeft: "32px",
                          paddingRight: "32px",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        Cancel
                      </Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isLoading || uploading}
                          icon={<SaveOutlined />}
                          size="large"
                          style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            height: "56px",
                            borderRadius: "16px",
                            paddingLeft: "32px",
                            paddingRight: "32px",
                            fontSize: "16px",
                            fontWeight: "600",
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                          }}
                        >
                          Update Product
                        </Button>
                      </motion.div>
                    </Space>
                  </motion.div>
                </Form>
              </Spin>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EditProduct;