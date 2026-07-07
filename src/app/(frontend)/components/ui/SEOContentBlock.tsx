'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface SEOContentBlockProps {
  children: React.ReactNode
}

// Shared prose styling for both the inline teaser and the modal body.
const proseClass =
  "text-[#555] text-sm sm:text-[15px] leading-[1.85] [&_h1]:text-[22px] [&_h1]:font-semibold [&_h1]:text-[#1a2e1a] [&_h1]:mb-2 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#1a2e1a] [&_h2]:mb-2 [&_h2]:mt-6 [&_h2:first-child]:mt-0 [&_p]:mb-3 [&_strong]:text-[#1a2e1a] [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 space-y-4"

export default function SEOContentBlock({ children }: SEOContentBlockProps) {
  // Two-state mount so the modal can animate on BOTH enter and exit:
  //   mounted = in the DOM, visible = animated-in state.
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const openModal = useCallback(() => setMounted(true), [])
  const closeModal = useCallback(() => setVisible(false), [])

  // Enter: once in the DOM, flip to visible on the next frame so the CSS
  // transition runs from the hidden start state.
  useEffect(() => {
    if (!mounted) return
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [mounted])

  // Lock body scroll + close on Escape while the modal is in the DOM.
  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [mounted, closeModal])

  // Exit: unmount only after the close transition has finished.
  const handlePanelTransitionEnd = () => {
    if (!visible) setMounted(false)
  }

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-[10%] xl:px-[17%] pt-2 md:pt-3 pb-10 md:pb-14">
        {/* Inline teaser — the FULL content stays in the DOM (only visually
            clipped) so search engines read all of it. Fixed height + a
            position:fixed modal mean this block never changes page height. */}
        <div className="relative">
          <div className="overflow-hidden" style={{ maxHeight: '6.6rem' }}>
            <div className={proseClass}>{children}</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 group"
            aria-haspopup="dialog"
          >
            <span>Read More</span>
            <span className="w-5 h-5 rounded-full border border-primary flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      {/* ───── Read-More modal (fixed overlay — adds no page height) ───── */}
      {mounted && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Service details"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className={`absolute inset-0 bg-[#0a1410]/55 backdrop-blur-[3px] cursor-default transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Panel */}
          <div
            onTransitionEnd={handlePanelTransitionEnd}
            className={`relative bg-white w-full max-w-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-[0_20px_70px_-15px_rgba(10,20,16,0.4)] will-change-transform transition-all duration-300 ease-out motion-reduce:transition-none ${
              visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 sm:translate-y-4 sm:scale-95'
            }`}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary to-secondary shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-semibold text-[#1a2e1a] [font-family:'Fahkwang',Helvetica] truncate">
                  More about this service
                </h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#555] hover:bg-gray-100 hover:text-[#1a2e1a] hover:rotate-90 transition-all duration-300 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto overscroll-contain px-5 sm:px-8 py-6 sm:py-7">
              <div className={proseClass}>{children}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
