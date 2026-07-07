'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import type { Office } from '@/payload-types'

interface FormData {
  office: string
  name: string
  email: string
  message: string
}

interface ContactFormProps {
  offices: Office[]
}

export const ContactForm = ({ offices }: ContactFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    office: offices[0]?.title || 'Head Office',
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          ...formData,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          office: offices[0]?.title || 'Head Office',
          name: '',
          email: '',
          message: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-2xl mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-semibold text-[#01190c] text-center mb-8">
        Need Any Help? Drop us a Line
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Office Select */}
        <select
          name="office"
          value={formData.office}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white text-[#626161]"
        >
          {offices.length > 0 ? (
            offices.map((office) => (
              <option key={office.id} value={office.title}>
                Office: {office.title}
              </option>
            ))
          ) : (
            <>
              <option value="Head Office">Office: Head Office</option>
              <option value="Savar Office">Office: Savar Office</option>
            </>
          )}
        </select>

        {/* Full Name */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Full Name"
          className="w-full px-5 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Email address"
          className="w-full px-5 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        />

        {/* Message */}
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Type your Message"
          className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full text-base font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 text-green-700 rounded-lg text-center"
          >
            Thank you! Your message has been sent successfully.
          </motion.div>
        )}
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 text-red-700 rounded-lg text-center"
          >
            Sorry, there was an error. Please try again.
          </motion.div>
        )}
      </form>
    </motion.div>
  )
}
