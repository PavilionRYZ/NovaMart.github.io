# NovaMart E-commerce Platform

A full-stack NovaMart e-commerce application built with the MERN stack, featuring role-based access control, secure payments, and modern UI/UX design.

---

## 🚀 Live Demo

🌐 **NovaMart**: [novamart-zeta.vercel.app](https://novamart-zeta.vercel.app/) 

**Seller Account**: 

Login Email: wobej62351@ocuser.com

Password: Bejs@wo12

**Admin Account**:

Login Email: hadow67027@lidugw.com

Password: hadow@67027

---

---
## 🎨 Ui Design
- **Home Page**
> ![Home Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui1.png?alt=media&token=ae5b5dcd-fee4-4edc-90c6-3c2f148db927)
- **Product Listing Page**
> ![Product Listing Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui11.png?alt=media&token=4b18b858-4445-4b80-a6bc-f62ecbfd514f)
- **Product Details Page**
> ![Product Details Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui6.png?alt=media&token=179d0497-e752-4c01-aed1-04946b2895d0)
- **Cart Page**
> ![Cart Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui7.png?alt=media&token=bc8e962e-222d-4c88-ac0d-b6b158b59131)
- **Login**
> ![Login/Signup Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui8.png?alt=media&token=ff599e4b-7459-41fa-b629-afc7a1ee03fa)
- **Signup Page**
> ![Signup Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui9.png?alt=media&token=4fc7934f-8f5f-45dc-8044-7ef493b1f84b)
- **Profile Page**
> ![Profile Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui3.png?alt=media&token=32011daf-9d4f-4251-baa6-f2915e58d0bf)
- **Order History Page**
> ![Order History Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui10.png?alt=media&token=09408614-3c83-4f05-96e7-f67359641964)
- **Admin Dashboard**
> ![Admin Dashboard](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui5.png?alt=media&token=586875e5-ec02-4ed1-8299-11feb7d3e9a8)
- **Seller Dashboard**
> ![Seller Dashboard](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui4.png?alt=media&token=ed52afb6-2815-47b5-8b05-3021bd79b0cd)
- **User Dashboard**

---


## 🚀 Features

### User Features
- **Product Browsing**: View and search through products from multiple vendors
- **Shopping Cart**: Add products to cart and manage quantities
- **Secure Checkout**: Complete purchases using Stripe payment gateway
- **Order Management**: Track order status and history
- **Address Management**: Add, edit, and delete shipping addresses
- **Review and Rating**: Leave product reviews and ratings after the order will delivered
- **User Profile**: Update account information and password
- **Update Password**: Update user password
- **Update User Avatar**: Update user profile picture
- **User Authentication**: Secure login/register with JWT and Google OAuth

### Seller Features
- **Product Management**: Create, edit, and delete own products
- **Inventory Control**: Manage product stock and pricing
- **Order Processing**: Update order status and manage fulfillment
- **Sales Dashboard**: View sales analytics and performance metrics
- **Profile Management**: Update seller information and settings

### Admin Features
- **User Management**: View, edit, and delete user accounts
- **Role Management**: Change user roles (User/Seller/Admin)
- **Product Oversight**: Manage all products across the platform
- **System Administration**: Full control over platform operations
- **Analytics Dashboard**: Comprehensive platform statistics

## Plantuml Diagram for the Project
- **Sequence Diagram User**
> ![Sequence_User_Purchase_Flow](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FPlantUml%2Fimagediagram.png?alt=media&token=1fca62fc-9c82-4319-9824-55e17f895690)
- **Sequence Diagram Seller**
> ![Sequence_Seller_Product_Management](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FPlantUml%2Fimagediagram-1.png?alt=media&token=53b6e9d3-6756-4d66-8234-11d0cd4564eb)
- **Use Case Diagram**
> ![usecase diagram](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FPlantUml%2Fimagediagram-3.png?alt=media&token=52f4f1b2-e226-4bb3-a414-316799ddfd80)
- **Class Diagram**
> ![class diagram](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FPlantUml%2Fimagediagram-4.png?alt=media&token=01aa3c45-e59f-4c81-b7e3-bf887cbfe927)

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **ShadCN UI** - Modern UI components
- **Ant Design** - Enterprise-class UI design language
- **Redux/Redux-Toolkit** - For Centralized State Management
- **React-Router-Dom** - For Client Side Routing
- **Axios** - Promise based HTTP client for the browser and Node.js
- **FireBase** - For Storing Images
- **lucide-react/react-icons** - For Icons
- **React-Toastify** - For Toast Notifications

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Nodemailer** - For Sending Mails
- **DotEnv** - For Environment Variables
- **Stripe** - For Payment Processing
- **Cors** - For Cross-Origin Resource Sharing

### Authentication & Security
- **JWT (JSON Web Tokens)** - Secure authentication
- **bcrypt** - Password hashing
- **Google OAuth** - Third-party authentication

### Payment Processing
- **Stripe** - Payment gateway integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST APIs     │    │ • Users         │
│ • Pages         │    │ • Middleware    │    │ • Products      │
│ • State Mgmt    │    │ • Auth Routes   │    │ • Orders        │
│ • UI Libraries  │    │ • Controllers   │    │ • Categories    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 User Roles & Permissions

| Feature             | User | Seller     | Admin |
| ------------------- | ---- | ---------- | ----- |
| View Products       | ✅    | ✅          | ✅     |
| Purchase Products   | ✅    | ✅          | ✅     |
| Manage Cart         | ✅    | ✅          | ✅     |
| Create Products     | ❌    | ✅          | ✅     |
| Edit Own Products   | ❌    | ✅          | ✅     |
| Delete Own Products | ❌    | ✅          | ✅     |
| Edit Any Product    | ❌    | ❌          | ✅     |
| Delete Any Product  | ❌    | ❌          | ✅     |
| Manage Users        | ❌    | ❌          | ✅     |
| Change User Roles   | ❌    | ❌          | ✅     |
| View All Orders     | ❌    | Own Orders | ✅     |

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe Account
- Google OAuth Credentials

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/PavilionRYZ/NovaMart.github.io.git
cd NovaMart.github.io
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create environment variables
```bash
# Create .env file in backend directory
PORT = your_port
MONGODB_URI =your_mongodb_connection_string
EMAIL_USER =your_email@gmail.com
EMAIL_PASS =your_email_password
SMTP_HOST =your_smtp_host
SMTP_PORT =your_smtp_port
JWT_SECRET =your_jwt_secret_key
TOKEN_EXPIRY = your_token_expiry
COOKIE_MAX_AGE = your_cookie_max_age
STRIPE_SECRET_KEY =your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY =your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET =your_stripe_webhook_secret
GOOGLE_CLIENT_ID =your_google_client_id
GOOGLE_CLIENT_SECRET =your_google_client_secret
SESSION_SECRET = your_session_secret
FRONTEND_URL = your_frontend_url
```

4. Start the backend server
```bash
npm run dev
```

### Frontend Setup

1. Install frontend dependencies
```bash
cd frontend
npm install
```

2. Create environment variables
```bash
# Create .env file in frontend directory
VITE_API_URL=your_api_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_FRONTEND_API_GOOGLE_AUTHENTICATE=your_google_authenticate_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

3. Start the frontend development server
```bash
npm run dev
```

## 🗂️ Project Structure

```
NovaMart/
├── Backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package-json
│   └── server.js
├── Frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── redux/
│   │   └── storage/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication

* `POST /api/v1/user/signup` - User registration
* `POST /api/v1/user/verify-otp` - Verify OTP
* `POST /api/v1/user/login` - User login
* `POST /api/v1/auth/google` - Google OAuth login
* `GET /api/v1/auth/profile` - Get user profile
* `GET /api/v1/user/logout` - User logout
* `POST /api/v1/user/forgot-password` - Request password reset
* `POST /api/v1/user/reset-password/:token` - Reset password

---

### Users

* `PUT /api/v1/users/update-profile` - Update user profile
* `POST /api/v1/users/update-password` - Change password

---

### Products

* `GET /api/v1/product/get/all` - Get all products
* `POST /api/v1/product/add/new` - Add new product (Seller/Admin)  
* `PATCH /api/v1/product/update/:id` - Update product (Seller/Admin)
* `DELETE /api/v1/product/delete/:id` - Delete product (Seller/Admin)
* `GET /api/v1/product/:id` - Get single product
* `GET /api/v1/product/get/seller` - Get seller's products

---

### Orders

* `GET /api/v1/order/user` - Get user orders
* `PUT /api/v1/order/status/update/:id` - Update order status (Seller/Admin)
* `POST /api/v1/order/create` - Create order
* `DELETE /api/v1/orders/cancel/:id` - Cancel order
* `GET /api/v1/orders/seller` - Get seller orders
* `GET /api/v1/order/get/:id` - Get order by ID

---

### Cart

* `GET /api/v1/cart/get` - Get user's cart
* `POST /api/v1/cart/add/item` - Add item to cart
* `PUT /api/v1/cart/update/item` - Update item quantity
* `DELETE /api/v1/cart/remove/item` - Remove item from cart
* `DELETE /api/v1/cart/clear` - Clear cart

---

### Addresses

* `POST /api/v1/user/address/create` - Add new address
* `PATCH /api/v1/user/address/update/:id` - Update address
* `DELETE /api/v1/user/address/delete/:id` - Delete address
* `GET /api/v1/user/address/get/all` - Get all addresses of user
* `GET /api/v1/user/address/get/:id` - Get address by ID

---

### Reviews

* `POST /api/v1/product/review/create/:id` - Create a review
* `PUT /api/v1/product/review/update/:id` - Update review
* `DELETE /api/v1/product/review/delete/:id` - Delete review
* `GET /api/v1/product/reviews/get/:id` - Get reviews for a product
* `GET /api/v1/review/get/:id` - Get review by ID
* `POST /api/v1/review/reply/:id` - Seller reply to review
* `POST /api/v1/review/like/:id` - Like/unlike a review
* `POST /api/v1/review/helpful/:id` - Mark review as helpful

---

### Payments

* `GET /api/v1/payments/config` - Get Stripe publishable key
* `POST /api/v1/payments/webhook` - Stripe webhook handler
* `POST /api/v1/payments/intent` - Create payment intent
* `POST /api/v1/payments/verify` - Verify payment
* `GET /api/v1/payments/order/:id` - Get payment by order ID
* `POST /api/v1/payments/refund` - Refund payment (Under Development)

---

### Admin (Admin Only)

* `GET /api/v1/admin/users/get/all` - Get all users
* `PUT /api/v1/admin/user/role/change/:id` - Change user role
* `DELETE /api/v1/admin/user/delete/:id` - Delete user

---

## 💳 Payment Integration

The application uses Stripe for secure payment processing:

- **Frontend**: Stripe Elements for card input
- **Backend**: Stripe API for payment processing
- **Security**: Payment intents for secure transactions
- **Features**: Support for multiple currencies and payment methods

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with refresh tokens
- **Role-Based Access Control**: Middleware for permission checking
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Modern Components**: ShadCN UI and Ant Design integration
- **Interactive Elements**: Hover effects and micro-interactions

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
```bash
# Build for production
npm run build

# Set environment variables on your hosting platform
# Deploy using your preferred method
```

### Frontend Deployment (Netlify/Vercel)
```bash
# Build for production
npm run build

# Deploy the build folder to your hosting platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [PavilionRYZ](https://github.com/PavilionRYZ)
- LinkedIn: [Subhra Sundar Sinha](https://www.linkedin.com/in/subhra-sundar-sinha-779538181/)
- Portfolio: [Subhradev.netlify.app](https://subhradev.netlify.app/)
- Email: subhrasundarsinha21@gmail.com

## 🙏 Acknowledgments

- Thanks to all the open-source libraries used in this project
- Stripe for payment processing capabilities
- Google for OAuth authentication services
- MongoDB for database solutions

---

⭐ Star this repository if you found it helpful!
