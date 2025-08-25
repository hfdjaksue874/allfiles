import Cart from './components/cart/Cart'
import Order from './components/cart/Order'
import Signup from './components/auth/Signup'
import About from './components/pages/About'
import Wishlist from './components/cart/Wishlist'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import NotFound from './components/NotFound'
import ProductDetails from './components/product/ProductDetails'
import Home from './components/pages/Home'
import Contact from './components/pages/Contact'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { Route, Routes } from 'react-router-dom'
import Collection from './components/pages/Collection'
import Profile from './components/auth/Profile'

// Define backend URL
export const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/';

const App = () => {
  return (
    <div>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/products/:id' element={<ProductDetails />} />
        <Route path='*' element={<NotFound />} />
        
        {/* Protected Routes */}
        <Route path='/cart' element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path='/order' element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        } />
        <Route path='/wish' element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />    
    </div>
  )
}

export default App