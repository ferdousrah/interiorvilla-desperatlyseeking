'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { Home } from '@/payload-types'

const defaultFAQs = [
  {
    question: 'What services does Desperately Seeking offer?',
    answer:
      'Desperately Seeking offers comprehensive interior design services including residential interior design, commercial interior design, architectural consultancy, space planning, furniture selection, color consultation, and full project management across Bangladesh.',
  },
  {
    question: 'Do you offer a free initial consultation?',
    answer:
      'Yes, we offer a free initial consultation where we discuss your project ideas, understand your vision, and provide preliminary advice. You can book through our website, call us, or visit our office directly.',
  },
  {
    question: 'How long does a typical interior design project take?',
    answer:
      'A single room makeover typically takes 4–6 weeks, while a complete home interior can take 3–6 months. Commercial projects may take longer depending on scope. We provide a detailed timeline during your consultation.',
  },
  {
    question: 'Which areas in Bangladesh do you serve?',
    answer:
      'We primarily serve Dhaka including Gulshan, Banani, Dhanmondi, Uttara, and Bashundhara R/A. We also take projects in Chittagong, Sylhet, and other major cities. Contact us to discuss your location.',
  },
  {
    question: 'Do you handle construction and renovation work?',
    answer:
      'Yes, we provide end-to-end project management including civil work, electrical, plumbing, carpentry, painting, and all other construction-related tasks. Our project managers ensure quality execution and timely delivery.',
  },
  {
    question: 'What is your pricing structure?',
    answer:
      'Our pricing depends on the scope, design complexity, and materials chosen. We offer transparent packages with no hidden costs. After your consultation, we provide a detailed quote tailored to your project and budget.',
  },
]

interface HomeFAQSectionProps {
  data?: Home['faqSection']
}

export default function HomeFAQSection({ data }: HomeFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const sectionLabel = data?.sectionLabel || 'FAQ'
  const titlePrimary = data?.titlePrimary || 'Frequently Asked'
  const titleHighlight = data?.titleHighlight || 'Questions'
  const description =
    data?.description ||
    "Have questions about our interior design services? We've answered the most common ones below. Can't find what you're looking for?"
  const viewAllLabel = data?.viewAllLabel || 'View All FAQs'
  const viewAllUrl = data?.viewAllUrl || '/faq'
  const askDirectlyLabel = data?.askDirectlyLabel || 'Ask Us Directly'
  const askDirectlyUrl = data?.askDirectlyUrl || '/contact'

  const faqs =
    data?.faqs && data.faqs.length > 0
      ? data.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : defaultFAQs

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-[10%] xl:px-[17%]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Column */}
          <div className="lg:w-[38%] lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-[25px] bg-primary rounded-sm" />
              <span className="text-sm font-normal text-[#48515c] uppercase tracking-[0.9px]">{sectionLabel}</span>
              <span className="w-1 h-[25px] bg-primary rounded-sm" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-[40px] font-medium text-[#01190c] leading-tight mb-4">
              {titlePrimary}{' '}
              <span className="text-secondary">{titleHighlight}</span>
            </h2>
            <p className="text-[#626161] text-base leading-relaxed mb-8 whitespace-pre-line">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href={viewAllUrl}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-300 text-sm"
              >
                {viewAllLabel}
              </Link>
              <Link
                href={askDirectlyUrl}
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#01190c] text-[#01190c] font-semibold rounded-full hover:bg-[#01190c] hover:text-white hover:scale-105 transition-all duration-300 text-sm"
              >
                {askDirectlyLabel}
              </Link>
            </div>
          </div>

          {/* Right Column — Accordion */}
          <div className="lg:w-[62%] space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-colors duration-300 ${
                    isOpen
                      ? 'border-primary/30 bg-[#f0f7eb]'
                      : 'border-gray-100 bg-[#f7f9fb] hover:border-primary/20'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-[#01190c] pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-sm transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5 text-sm sm:text-base text-[#626161] leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
