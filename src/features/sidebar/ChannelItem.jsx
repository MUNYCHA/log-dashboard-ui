import React from 'react';
import { motion } from 'framer-motion';

const MotionSpan = motion.span;

const ChannelItem = React.memo(({ channel, isSelected, onChannelSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode
      ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]'
      : 'bg-[#E8F0FE] text-[#1A73E8]')
    : (darkMode
      ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
      : 'text-[#3C4043] hover:text-[#202124] hover:bg-[#F1F3F4]');

  return (
    <button
      onClick={() => onChannelSelect(channel)}
      className={`relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-left transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="channel-selection-indicator"
          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isActive
            ? 'bg-emerald-500'
            : darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]'
        }`} />
        <span className="truncate text-[13.5px] font-medium">
          {channel}
        </span>
        {isActive && (
          <span className={`ml-auto text-[11px] font-mono tabular-nums flex-shrink-0 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {logRate}/s
          </span>
        )}
      </div>
    </button>
  );
});

export default ChannelItem;
