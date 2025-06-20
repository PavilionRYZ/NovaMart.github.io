# NovaMart E-commerce Platform

A full-stack NovaMart e-commerce application built with the MERN stack, featuring role-based access control, secure payments, and modern UI/UX design.

---

## 🚀 Live Demo

🌐 **NovaMart**: [novamart-zeta.vercel.app](https://novamart-zeta.vercel.app/)  

---

---
## 🎨 Ui Design
- **Home Page**
> ![Home Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui1.png?alt=media&token=ae5b5dcd-fee4-4edc-90c6-3c2f148db927)
- **Product Listing Page**
> ![Product Listing Page](https://firebasestorage.googleapis.com/v0/b/finerestate-c1c19.appspot.com/o/Diagrams%2FUi%2Fui2.png?alt=media&token=54814b43-2970-4995-9c5a-09624eb19ba3)
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

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

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
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Owner/Admin)
- `DELETE /api/products/:id` - Delete product (Owner/Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Seller/Admin)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Change user role
- `DELETE /api/users/:id` - Delete user

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
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/subhra-sundar-sinha-779538181/)
- Email: subhrasundarsinha21@gmail.com

## 🙏 Acknowledgments

- Thanks to all the open-source libraries used in this project
- Stripe for payment processing capabilities
- Google for OAuth authentication services
- MongoDB for database solutions

---

⭐ Star this repository if you found it helpful!
