import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Contact from './components/pages/Contact'
import Collection from './components/pages/Collection'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ProductDetails from './components/product/ProductDetails'
import NotFound from './components/NotFound'
import Cart from './components/cart/Cart'
import Order from './components/cart/Order'
import Wishlist from './components/cart/Wishlist'
import Navbar from './components/Navbar'
import About from './components/pages/About'
import Footer from './components/Footer'


export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const App = () => {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/products/:id' element={<ProductDetails />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<Order />} />
        <Route path='/wish' element={<Wishlist />} />
        
      
      
      </Routes>
      <Footer />    
    </div>
  )
}

export default App
