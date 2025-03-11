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

  // Handle menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

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
      <header className="border-b bg-white/90 backdrop-blur-md dark:bg-zinc-950/90 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-12 w-10 -mt-1">
              <Image
                src="/hau2park-logo.svg"
                alt="HAU2PARK Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              HAU2PARK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/contact"
              className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-300"
            >
              Contact
            </Link>
            <Link href="/faq" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-300">
              FAQ
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="h-9">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="h-9">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-10 w-10 rounded-full text-zinc-600 dark:text-zinc-300"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Completely separate from the header */}
      <div 
        className={`
          fixed inset-0 z-50 md:hidden
          ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        {/* Dark Overlay - with strong blur */}
        <div 
          className={`
            absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={toggleMenu}
        />

        {/* Sidebar */}
        <div 
          className={`
            absolute top-0 right-0 h-full w-[280px] bg-white dark:bg-zinc-900
            shadow-2xl transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Sidebar Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/HAU2PARK User Manual.svg"
                  alt="HAU2PARK Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold tracking-tight pr-10">
                HAU2PARK
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-9 w-9 rounded-full focus:outline-none"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="p-4">
            <nav className="flex flex-col">
              <Link
                href="/"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={toggleMenu}
              >
                <Home className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                href="/contact"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={toggleMenu}
              >
                <Phone className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium">Contact</span>
              </Link>
              
              <Link
                href="/faq"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={toggleMenu}
              >
                <HelpCircle className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium">FAQ</span>
              </Link>
            </nav>
            
            {/* Action Buttons */}
            <div className="border-t mt-4 pt-6 space-y-3">
              <Link href="/auth/login" onClick={toggleMenu}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              
              <Link href="/auth/register" onClick={toggleMenu}>
                <Button 
                  className="w-full justify-start h-12"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}