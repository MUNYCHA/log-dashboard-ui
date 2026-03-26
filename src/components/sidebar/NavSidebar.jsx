import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore, { selectTheme, selectDarkMode } from '../../store/useAppStore'

const MotionSpan = motion.span

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    to: '/logs',
    label: 'Logs',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    to: '/storage',
    label: 'Storage',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3v10c0 1.657-3.582 3-8 3s-8-1.343-8-3V7z M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3 M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3" />
    ),
  },
]

const SETTINGS_ITEM = {
  to: '/settings',
  label: 'Settings',
  icon: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
}

const ALL_NAV_ITEMS = [...NAV_ITEMS, SETTINGS_ITEM]

function NavItem({ item, collapsed, ghostBtn, activeNavTone }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 overflow-hidden
         ${collapsed ? 'h-10 w-10 justify-center mx-auto' : 'px-4 py-2.5 w-full'}
         ${isActive ? activeNavTone : ghostBtn}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <MotionSpan
              layoutId="nav-selection-indicator"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-current"
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            />
          )}
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {item.icon}
          </svg>
          {!collapsed && (
            <span className="text-[13.5px] font-medium">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function NavSidebar() {
  const theme = useAppStore(selectTheme)
  const darkMode = useAppStore(selectDarkMode)
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
  const [searchTerm, setSearchTerm] = useState('')

  const isSearching = searchTerm.trim().length > 0
  const filteredItems = isSearching
    ? ALL_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : NAV_ITEMS

  const ghostBtn = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'

  const activeNavTone = darkMode
    ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]'
    : 'bg-[#E8F0FE] text-[#1A73E8]'

  return (
    <div className={`
      hidden md:flex flex-col flex-shrink-0 ${theme.sidebar}
      rounded-2xl overflow-hidden
      transition-[width] duration-200
      ${collapsed ? 'w-14' : 'w-56'}
    `}>
      {/* Header: hamburger collapse toggle */}
      <div className={`pt-3 pb-2 flex-shrink-0 flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'}`}>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Search box */}
      <div className={`flex-shrink-0 ${collapsed ? 'flex justify-center px-2 pb-2' : 'px-3 pb-3'}`}>
        {collapsed ? (
          <button
            onClick={toggleCollapsed}
            title="Search — click to expand"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <svg
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.textMuted}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu"
              aria-label="Search topics"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ease-in-out ${
                darkMode
                  ? 'bg-[#303134] border-[#5F6368] text-[#E8EAED] placeholder:text-[#80868B] focus:ring-[#8AB4F8]/20 focus:border-[#8AB4F8]'
                  : 'bg-[#F1F3F4] border-[#DADCE0] text-[#202124] placeholder:text-[#5F6368] focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]'
              }`}
            />
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} ghostBtn={ghostBtn} activeNavTone={activeNavTone} />
        ))}
      </nav>

      {/* Settings pinned to bottom */}
      {!isSearching && (
        <div className="flex-shrink-0 px-2 pb-3">
          <div className={`mb-2 border-t ${theme.border}`} />
          <NavItem item={SETTINGS_ITEM} collapsed={collapsed} ghostBtn={ghostBtn} activeNavTone={activeNavTone} />
        </div>
      )}
    </div>
  )
}
