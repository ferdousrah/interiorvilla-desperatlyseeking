'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface FormData {
  name: string
  mobile: string
  address: string
}

export const BookAppointmentContent = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    address: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle')
    }
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
          type: 'appointment',
          ...formData,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', mobile: '', address: '' })
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
    <section className="w-full py-12 sm:py-16 md:py-20 bg-white relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Card - Yellow-Green Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#C5D86D] rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 flex flex-col justify-between min-h-[400px] sm:min-h-[450px]"
          >
            {/* Arrow Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-6">
              <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-[#1d1e24]" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1d1e24] mb-4 sm:mb-6 leading-tight [font-family:'Fahkwang',Helvetica]">
                Let&apos;s Start Your
                <br />
                Dream Project!
              </h2>
              <p className="text-[#1d1e24]/80 text-sm sm:text-base leading-relaxed mb-8 [font-family:'Fahkwang',Helvetica]">
                Fill out the form below to schedule a consultation. Our team will get back to you
                shortly to discuss your vision and how we can help!
              </p>
            </div>

            {/* Contact Us Button */}
            <div>
              <p className="text-[#1d1e24] text-sm sm:text-base mb-3 [font-family:'Fahkwang',Helvetica]">
                Need More Information?
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#1d1e24] text-white px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 hover:bg-[#2d2e34] hover:scale-105 [font-family:'Fahkwang',Helvetica]"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Right Card - Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#f7f9fb] rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name Input */}
              <div>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm sm:text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Mobile Number Input */}
              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm sm:text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Address Textarea */}
              <div>
                <textarea
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-4 text-sm sm:text-base [font-family:'Fahkwang',Helvetica] placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 [font-family:'Fahkwang',Helvetica]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 text-green-700 rounded-lg text-center text-sm [font-family:'Fahkwang',Helvetica]"
                >
                  Thank you! Your request has been submitted. We&apos;ll contact you shortly.
                </motion.div>
              )}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 text-red-700 rounded-lg text-center text-sm [font-family:'Fahkwang',Helvetica]"
                >
                  Sorry, there was an error. Please try again or contact us directly.
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
