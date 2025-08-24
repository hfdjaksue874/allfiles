import React from 'react'
import { Heart, Users, Award, Truck, Shield, Star } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion for Fashion",
      description: "We're passionate about bringing you the latest trends and timeless classics that make you feel confident and beautiful."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Focused",
      description: "Building a community of fashion lovers who inspire and support each other in their style journey."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Guaranteed",
      description: "Every piece is carefully selected and tested to ensure the highest quality standards for our customers."
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get your favorite items to you as soon as possible."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Shopping",
      description: "Your privacy and security are our top priorities. Shop with confidence knowing your data is protected."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Customer First",
      description: "Exceptional customer service and support to ensure your shopping experience is always amazing."
    }
  ]

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Products" },
    { number: "50+", label: "Brands" },
    { number: "99%", label: "Satisfaction Rate" }
  ]

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      description: "Visionary leader with 10+ years in fashion industry"
    },
    {
      name: "Mike Chen",
      role: "Head of Design",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Creative genius behind our stunning collections"
    },
    {
      name: "Emma Davis",
      role: "Customer Experience",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Dedicated to making every customer experience exceptional"
    }
  ]

  // Image gallery for the story section
  const storyImages = [
    {
      url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      alt: "Fashion store interior"
    },
    {
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
      alt: "Fashion design process"
    }
  ]

  // Hero background images
  const heroImages = [
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  ]

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/600x400/f3f4f6/9ca3af?text=Image+Not+Available';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImages[0]}
            alt="Fashion background"
            className="w-full h-full object-cover opacity-30"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/80 to-pink-600/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              About <span className="text-yellow-300">FLY</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Where fashion meets passion. We're more than just a clothing store - we're your style companion on the journey to express your unique personality.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-4 sm:space-y-6 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Founded in 2020, FLY began as a small dream to make fashion accessible, affordable, and exciting for everyone. What started as a passion project has grown into a thriving community of fashion enthusiasts.
                </p>
                <p>
                  We believe that great style shouldn't break the bank. That's why we work directly with manufacturers and designers to bring you high-quality pieces at prices that make sense.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, helping them discover their personal style and feel confident in what they wear.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src={storyImages[0].url}
                    alt={storyImages[0].alt}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg"
                    onError={handleImageError}
                  />
                  <img
                    src={storyImages[1].url}
                    alt={storyImages[1].alt}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg mt-8"
                    onError={handleImageError}
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-fuchsia-200 rounded-full opacity-50 -z-10"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-50 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're committed to providing the best shopping experience with our unique approach to fashion and customer care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-fuchsia-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Passionate individuals dedicated to bringing you the best fashion experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="text-center group"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-fuchsia-100 group-hover:border-fuchsia-300 transition-colors duration-300"
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-fuchsia-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Style Journey?
          </h2>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of satisfied customers who have transformed their wardrobe with us.
          </p>
          <button className="bg-white text-fuchsia-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
            Shop Now
          </button>
        </div>
      </section>
    </div>
  )
}

export default About
