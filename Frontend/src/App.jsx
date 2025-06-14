import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route } from 'react-router-dom';
import Loading from "./components/loading/Loading";
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './lib/ErrorBoundary';
import HomePage from './components/pages/HomePage';
import SignInPage from './components/pages/authPages/SingInPage';
import ProtectedRoute from './lib/ProtectedRoute';
import SignUpPage from './components/pages/authPages/SignUpPage';
import OtpVerificationPage from './components/pages/authPages/OtpVerificationPage';
import SearchPage from './components/pages/SearchPage';
import UserProfile from './components/pages/userPages/userProfile';
import UpdateProfile from './components/pages/userPages/UpdateProfile';
import UpdatePassword from './components/pages/userPages/UpdatePassword';
import UserAddress from './components/pages/userPages/UserAddress';
import PageNotFound from './components/pages/PageNotFound';
import UserOrders from './components/pages/userPages/UserOrders';
import OrderDetails from './components/pages/userPages/OrderDetails';


const App = () => {
  const { isLoading } = useSelector((state) => state.auth);
  return (
    <Fragment>
      {isLoading ? (<Loading />) : (
        <div className='flex min-h-screen flex-col'>
          <Navbar />
          <ErrorBoundary>
            <main>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route
                  path="/signin"
                  element={
                    <ProtectedRoute forAuth={true}>
                      <SignInPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <ProtectedRoute forAuth={true}>
                      <SignUpPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verify-otp"
                  element={
                    <ProtectedRoute forAuth={true}>
                      <OtpVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/update-profile"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <UpdateProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/update-password"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <UpdatePassword />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-address"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <UserAddress />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-orders"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <UserOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-orders/:id"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute forAuth={false}>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </main>
          </ErrorBoundary>
        </div>
      )}
    </Fragment>
  )
}

export default App