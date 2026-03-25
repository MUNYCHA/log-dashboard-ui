import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

const MotionSpan = motion.span

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
]

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0
  const itemTone = isSelected
    ? (darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]')
    : (darkMode
      ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
      : 'text-[#3C4043] hover:text-[#202124] hover:bg-[#F1F3F4]')

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`relative w-full overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="topic-selection-indicator"
          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isActive ? 'bg-emerald-500' : darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]'
        }`} />
        <span className="truncate text-[13.5px] font-medium">{topic}</span>
        {isActive && (
          <span className={`ml-auto text-[11px] font-mono tabular-nums flex-shrink-0 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {logRate}/s
          </span>
        )}
      </div>
    </button>
  )
})

export default function TopicSidebar({ topics, logRates, selectedTopic, onTopicSelect, theme, darkMode, mobileOpen, onMobileClose }) {
  const [topicSortMode, setTopicSortMode] = useState('asc')
  const [topicSearchTerm, setTopicSearchTerm] = useState('')

  const handleSelect = (topic) => {
    onTopicSelect(topic)
    onMobileClose?.()
  }

  const sortedTopics = useMemo(() => {
    const filtered = topics.filter((t) => t.toLowerCase().includes(topicSearchTerm.toLowerCase()))
    if (topicSortMode === 'asc') return filtered.sort((a, b) => a.localeCompare(b))
    if (topicSortMode === 'desc') return filtered.sort((a, b) => b.localeCompare(a))
    return filtered.sort((a, b) => {
      const rateA = logRates?.[a] || 0
      const rateB = logRates?.[b] || 0
      if (rateA > 0 && rateB === 0) return -1
      if (rateA === 0 && rateB > 0) return 1
      if (rateA !== rateB) return rateB - rateA
      return a.localeCompare(b)
    })
  }, [topics, topicSearchTerm, topicSortMode, logRates])

  const activeCount = useMemo(
    () => topics.filter((t) => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  )

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <div className={`
        flex flex-col flex-shrink-0 ${theme.sidebar}
        fixed inset-y-0 right-0 z-50 w-72
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
        md:relative md:inset-auto md:translate-x-0 md:z-auto md:transition-[width] md:w-60 lg:md:w-68
        md:rounded-2xl md:overflow-hidden
      `}>

        {/* Mobile close button */}
        <div className="md:hidden flex justify-end pt-3 px-3 pb-1 flex-shrink-0">
          <button
            onClick={onMobileClose}
            aria-label="Close topics"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${
              darkMode
                ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4 pb-3 flex-shrink-0 hidden md:block">
          <div className="flex items-center gap-2.5">
            <h2 className={`text-[13px] font-semibold ${theme.text}`}>Topics</h2>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
              darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {activeCount}/{topics.length}
            </span>
          </div>
        </div>

        {/* Mobile header with title + count */}
        <div className="md:hidden px-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className={`text-[13px] font-semibold ${theme.text}`}>Topics</h2>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
              darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {activeCount}/{topics.length}
            </span>
          </div>
        </div>

        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <svg
              className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search topics"
              className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ease-in-out ${
                darkMode
                  ? 'bg-[#303134] border-[#5F6368] text-[#E8EAED] placeholder:text-[#80868B] focus:ring-[#8AB4F8]/20 focus:border-[#8AB4F8]'
                  : 'bg-[#F1F3F4] border-[#DADCE0] text-[#202124] placeholder:text-[#5F6368] focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]'
              }`}
              value={topicSearchTerm}
              onChange={(e) => setTopicSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 pb-3 flex-shrink-0">
          <div className={`grid grid-cols-3 gap-0.5 rounded-2xl border p-1 ${
            darkMode ? 'border-[#303134] bg-[#303134]' : 'border-[#E8EAED] bg-[#F1F3F4]'
          }`}>
            {TOPIC_SORT_OPTIONS.map((option) => {
              const isSelected = option.value === topicSortMode
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTopicSortMode(option.value)}
                  className={`w-full rounded-xl py-1.5 text-center text-[12px] font-medium transition-all duration-150 ease-in-out active:scale-95
                    ${isSelected
                      ? darkMode
                        ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]'
                        : 'bg-white text-[#1A73E8] shadow-sm'
                      : darkMode
                        ? 'text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]'
                        : 'text-[#5F6368] hover:bg-white hover:text-[#202124]'
                    }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-3 pb-3`}>
          <div className="flex flex-col gap-0.5">
            {sortedTopics.map((topic) => (
              <TopicItem
                key={topic}
                topic={topic}
                isSelected={selectedTopic === topic}
                onTopicSelect={handleSelect}
                logRate={logRates?.[topic] || 0}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
