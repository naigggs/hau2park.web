'use client'

import { useState } from 'react'
import { Search, PlusIcon, MinusIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Import your existing components
import Header from "@/components/shared/landing/header"
import Footer from "@/components/shared/landing/footer"

// Enhanced FAQ Data with formatted answers
const faqs = [
  {
    id: 1,
    question: "What is HAU2PARK AI and how does it work?",
    answer: (
      <div className="space-y-4">
        <p>
          <span className="font-medium text-zinc-900 dark:text-zinc-200">HAU2PARK</span> is an advanced AI-driven parking management system designed to streamline the parking process for guests, users, and administrators.
        </p>
        
        <div>
          <p className="mb-2">The system leverages:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>QR codes for secure access</li>
            <li>Real-time parking space monitoring</li>
            <li>AI chatbot for assistance and navigation</li>
          </ul>
        </div>
        
        <div>
          <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-200">User Roles:</p>
          <div className="grid gap-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Guests</span>
              <p className="text-sm">Request parking and receive QR codes for temporary access</p>
            </div>
            <div>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Users</span>
              <p className="text-sm">Registered members with additional parking management features</p>
            </div>
            <div>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Admins</span>
              <p className="text-sm">System managers who approve requests and oversee operations</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    question: "How do I request parking as a guest?",
    answer: (
      <div className="space-y-4">
        <p>To request parking as a guest:</p>
        
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Visit the platform</span>
            <p className="text-sm mt-1">Access the HAU2PARK AI website or open the mobile application</p>
          </li>
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Find the guest form</span>
            <p className="text-sm mt-1">Navigate to the Guest Parking Request Form</p>
          </li>
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Complete your information</span>
            <p className="text-sm mt-1">Fill in your full name, contact information, vehicle details, date/time of visit, and purpose of visit</p>
          </li>
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Submit and wait for approval</span>
            <p className="text-sm mt-1">Submit the form and wait for approval from the Admin Team</p>
          </li>
        </ol>
        
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            If approved, you'll receive a QR code via email or mobile app notification. Present this QR code to security upon arrival for access to the HAU2PARK AI Chatbot for parking assistance.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    question: "How do I register and access the system as a regular user?",
    answer: (
      <div className="space-y-4">
        <div>
          <p className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">Registration Process:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Sign Up</span> button</li>
            <li>Complete the registration form with:
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                <li>Full name</li>
                <li>License plate</li>
                <li>Email address</li>
                <li>Documentation proving school association</li>
                <li>Password</li>
              </ul>
            </li>
          </ol>
        </div>
        
        <div>
          <p className="mb-3 font-medium text-zinc-800 dark:text-zinc-200">Logging In:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Login</span> button on the homepage</li>
            <li>Enter your registered email and password</li>
            <li>You'll be directed to the AI chatbot interface</li>
          </ol>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Available Features:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Parking assistance</li>
            <li>Request management</li>
            <li>Real-time parking space monitoring</li>
            <li>Parking history</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    question: "How do I use the HAU2PARK AI Chatbot?",
    answer: (
      <div className="space-y-4">
        <p>The HAU2PARK AI Chatbot provides real-time assistance for parking queries. To use it:</p>
        
        <div className="grid grid-cols-1 gap-3 mt-2">
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium">1</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-300">Ask for available parking spaces</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Example: "Show me available parking spaces"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium">2</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-300">Select a parking space</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Example: "I want to park in {'parking space'}"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium">3</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-300">Confirm your selection</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Respond to the confirmation prompt</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium">4</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-300">Provide your entrance location</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Tell the chatbot which entrance you're at</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium">5</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-300">Follow directions to your spot</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">The chatbot will guide you to your parking spot</p>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md space-y-2">
          <p className="font-medium text-sm">Additional Features:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><span className="font-medium">Voice Input:</span> Speak to the chatbot instead of typing</li>
            <li><span className="font-medium">Text-to-Speech:</span> Listen to responses while driving</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 5,
    question: "What are parking verification notifications and how do I handle them?",
    answer: (
      <div className="space-y-4">
        <div>
          <p className="mb-2">When the system detects a car in a reserved parking space, it triggers a parking verification notification asking if the parked car is yours.</p>
        </div>
        
        <div className="border-l-4 border-amber-500 pl-4 py-1">
          <p className="font-medium text-zinc-800 dark:text-zinc-300">Important Instructions:</p>
          
          <ul className="mt-2 space-y-3">
            <li className="flex gap-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">1</span>
              </div>
              <p>If you receive this notification while not near the parking space, please visit the space to verify if it's actually occupied.</p>
            </li>
            
            <li className="flex gap-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">2</span>
              </div>
              <p>If there is a car parked in your space that isn't yours, select <span className="font-medium">'No'</span> when prompted <span className="italic">'Is this your car?'</span></p>
            </li>
          </ul>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-medium">Important:</span> Wait before answering this notification and ensure you're properly parked or off your vehicle before responding to maintain accurate system records.
          </p>
        </div>
      </div>
    )
  }
]

// Enhanced FAQ Item Component with shadcn styling
function FaqItem({ question, answer, isOpen, onToggle }: { 
  question: string; 
  answer: React.ReactNode; 
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        className="flex justify-between items-center w-full py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{question}</span>
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800">
          {isOpen ? (
            <MinusIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          ) : (
            <PlusIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-6 md:pr-12 text-zinc-600 dark:text-zinc-400">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main FAQ Page Component
export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(faq.answer).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            {/* Hero Section */}
            <div className="mb-16 md:mb-24 text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Everything you need to know about the HAU2PARK AI system.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="search"
                placeholder="Search for answers..."
                className="w-full py-4 pl-12 pr-4 text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-200 focus:border-transparent focus:outline-none transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* FAQ Items */}
            <div className="max-w-3xl mx-auto">
              {filteredFaqs.length > 0 ? (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredFaqs.map((faq) => (
                    <FaqItem 
                      key={faq.id} 
                      question={faq.question} 
                      answer={faq.answer} 
                      isOpen={openId === faq.id}
                      onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-zinc-500 dark:text-zinc-400 mb-4">No FAQs found matching your search criteria.</p>
                  <button 
                    className="px-6 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
            
            {/* Contact Section */}
            <div className="mt-20 text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Still have questions?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Can't find the answer you're looking for? Please contact our support team.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 text-base font-medium text-zinc-50 bg-zinc-900 rounded-full hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors duration-200"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}