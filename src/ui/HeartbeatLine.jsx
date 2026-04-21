import React from 'react';

const HeartbeatLine = ({ rate, darkMode }) => {
  const dur  = rate > 20 ? '0.4s' : rate > 10 ? '0.7s' : rate > 3 ? '1.3s' : '2.2s';
  const color = darkMode ? '#6b7280' : '#9ca3af'; // gray-500 / gray-400
  const pts = "0,8 5,8 8,3 11,13 14,5 17,8 24,8 29,8 32,3 35,13 38,5 41,8 48,8 53,8 56,3 59,13 62,5 65,8 72,8";
  return (
    <svg key={dur} width="48" height="16" viewBox="0 0 48 16" style={{ overflow: 'hidden', flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="translate" from="0,0" to="-24,0" dur={dur} repeatCount="indefinite" />
      </polyline>
    </svg>
  );
};

export default HeartbeatLine;
