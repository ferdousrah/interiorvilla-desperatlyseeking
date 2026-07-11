'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X,
  ChevronDown,
  Home as HomeIcon,
  User,
  Briefcase,
  FolderOpen,
  BookOpen,
  Mail,
} from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  siteName?: string
  logoUrl?: string | null
  data?: HeaderType | null
}

// Default mega menu structure — used when none is configured in the admin panel
const defaultMegaMenuSections = [
  {
    title: 'Residential',
    description: 'Transform your home into a sanctuary',
    color: '#75BF44',
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
    color: '#EE5428',
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
    color: '#4F46E5',
    links: [],
    viewAllHref: '/services/architectural-consultancy',
  },
]

// Default navigation items — used when none are configured in the admin panel
const defaultNavItems = [
  { name: 'Home', icon: HomeIcon, href: '/' },
  { name: 'About Us', icon: User, href: '/about' },
  { name: 'Services', icon: Briefcase, href: '#', hasMegaMenu: true },
  { name: 'Portfolio', icon: FolderOpen, href: '/portfolio' },
  { name: 'Blog', icon: BookOpen, href: '/blog' },
  { name: 'Contact Us', icon: Mail, href: '/contact' },
]

// Per-index icon fallbacks for admin-configured menu items
const fallbackIcons = [HomeIcon, User, Briefcase, FolderOpen, BookOpen, Mail]

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  siteName = 'Desperately Seeking',
  logoUrl,
  data,
}) => {
  // Admin-configured menu (Header global) with built-in fallbacks
  const navItems =
    data?.menuItems && data.menuItems.length > 0
      ? data.menuItems.map((item, i) => ({
          name: item.label,
          icon: fallbackIcons[i % fallbackIcons.length]!,
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
            links: (section.links || []).map((l) => ({ name: l.label, href: l.url })),
            viewAllHref: section.viewAllUrl || fallback.viewAllHref,
          }
        })
      : defaultMegaMenuSections
  const pathname = usePathname()
  const router = useRouter()
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmenuNavigation = (href: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    router.push(href)
    onClose()
  }

  const sidebarVariants = {
    closed: { x: '-100%' },
    open: { x: '0%' },
  }

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  }

  const menuItemVariants = {
    closed: { x: -50, opacity: 0 },
    open: (i: number) => ({ x: 0, opacity: 1, transition: { delay: i * 0.1 } }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] z-[999] lg:hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <Link href="/" onClick={onClose}>
                {logoUrl ? (
                  <img className="w-40 h-8 object-contain" alt={siteName} src={logoUrl} />
                ) : (
                  <span className="font-medium text-white text-lg tracking-wide whitespace-nowrap">
                    {siteName}
                  </span>
                )}
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white hover:bg-gray-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col p-6 space-y-2 overflow-y-auto h-[calc(100%-80px)] pb-20">
              {navItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    className="relative"
                  >
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
                        pathname === item.href ? 'bg-primary text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                      onClick={(e) => {
                        if (item.hasMegaMenu) {
                          e.preventDefault()
                          setExpandedSubmenu(expandedSubmenu === item.name ? null : item.name)
                        } else {
                          handleSubmenuNavigation(item.href)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-700/50">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      {item.hasMegaMenu && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            expandedSubmenu === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>

                    <AnimatePresence>
                      {item.hasMegaMenu && expandedSubmenu === item.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden ml-4 mt-2 space-y-4"
                        >
                          {megaMenuSections.map((section, i) => (
                            <div key={i} className="p-4 rounded-xl bg-gray-800/40">
                              <h4 className="font-semibold" style={{ color: section.color }}>
                                {section.title}
                              </h4>
                              <p className="text-xs text-gray-400">{section.description}</p>
                              <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto sidebar-submenu-scroll">
                                {section.links.map((link, j) => (
                                  <button
                                    key={j}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleSubmenuNavigation(link.href)
                                    }}
                                    className="block w-full text-left px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-700/40"
                                  >
                                    {link.name}
                                  </button>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleSubmenuNavigation(section.viewAllHref)
                                  }}
                                  className="block w-full text-left px-3 py-2 text-sm rounded-md font-medium"
                                  style={{ color: section.color }}
                                >
                                  View All Services →
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
