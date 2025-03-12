'use client'

import { useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Loader2 } from 'lucide-react'

// Import your existing components
import Header from "@/components/shared/landing/header"
import Footer from "@/components/shared/landing/footer"
import ContactMap from '@/components/shared/contact/map'
import ContactForm from '@/components/shared/contact/form'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

// Main Contact Page Component
export default function ContactPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      <main className="flex-grow">
        <section className="py-10 sm:py-16 md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            {/* Hero Section */}
            <motion.div 
              className="mb-8 sm:mb-12 md:mb-16 text-center"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                Get in Touch
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Have questions about HAU2PARK? We're here to help.
              </p>
            </motion.div>
            
            {/* Mobile-first layout strategy */}
            <div className="max-w-5xl mx-auto">
              {/* Map on top for mobile */}
              <motion.div 
                className="mb-8 sm:mb-10 lg:hidden rounded-xl overflow-hidden shadow-lg h-[250px] sm:h-[300px]"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {!isLoaded ? (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/75">
                    <Loader2 className="h-7 w-7 text-zinc-500 animate-spin" />
                  </div>
                ) : (
                  <ContactMap />
                )}
              </motion.div>
            
              {/* Desktop layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column - Contact Form */}
                <div className="lg:col-span-7 space-y-6">
                  <motion.div 
                    className="rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ContactForm />
                  </motion.div>

                  {/* Contact Methods */}
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div 
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/80 dark:to-zinc-900/60 shadow-sm flex flex-col items-center text-center cursor-pointer"
                      variants={itemVariants}
                      whileTap={{ scale: 0.97 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                        <MapPin className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Address</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">#1 Holy Angel St, Angeles, 2009 Pampanga</p>
                    </motion.div>

                    <motion.div 
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/80 dark:to-zinc-900/60 shadow-sm flex flex-col items-center text-center cursor-pointer"
                      variants={itemVariants}
                      whileTap={{ scale: 0.97 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                        <Phone className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Phone</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">+63 (45) 888-8691</p>
                    </motion.div>

                    <motion.div 
                      className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/80 dark:to-zinc-900/60 shadow-sm flex flex-col items-center text-center cursor-pointer"
                      variants={itemVariants}
                      whileTap={{ scale: 0.97 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                        <Mail className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Email</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">hau2park@gmail.com</p>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Right Column - Map (hidden on mobile, shown on desktop) */}
                <motion.div 
                  className="hidden lg:block lg:col-span-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="rounded-xl shadow-lg overflow-hidden h-full min-h-[500px]">
                    {!isLoaded ? (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/75">
                        <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
                      </div>
                    ) : (
                      <ContactMap />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}