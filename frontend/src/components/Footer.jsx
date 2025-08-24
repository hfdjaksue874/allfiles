import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Truck, 
  Shield, 
  RotateCcw,
  Heart
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Collection', path: '/collection' },
    { name: 'Contact', path: '/contact' }
  ]

  const customerService = [
    { name: 'Help Center', path: '/help' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'Shipping Info', path: '/shipping' },
    { name: 'Returns', path: '/returns' },
    { name: 'Track Order', path: '/track-order' }
  ]

  const policies = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
    { name: 'Cookie Policy', path: '/cookies' }
  ]

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: <Facebook className="w-5 h-5" />, 
      url: 'https://facebook.com',
      hoverColor: 'hover:text-blue-600'
    },
    { 
      name: 'Twitter', 
      icon: <Twitter className="w-5 h-5" />, 
      url: 'https://twitter.com',
      hoverColor: 'hover:text-blue-400'
    },
    { 
      name: 'Instagram', 
      icon: <Instagram className="w-5 h-5" />, 
      url: 'https://instagram.com',
      hoverColor: 'hover:text-pink-600'
    },
    { 
      name: 'YouTube', 
      icon: <Youtube className="w-5 h-5" />, 
      url: 'https://youtube.com',
      hoverColor: 'hover:text-red-600'
    }
  ]

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Free Shipping',
      description: 'On orders over $50'
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment',
      description: '100% secure checkout'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Multiple Payment',
      description: 'Various payment options'
    }
  ]

  const paymentMethods = [
    { name: 'Visa', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'PayPal', logo: '💰' },
    { name: 'Apple Pay', logo: '📱' },
    { name: 'Google Pay', logo: '📱' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-center sm:text-left">
                <div className="text-fuchsia-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="text-2xl font-bold text-fuchsia-400">
                FLY
              </Link>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">
                Your ultimate destination for trendy and affordable fashion. Express your unique style with our curated collection.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">support@fly.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">
                  123 Fashion Street<br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-3">
              {customerService.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Connected</h3>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">
                Subscribe to get updates on new arrivals and exclusive offers.
              </p>
              <form className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 text-sm font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-gray-400 text-sm mb-3">Follow us on social media</p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${social.hoverColor} transition-colors duration-300`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} FLY. All rights reserved. Made with{' '}
                <Heart className="w-4 h-4 inline text-red-500" /> for fashion lovers.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">We accept:</span>
              <div className="flex space-x-2">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 px-2 py-1 rounded text-xs flex items-center space-x-1"
                    title={method.name}
                  >
                    <span>{method.logo}</span>
                    <span className="hidden sm:inline text-gray-400">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end space-x-4 text-xs">
              {policies.map((policy, index) => (
                <Link
                  key={index}
                  to={policy.path}
                  className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-300"
                >
                  {policy.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-fuchsia-600 text-white p-3 rounded-full shadow-lg hover:bg-fuchsia-700 transition-colors duration-300 z-50"
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  )
}

export default Footer
