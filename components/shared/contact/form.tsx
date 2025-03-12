'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

// Animation variants
const inputVariants = {
  focus: { scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 10 } }
}

// Enhanced button variants with mobile-friendly interactions
const buttonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  tap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const validate = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.message) newErrors.message = 'Message is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }
  
  const createEmailHtml = (data: FormData) => {
    return `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #18181b; font-size: 24px; margin: 0 0 4px;">New Contact Form Submission</h1>
          <p style="color: #71717a; font-size: 14px; margin: 0;">Received on ${new Date().toLocaleString()}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #18181b; font-size: 18px; margin-bottom: 8px;">Contact Details</h2>
          <p style="margin: 4px 0; color: #18181b;">
            <span style="font-weight: bold; color: #52525b;">Name:</span> ${data.name}
          </p>
          <p style="margin: 4px 0; color: #18181b;">
            <span style="font-weight: bold; color: #52525b;">Email:</span> 
            <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
          </p>
        </div>
        <div style="margin-bottom: 20px; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
          <h2 style="color: #18181b; font-size: 18px; margin-top: 0; margin-bottom: 8px;">${data.subject}</h2>
          <div style="color: #3f3f46; white-space: pre-wrap;">${data.message.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="font-size: 12px; color: #71717a; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">This email was sent from the contact form on your website.</p>
        </div>
      </div>
    `;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Get the email where you want to receive contact form submissions
      // You could store this in an environment variable or config
      const recipientEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your-email@example.com';
      
      const emailData = {
        to: recipientEmail,
        subject: `Contact Form: ${formData.subject}`,
        text: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage: ${formData.message}`,
        html: createEmailHtml(formData),
      };
      
      const response = await fetch('/api/admin/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      setIsSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitError('Failed to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isSubmitted) {
    return (
      <motion.div 
        className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[320px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <motion.div 
          className="mb-5"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
        >
          <CheckCircle className="h-14 w-14 text-green-500" />
        </motion.div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Message Sent!
        </h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm">
          Thank you for contacting us. We'll get back to you as soon as possible.
        </p>
      </motion.div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Full Name
          </label>
          <motion.div
            whileFocus="focus"
            variants={inputVariants}
          >
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none ${errors.name ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600'} transition-all text-base`}
              placeholder="Your name"
            />
          </motion.div>
          {errors.name && (
            <motion.p 
              className="mt-1 text-xs text-red-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.name}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Email Address
          </label>
          <motion.div
            whileFocus="focus"
            variants={inputVariants}
          >
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600'} transition-all text-base`}
              placeholder="your.email@example.com"
            />
          </motion.div>
          {errors.email && (
            <motion.p 
              className="mt-1 text-xs text-red-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Subject
          </label>
          <motion.div
            whileFocus="focus"
            variants={inputVariants}
          >
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none ${errors.subject ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600'} transition-all text-base`}
              placeholder="How can we help you?"
            />
          </motion.div>
          {errors.subject && (
            <motion.p 
              className="mt-1 text-xs text-red-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.subject}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Message
          </label>
          <motion.div
            whileFocus="focus"
            variants={inputVariants}
          >
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none ${errors.message ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600'} transition-all text-base`}
              placeholder="Please provide details about your inquiry..."
            />
          </motion.div>
          {errors.message && (
            <motion.p 
              className="mt-1 text-xs text-red-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.message}
            </motion.p>
          )}
        </motion.div>
      </div>
      
      {submitError && (
        <motion.div 
          className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="h-5 w-5" />
          <p>{submitError}</p>
        </motion.div>
      )}
      
      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 transition-all disabled:opacity-70 active:translate-y-0.5"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Send Message</span>
          </>
        )}
      </motion.button>
    </form>
  )
}