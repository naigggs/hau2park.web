'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X,
  Home,
  Lightbulb,
  MessageSquareQuote,
  Phone,
  LogIn,
  UserPlus,
  HelpCircle
} from "lucide-react"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Handle menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle body scroll lock more effectively
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  return (
    <>
      {/* Main Header */}
      <header 
        className={`
          border-b bg-white/95 backdrop-blur-md dark:bg-zinc-950/95 
          sticky top-0 z-40 transition-all duration-300
          ${hasScrolled ? 'shadow-sm' : 'border-transparent'}
        `}
      >
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 group"
          >
            <div className="relative h-10 w-10 md:h-11 md:w-11 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/hau2park-logo.svg"
                alt="HAU2PARK Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
              HAU2PARK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/contact"
              className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-300 px-1 py-1.5 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Contact
            </Link>
            <Link 
              href="/faq" 
              className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-300 px-1 py-1.5 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              FAQ
            </Link>
            <div className="flex items-center space-x-3 pl-2">
              <Link href="/auth/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4 rounded-full border-zinc-200 hover:border-primary hover:text-primary transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  size="sm" 
                  className="h-9 px-4 rounded-full shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-10 w-10 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={toggleMenu}
            />
            
            {/* Slide-in Menu */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-[320px] bg-white dark:bg-zinc-900 shadow-2xl md:hidden overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="border-b border-zinc-100 dark:border-zinc-800 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="relative h-8 w-8">
                    <Image
                      src="/hau2park-logo.svg"
                      alt="HAU2PARK Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold tracking-tight">
                    HAU2PARK
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="h-9 w-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Menu Content */}
              <div className="p-6">
                <nav className="flex flex-col space-y-1.5">
                  <Link
                    href="/"
                    className="flex items-center space-x-3.5 p-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors"
                    onClick={toggleMenu}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <Home className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="flex items-center space-x-3.5 p-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors"
                    onClick={toggleMenu}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-medium">Contact</span>
                  </Link>
                  
                  <Link
                    href="/faq"
                    className="flex items-center space-x-3.5 p-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors"
                    onClick={toggleMenu}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <HelpCircle className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-medium">FAQ</span>
                  </Link>
                </nav>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <Link href="/auth/login" onClick={toggleMenu} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 rounded-xl px-5 border-zinc-200"
                    >
                      <LogIn className="h-4.5 w-4.5 mr-3 ml-1" />
                      <span>Login</span>
                    </Button>
                  </Link>
                  
                  <Link href="/auth/register" onClick={toggleMenu} className="block">
                    <Button 
                      className="w-full justify-start h-12 rounded-xl px-5"
                    >
                      <UserPlus className="h-4.5 w-4.5 mr-3 ml-1" />
                      <span>Get Started</span>
                    </Button>
                  </Link>
                </div>
                
                {/* Bottom Notice - Nice touch for mobile */}
                <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    © 2025 HAU2PARK • AI-powered parking
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}