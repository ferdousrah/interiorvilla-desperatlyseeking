'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export const ContactInfoSection = () => {
  const contactItems = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+880 1234-567890',
      href: 'tel:+8801234567890',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@desperatelyseeking.com',
      href: 'mailto:info@desperatelyseeking.com',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      content: '+880 1234-567890',
      href: 'https://wa.me/8801234567890',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Sat - Thu: 9:00 AM - 6:00 PM',
      href: null,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold text-[#01190c] mb-4">
          Get in <span className="text-secondary">Touch</span>
        </h3>
        <p className="text-[#626161] text-base leading-relaxed">
          Have questions about our services? We&apos;d love to hear from you. Reach out through any of
          these channels and our team will get back to you promptly.
        </p>
      </div>

      <div className="space-y-4">
        {contactItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-[#626161] mb-1">{item.title}</p>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-[#01190c] font-medium hover:text-primary transition-colors duration-300"
                >
                  {item.content}
                </a>
              ) : (
                <p className="text-[#01190c] font-medium">{item.content}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Media */}
      <div className="pt-4">
        <p className="text-sm text-[#626161] mb-4">Follow us on social media</p>
        <div className="flex gap-4">
          {['facebook', 'instagram', 'linkedin', 'youtube'].map((social) => (
            <a
              key={social}
              href={`https://${social}.com/desperatelyseeking`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#01190c] rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors duration-300"
            >
              <span className="sr-only">{social}</span>
              {social === 'facebook' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              )}
              {social === 'instagram' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="18" cy="6" r="1" />
                </svg>
              )}
              {social === 'linkedin' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              )}
              {social === 'youtube' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
