import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { createProduct } from "../../../redux/slices/productSlice";
import { storage } from "../../../storage/fireBase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Upload,
  Spin,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Alert,
  Progress
} from "antd";
import {
  UploadOutlined,
  ShoppingCartOutlined,
  PictureOutlined,
  TagOutlined,
  DollarOutlined,
  AppstoreOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, message } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) {
      toast.success(message);
      navigate("/seller-dashboard/products");
    }
  }, [error, message, navigate]);

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

    try {
      if (fileList.length === 0) {
        throw new Error("Please upload at least one image");
      }
      if (!user || !user._id) {
        throw new Error("You must be logged in to create a product");
      }

      setUploadProgress(20);
      console.log(`Starting upload of ${fileList.length} files`);
      const imageUrls = await Promise.all(
        fileList.map(async (file, index) => {
          const fileToUpload = file.originFileObj || file;
          if (fileToUpload instanceof File) {
            console.log(`Processing file ${index + 1}: ${fileToUpload.name}`);
            setUploadProgress(20 + ((index + 1) / fileList.length) * 60);
            const url = await handleUpload(fileToUpload);
            console.log(`File ${index + 1} uploaded: ${url}`);
            return url;
          }
          console.warn(`File ${index + 1} is not a valid File object:`, file);
          return null;
        })
      );

      const filteredImageUrls = imageUrls.filter((url) => url !== null);
      console.log(`Filtered image URLs:`, filteredImageUrls);

      if (filteredImageUrls.length === 0) {
        throw new Error("No valid images uploaded");
      }

      setUploadProgress(90);
      const productData = {
        ...values,
        images: filteredImageUrls,
        specifications: {},
      };

      console.log(`Creating product with data:`, productData);
      await dispatch(createProduct(productData)).unwrap();
      setUploadProgress(100);
    } catch (err) {
      console.error("Product creation error:", err);
      toast.error(err.message || "Failed to create product");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setFileList([]); // Clear fileList after submission
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
      // Ensure file has uid and originFileObj
      const fileWithUid = {
        ...file,
        uid: file.uid || uuidv4(),
        originFileObj: file,
      };
      setFileList((prev) => [...prev, fileWithUid]);
      console.log(`Added file to fileList: ${file.name}`);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: "16px",
        marginLeft: "0",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
      className="create-product-container"
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            marginBottom: "24px",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div
              style={{
                background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: "28px", color: "white" }} />
            </div>
            <Title
              level={2}
              style={{
                margin: 0,
                background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
              }}
            >
              Create New Product
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: "clamp(14px, 2vw, 16px)",
                textAlign: "center",
                display: "block",
              }}
            >
              Add your product details to start selling
            </Text>
          </Space>
        </motion.div>

        <motion.div variants={cardVariants} style={{ padding: "0 16px" }}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "none",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              width: "100%",
            }}
            bodyStyle={{
              padding: "clamp(20px, 5vw, 40px)",
            }}
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
                  <Text type="secondary">
                    {uploadProgress < 100 ? "Uploading images..." : "Upload complete!"}
                  </Text>
                </motion.div>
              )}

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: "24px" }}
                >
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

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  name: "",
                  description: "",
                  price: "",
                  stock: "",
                  category: "",
                  discount: "",
                  brand: "",
                }}
              >
                <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <TagOutlined style={{ color: "#667eea", fontSize: "18px" }} />
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color: "#667eea",
                        fontSize: "clamp(16px, 3vw, 20px)",
                      }}
                    >
                      Basic Information
                    </Title>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<Text strong>Product Name</Text>}
                        name="name"
                        rules={[{ required: true, message: "Please enter product name" }]}
                      >
                        <Input
                          size="large"
                          placeholder="Enter product name"
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                      <Form.Item
                        label={<Text strong>Brand</Text>}
                        name="brand"
                        rules={[{ required: true, message: "Please enter brand name" }]}
                      >
                        <Input
                          size="large"
                          placeholder="Enter brand name"
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={<Text strong>Description</Text>}
                    name="description"
                    rules={[{ required: true, message: "Please enter product description" }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe your product in detail..."
                      style={{
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                </div>

                <Divider style={{ margin: "clamp(16px, 3vw, 24px) 0" }} />

                <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <DollarOutlined style={{ color: "#667eea", fontSize: "18px" }} />
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color: "#667eea",
                        fontSize: "clamp(16px, 3vw, 20px)",
                      }}
                    >
                      Pricing & Inventory
                    </Title>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={8}>
                      <Form.Item
                        label={<Text strong>Price ($)</Text>}
                        name="price"
                        rules={[{ required: true, message: "Please enter product price" }]}
                      >
                        <Input
                          type="number"
                          min={0}
                          size="large"
                          placeholder="0.00"
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                          prefix="$"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8}>
                      <Form.Item
                        label={<Text strong>Stock Quantity</Text>}
                        name="stock"
                        rules={[{ required: true, message: "Please enter stock quantity" }]}
                      >
                        <Input
                          type="number"
                          min={0}
                          size="large"
                          placeholder="0"
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8}>
                      <Form.Item
                        label={<Text strong>Discount (%)</Text>}
                        name="discount"
                        rules={[{ type: "number", min: 0, max: 100 }]}
                      >
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          size="large"
                          placeholder="0"
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                          suffix="%"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: "clamp(16px, 3vw, 24px) 0" }} />

                <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <AppstoreOutlined style={{ color: "#667eea", fontSize: "18px" }} />
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color: "#667eea",
                        fontSize: "clamp(16px, 3vw, 20px)",
                      }}
                    >
                      Category
                    </Title>
                  </div>

                  <Row>
                    <Col xs={24} sm={24} md={12} lg={8}>
                      <Form.Item
                        label={<Text strong>Product Category</Text>}
                        name="category"
                        rules={[{ required: true, message: "Please select a category" }]}
                      >
                        <Select
                          size="large"
                          placeholder="Select a category"
                          style={{
                            borderRadius: "8px",
                          }}
                        >
                          <Option value="Electronics">📱 Electronics</Option>
                          <Option value="Clothing">👕 Clothing</Option>
                          <Option value="Books">📚 Books</Option>
                          <Option value="Sports">⚽ Sports</Option>
                          <Option value="Home">🏠 Home & Garden</Option>
                          <Option value="Beauty">💄 Beauty & Personal Care</Option>
                          <Option value="Toys">🎁 Toys & Games</Option>
                          <Option value="Health">💊 Health & Wellness</Option>

                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: "clamp(16px, 3vw, 24px) 0" }} />

                <div style={{ marginBottom: "clamp(20px, 4vw, 32px)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <PictureOutlined style={{ color: "#667eea", fontSize: "18px" }} />
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color: "#667eea",
                        fontSize: "clamp(16px, 3vw, 20px)",
                      }}
                    >
                      Product Images
                    </Title>
                  </div>

                  <Form.Item
                    label={<Text strong>Upload Images</Text>}
                    name="images"
                    rules={[{ required: true, message: "Please upload at least one image" }]}
                  >
                    <Upload
                      {...uploadProps}
                      listType="picture-card"
                      multiple
                      className="product-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      style={{
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          padding: "clamp(12px, 3vw, 20px)",
                          minHeight: "120px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <UploadOutlined
                          style={{
                            fontSize: "clamp(24px, 5vw, 32px)",
                            color: "#667eea",
                            marginBottom: "8px",
                          }}
                        />
                        <div
                          style={{
                            color: "#667eea",
                            fontWeight: "600",
                            fontSize: "clamp(12px, 2.5vw, 14px)",
                          }}
                        >
                          Click or drag files here
                        </div>
                        <div
                          style={{
                            color: "#999",
                            fontSize: "clamp(10px, 2vw, 12px)",
                            marginTop: "4px",
                          }}
                        >
                          Max 5MB per image
                        </div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading || uploading}
                    size="large"
                    style={{
                      height: "clamp(48px, 8vw, 56px)",
                      borderRadius: "12px",
                      fontSize: "clamp(14px, 2.5vw, 16px)",
                      fontWeight: "600",
                      background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                      minWidth: "clamp(160px, 40vw, 200px)",
                      width: "100%",
                      maxWidth: "300px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {uploading ? "Creating Product..." : "Create Product"}
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateProduct;