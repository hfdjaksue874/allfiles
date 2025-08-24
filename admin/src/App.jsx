
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/pages/Login';
import Order from './components/order/Order';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import AddProduct from './components/products/AddProduct';
import AllProducts from './components/products/AllProducts';
import UpdateProduct from './components/products/UpdateProduct';
import { ProductProvider } from './context/ProductContext';
import Pincode from './components/pincode/Pincode';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <ProductProvider>
      <div>
        <ToastContainer />
        {!isLoginPage && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/all"
            element={
              <PrivateRoute>
               <AllProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <UpdateProduct />
              </PrivateRoute>
            }
          />
          <Route 
            path='/orders' 
            element={
              <PrivateRoute>
                <Order />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/pincode' 
            element={
              <PrivateRoute>
                <Pincode />
              </PrivateRoute>
            } 
          />


        </Routes>
      </div>
    </ProductProvider>
  );
}

export default App;
