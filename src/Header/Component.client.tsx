'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'
import { MobileSidebar } from './Nav/MobileSidebar'

interface HeaderClientProps {
  data: Header
  /** Site name from Site Settings — used for aria labels and the text-logo fallback */
  siteName?: string
  /** Admin-uploaded logo URL from Site Settings; null falls back to a text logo */
  logoUrl?: string | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({
  data,
  siteName = 'Desperately Seeking',
  logoUrl,
}) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const rafId = useRef<number | null>(null)
  const cachedScrollY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  // Enhanced header style updates
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !menuContainerRef.current) return

    const header = headerRef.current
    const logo = logoRef.current
    const menuContainer = menuContainerRef.current

    const shouldTransform = isScrolled && isScrollingUp

    requestAnimationFrame(() => {
      header.style.setProperty('--header-height', shouldTransform ? '60px' : '90px')
      header.style.setProperty('--header-bg', shouldTransform ? 'rgba(27, 27, 27, 0.95)' : 'transparent')
      header.style.setProperty('--header-backdrop', shouldTransform ? 'blur(20px)' : 'none')
      header.style.setProperty('--header-shadow', shouldTransform ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none')
      header.style.setProperty(
        '--header-transform',
        shouldTransform ? 'translateY(0)' : isScrolled ? 'translateY(-100%)' : 'translateY(0)'
      )
      logo.style.setProperty('--logo-scale', shouldTransform ? '0.8' : '1')
      menuContainer.style.setProperty('--menu-height', shouldTransform ? '50px' : '60px')
      menuContainer.style.setProperty('--menu-padding', shouldTransform ? '0 16px' : '0 16px')
    })
  }, [isScrolled, isScrollingUp])

  // Scroll listener with RAF optimization
  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) return
      rafId.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY
        if (Math.abs(scrollPosition - cachedScrollY.current) < 5) {
          rafId.current = null
          return
        }
        const scrollDirection = scrollPosition > lastScrollY.current ? 'down' : 'up'
        const shouldBeScrolled = scrollPosition > 100

        if (scrollDirection === 'up' && scrollPosition > 100) {
          setIsScrollingUp(true)
        } else if (scrollDirection === 'down') {
          setIsScrollingUp(false)
        }
        if (shouldBeScrolled !== isScrolled) setIsScrolled(shouldBeScrolled)

        lastScrollY.current = scrollPosition
        cachedScrollY.current = scrollPosition
        rafId.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isScrolled])

  const isHomePage = pathname === '/'

  return (
    <>
      <header
        ref={headerRef}
        className={`${
          isScrolled && isScrollingUp ? 'fixed top-0 left-0 w-full z-[999]' : 'absolute w-full top-[22px] z-[999]'
        } transition-all duration-700 ease-out`}
        style={{
          height: isScrolled && isScrollingUp ? '60px' : '90px',
        }}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container mx-auto px-4 relative flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" aria-label={`${siteName} Home`} className="relative z-10">
            {logoUrl ? (
              <img
                ref={logoRef}
                className="w-36 sm:w-44 md:w-52 h-auto object-contain z-10 cursor-pointer logo-container relative"
                alt={siteName}
                src={logoUrl}
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
                  transform: `scale(var(--logo-scale, 1))`,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ) : (
              <span
                ref={logoRef as unknown as React.RefObject<HTMLSpanElement>}
                className="block font-medium text-white text-lg sm:text-xl md:text-2xl tracking-wide whitespace-nowrap logo-container relative z-10 cursor-pointer"
                style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  transform: `scale(var(--logo-scale, 1))`,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {siteName}
              </span>
            )}
          </Link>

          {/* Menu Container */}
          <div
            ref={menuContainerRef}
            className={`flex items-center menu-container ${
              !(isScrolled && isScrollingUp) && 'bg-black/30 rounded-[50px] backdrop-blur-[10px] px-4'
            }`}
            style={{
              minWidth: 'fit-content',
              backgroundColor: isScrolled && isScrollingUp ? 'rgba(27, 27, 27, 0.95)' : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: isScrolled && isScrollingUp ? 'blur(20px)' : 'blur(10px)',
              boxShadow: isScrolled && isScrollingUp ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              height: 'var(--menu-height, 60px)',
              padding: 'var(--menu-padding, 0 16px)',
            }}
          >
            <HeaderNav
              data={data}
              isHomePage={isHomePage}
              isScrolled={isScrolled}
              isScrollingUp={isScrollingUp}
              onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isMobileMenuOpen={isMobileMenuOpen}
            />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Rendered outside header to avoid transform issues */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        siteName={siteName}
        logoUrl={logoUrl}
        data={data}
      />

      <style jsx global>{`
        header {
          height: var(--header-height, 90px);
          background-color: var(--header-bg, transparent);
          backdrop-filter: var(--header-backdrop, none);
          box-shadow: var(--header-shadow, none);
          transform: var(--header-transform, translateY(0));
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-container {
          transform: scale(var(--logo-scale, 1));
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-container {
          height: var(--menu-height, 60px);
          padding: var(--menu-padding, 0 16px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Commercial column scrollbar */
        .commercial-column-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(238, 84, 40, 0.3) transparent;
        }
        .commercial-column-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .commercial-column-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .commercial-column-scroll::-webkit-scrollbar-thumb {
          background: rgba(238, 84, 40, 0.3);
          border-radius: 3px;
        }
        .commercial-column-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(238, 84, 40, 0.5);
        }

        /* Mobile sidebar submenu scrollbar */
        .sidebar-submenu-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.3) transparent;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </>
  )
}
