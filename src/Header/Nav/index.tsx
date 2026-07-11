'use client'

import React, { useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

import type { Header as HeaderType } from '@/payload-types'

interface HeaderNavProps {
  data: HeaderType
  isHomePage?: boolean
  isScrolled?: boolean
  isScrollingUp?: boolean
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

// Default mega menu structure — used when none is configured in the admin panel
const defaultMegaMenuSections = [
  {
    title: 'Residential',
    description: 'Transform your home into a sanctuary',
    icon: '🏠',
    color: '#75BF44',
    bgColor: '#C7E9C0',
    links: [
      { name: 'Apartment Interior Design', href: '/services/residential/apartment-interior-design' },
      { name: 'Home Interior Design', href: '/services/residential/home-interior-design' },
      { name: 'Duplex Interior Design', href: '/services/residential/duplex-interior-design' },
    ],
    viewAllHref: '/services/residential-interior',
  },
  {
    title: 'Commercial',
    description: 'Create inspiring workspaces',
    icon: '🏢',
    color: '#EE5428',
    bgColor: '#E5F5E0',
    links: [
      { name: 'Corporate & Office Interior Design', href: '/services/commercial-interior/corporate-and-office-interior-design' },
      { name: 'Buying House Office Interior Design', href: '/services/commercial-interior/buying-house-office-interior-design' },
      { name: 'Travel Agency Office Interior Design', href: '/services/commercial-interior/travel-agency-office-interior-design' },
      { name: 'Hotel & Hospitality Interior Design', href: '/services/commercial-interior/hotel-and-hospitality-interior-design' },
      { name: 'Restaurant & Café Interior Design', href: '/services/commercial-interior/restaurant-and-cafe-interior-design' },
      { name: 'Brand Showroom Interior Design', href: '/services/commercial-interior/brand-showroom-interior-design' },
      { name: "Men's Salon & Lifestyle Interior Design", href: '/services/commercial-interior/mens-salon-and-lifestyle-interior-design' },
      { name: 'Hospital & Clinic Interior Design', href: '/services/commercial-interior/hospital-and-clinic-interior-design' },
      { name: 'Pharmacy Interior Design', href: '/services/commercial-interior/pharmacy-interior-design' },
      { name: 'Dental Chamber Interior Design', href: '/services/commercial-interior/dental-chamber-interior-design' },
      { name: 'Spa & Beauty Parlor Interior Design', href: '/services/commercial-interior/spa-and-beauty-parlor-interior-design' },
      { name: 'Resort Interior Design', href: '/services/commercial-interior/resort-interior-design' },
      { name: 'Retail Shop Interior Design', href: '/services/commercial-interior/retail-shop-interior-design' },
      { name: 'Educational Institute Interior Design', href: '/services/commercial-interior/educational-institute-interior-design' },
      { name: 'Fitness Center Interior Design', href: '/services/commercial-interior/fitness-center-interior-design' },
    ],
    viewAllHref: '/services/commercial-interior',
  },
  {
    title: 'Architectural',
    description: 'Expert architectural solutions',
    icon: '📐',
    color: '#4F46E5',
    bgColor: '#F7FCF5',
    links: [],
    viewAllHref: '/services/architectural-consultancy',
  },
]

// Default navigation items matching the original frontend
const defaultNavItems = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Services', href: '#', hasMegaMenu: true },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact Us', href: '/contact' },
]

export const HeaderNav: React.FC<HeaderNavProps> = ({
  data,
  isHomePage: _isHomePage = false,
  isScrolled = false,
  isScrollingUp = false,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Admin-configured menu (Header global) with built-in fallbacks
  const navItems =
    data?.menuItems && data.menuItems.length > 0
      ? data.menuItems.map((item) => ({
          name: item.label,
          href: item.url || '#',
          hasMegaMenu: !!item.hasMegaMenu,
        }))
      : defaultNavItems

  const megaMenuSections =
    data?.megaMenu?.sections && data.megaMenu.sections.length > 0
      ? data.megaMenu.sections.map((section, i) => {
          const fallback = defaultMegaMenuSections[i % defaultMegaMenuSections.length]!
          return {
            title: section.title,
            description: section.description || '',
            color: section.color || fallback.color,
            bgColor: section.backgroundColor || fallback.bgColor,
            links: (section.links || []).map((l) => ({ name: l.label, href: l.url })),
            viewAllHref: section.viewAllUrl || fallback.viewAllHref,
          }
        })
      : defaultMegaMenuSections

  const megaHelpText = data?.megaMenu?.helpText || 'Need help choosing?'
  const megaHelpLinkText = data?.megaMenu?.helpLinkText || 'Contact our experts'
  const megaButtonLabel = data?.megaMenu?.buttonLabel || 'Get Consultation'
  const megaButtonUrl = data?.megaMenu?.buttonUrl || '/contact'

  const handleMouseEnter = (itemName: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredMenu(itemName)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredMenu(null), 300)
  }

  const handleNavClick = (href: string, hasMegaMenu?: boolean) => {
    if (!hasMegaMenu) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      router.push(href)
    }
  }

  const handleSubmenuNavigation = (href: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    router.push(href)
    setHoveredMenu(null)
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label="Toggle mobile menu"
        className="lg:hidden text-white transition-all duration-300 hover:scale-110 z-50 relative bg-black/20 rounded-full p-2 backdrop-blur-sm"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
        }}
        onClick={onMobileMenuToggle}
      >
        <motion.div
          animate={isMobileMenuOpen ? 'open' : 'closed'}
          className="w-6 h-6 flex flex-col justify-center items-center"
        >
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 },
            }}
            className="w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
          />
          <motion.span
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
          />
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 },
            }}
            className="w-6 h-0.5 bg-current block mt-1.5 transform origin-center transition-all duration-300"
          />
        </motion.div>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <nav className="flex space-x-2" role="navigation" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => item.hasMegaMenu && handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`min-w-[108px] px-6 py-2 rounded-[50px] whitespace-nowrap transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg font-medium text-center ${
                  pathname === item.href ? 'bg-primary text-white shadow-lg' : 'text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNavClick(item.href, item.hasMegaMenu)
                }}
              >
                <span className="transition-all duration-300">{item.name}</span>
                {item.hasMegaMenu && (
                  <motion.span
                    className="ml-1 text-xs transition-all duration-300"
                    animate={{ rotate: hoveredMenu === item.name ? 180 : 0 }}
                  >
                    +
                  </motion.span>
                )}
              </button>

              {/* Mega Menu — minimal dark glass panel */}
              <AnimatePresence>
                {item.hasMegaMenu && hoveredMenu === item.name && (
                  <div
                    className="fixed left-0 right-0 z-[999] flex justify-center pointer-events-none px-4"
                    style={{ top: isScrolled && isScrollingUp ? '68px' : '92px' }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      role="menu"
                      aria-label="Services mega menu"
                      className="pointer-events-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className="grid divide-x divide-white/[0.06]"
                        style={{
                          gridTemplateColumns: `repeat(${megaMenuSections.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {megaMenuSections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="p-7 flex flex-col">
                            {/* Column header: accent dot + uppercase title */}
                            <Link
                              href={section.viewAllHref}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSubmenuNavigation(section.viewAllHref)
                              }}
                              className="inline-flex items-center gap-2 group/title"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: section.color }}
                              />
                              <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white group-hover/title:opacity-70 transition-opacity duration-200">
                                {section.title}
                              </span>
                            </Link>
                            {section.description && (
                              <p className="mt-2 text-xs text-white/35 leading-relaxed">
                                {section.description}
                              </p>
                            )}

                            {/* Links */}
                            <div className="mt-5 -mx-2.5 space-y-0.5 max-h-[42vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {section.links.map((link, linkIndex) => (
                                <button
                                  key={linkIndex}
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleSubmenuNavigation(link.href)
                                  }}
                                  className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] leading-snug text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors duration-150"
                                >
                                  {link.name}
                                </button>
                              ))}
                            </div>

                            {/* View all */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSubmenuNavigation(section.viewAllHref)
                              }}
                              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium hover:gap-2.5 transition-all duration-200 self-start"
                              style={{ color: section.color }}
                            >
                              View all
                              <span aria-hidden>→</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-center justify-between px-7 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                        <span className="text-xs text-white/35">
                          {megaHelpText}{' '}
                          <span className="text-white/60 font-medium">{megaHelpLinkText}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSubmenuNavigation(megaButtonUrl)
                          }}
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white hover:text-primary hover:gap-2.5 transition-all duration-200"
                        >
                          {megaButtonLabel}
                          <span aria-hidden>→</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}
