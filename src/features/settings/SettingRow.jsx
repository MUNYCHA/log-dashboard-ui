import React from 'react';

const SettingRow = ({ icon, title, description, control, darkMode, last }) => (
  <div className={`flex items-center justify-between gap-4 py-5 ${
    !last ? `border-b ${darkMode ? 'border-[#2A2B2E]' : 'border-[#F1F3F4]'}` : ''
  }`}>
    <div className="flex min-w-0 items-center gap-3.5">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
        darkMode ? 'bg-[#2A2B2E] text-[#9AA0A6]' : 'bg-[#F1F3F4] text-[#5F6368]'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-snug">{title}</div>
        {description && (
          <div className={`mt-0.5 text-[12px] leading-snug ${darkMode ? 'text-[#9AA0A6]' : 'text-[#80868B]'}`}>{description}</div>
        )}
      </div>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export default SettingRow;
