import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { createProduct, clearProductState } from "../../../redux/slices/productSlice";
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
import "./CreateProduct.css";

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
  const [isMounted, setIsMounted] = useState(false); // Track initial mount

  useEffect(() => {
    setIsMounted(true); // Set mounted state after first render
    if (error && isMounted) toast.error(error);
    if (message && isMounted) {
      toast.success(message);
      dispatch(clearProductState()); // Clear message after handling
      navigate("/seller-dashboard/products");
    }
    return () => {
      if (message) dispatch(clearProductState()); // Cleanup on unmount
    };
  }, [error, message, navigate, dispatch, isMounted]);

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
      className="create-product-container bg-gradient-to-br from-gray-100 to-indigo-200 min-h-screen p-4"
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center px-4"
        >
          <Space direction="vertical" size="small" className="w-full">
            <div className="icon-container bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShoppingCartOutlined className="text-white text-3xl" />
            </div>
            <Title level={2} className="gradient-text text-2xl md:text-3xl">
              Create New Product
            </Title>
            <Text type="secondary" className="text-sm md:text-base text-center block">
              Add your product details to start selling
            </Text>
          </Space>
        </motion.div>

        <motion.div variants={cardVariants} className="px-4">
          <Card className="card-container rounded-2xl shadow-2xl bg-white bg-opacity-95 backdrop-blur-lg w-full p-5 md:p-10">
            <Spin spinning={isLoading || uploading} size="large">
              {uploading && uploadProgress > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6"
                >
                  <Progress
                    percent={uploadProgress}
                    status={uploadProgress === 100 ? "success" : "active"}
                    strokeColor={{
                      "0%": "#667eea",
                      "100%": "#764ba2",
                    }}
                    className="mb-2"
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
                  className="mb-6"
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
                <div className="mb-8">
                  <div className="flex items-center mb-4 flex-wrap gap-2">
                    <TagOutlined className="text-indigo-500 text-lg" />
                    <Title level={4} className="text-indigo-500 text-lg md:text-xl m-0">
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
                          className="rounded-lg text-sm"
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
                          className="rounded-lg text-sm"
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
                      className="rounded-lg text-sm"
                    />
                  </Form.Item>
                </div>

                <Divider className="my-6" />

                <div className="mb-8">
                  <div className="flex items-center mb-4 flex-wrap gap-2">
                    <DollarOutlined className="text-indigo-500 text-lg" />
                    <Title level={4} className="text-indigo-500 text-lg md:text-xl m-0">
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
                          className="rounded-lg text-sm"
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
                          className="rounded-lg text-sm"
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
                          className="rounded-lg text-sm"
                          suffix="%"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider className="my-6" />

                <div className="mb-8">
                  <div className="flex items-center mb-4 flex-wrap gap-2">
                    <AppstoreOutlined className="text-indigo-500 text-lg" />
                    <Title level={4} className="text-indigo-500 text-lg md:text-xl m-0">
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
                          className="rounded-lg"
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

                <Divider className="my-6" />

                <div className="mb-8">
                  <div className="flex items-center mb-4 flex-wrap gap-2">
                    <PictureOutlined className="text-indigo-500 text-lg" />
                    <Title level={4} className="text-indigo-500 text-lg md:text-xl m-0">
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
                    >
                      <div className="upload-container text-center p-4 md:p-5 min-h-[120px] flex flex-col justify-center items-center">
                        <UploadOutlined className="text-indigo-500 text-2xl md:text-3xl mb-2" />
                        <div className="text-indigo-500 font-semibold text-sm md:text-base">
                          Click or drag files here
                        </div>
                        <div className="text-gray-500 text-xs md:text-sm mt-1">
                          Max 5MB per image
                        </div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>

                <Form.Item className="mb-0 text-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading || uploading}
                    size="large"
                    className="submit-button h-12 md:h-14 rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-lg w-full max-w-xs md:max-w-sm transition-all duration-300"
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