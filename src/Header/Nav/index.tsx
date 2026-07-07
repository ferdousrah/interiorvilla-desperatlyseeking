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

// Mega menu structure matching the original frontend exactly
const megaMenuSections = [
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
  data: _data,
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

  const navItems = defaultNavItems

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

  // Animation variants
  const submenuVariants = {
    hidden: { opacity: 0, y: -15, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1] as const,
        when: 'beforeChildren' as const,
        staggerChildren: 0.07,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
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

              {/* Mega Menu */}
              <AnimatePresence>
                {item.hasMegaMenu && hoveredMenu === item.name && (
                  <motion.div
                    variants={submenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    role="menu"
                    aria-label="Services mega menu"
                    className="fixed left-0 right-0 bg-white shadow-2xl overflow-hidden z-[999] border-t border-gray-200 rounded-xl"
                    style={{
                      maxHeight: '70vh',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1)',
                      top: isScrolled && isScrollingUp ? '60px' : '70px',
                      width: '52vw',
                      margin: '0 auto',
                    }}
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="w-full px-0">
                      <div className="max-w-8xl mx-auto">
                        <div className="flex gap-0">
                          {megaMenuSections.map((section, sectionIndex) => (
                            <motion.div
                              key={sectionIndex}
                              variants={itemVariants}
                              transition={{ delay: sectionIndex * 0.1 }}
                              className="p-6 group transition-all duration-300 border-r border-gray-100 last:border-r-0 hover:shadow-md hover:scale-[1.01] rounded-lg flex flex-col"
                              style={{
                                backgroundColor: section.bgColor,
                                width: sectionIndex === 0 ? '27%' : sectionIndex === 1 ? '48%' : '25%',
                              }}
                            >
                              <div className="flex flex-col mb-4">
                                <Link
                                  href={section.viewAllHref}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleSubmenuNavigation(section.viewAllHref)
                                  }}
                                  className="flex items-center text-xl font-semibold transition-all duration-300 relative"
                                  style={{ color: section.color }}
                                >
                                  {section.title}
                                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full" />
                                </Link>
                                <p className="text-sm text-gray-500 mt-2">{section.description}</p>
                              </div>

                              <div
                                className={`space-y-1 ${sectionIndex === 1 ? 'commercial-column-scroll' : ''}`}
                                style={{
                                  maxHeight: sectionIndex === 1 ? 'calc(70vh - 120px)' : 'auto',
                                  overflowY: sectionIndex === 1 ? 'auto' : 'visible',
                                }}
                              >
                                {section.links.map((link, linkIndex) => (
                                  <motion.button
                                    key={linkIndex}
                                    role="menuitem"
                                    variants={itemVariants}
                                    transition={{ delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleSubmenuNavigation(link.href)
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 rounded-md text-sm text-gray-600 hover:text-primary hover:bg-white/50 transition-all duration-300 group text-left"
                                  >
                                    <span className="relative z-10">{link.name}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-[#626161]">
                              Need help choosing? <span className="text-primary font-medium">Contact our experts</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSubmenuNavigation('/contact')
                              }}
                              className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                            >
                              Get Consultation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}
