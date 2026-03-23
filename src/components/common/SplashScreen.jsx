import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getInitialDark = () => {
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const FILL_DURATION = 1.8; // seconds the bar takes to fill

const SplashScreen = ({ onDone }) => {
  const dark = getInitialDark();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), FILL_DURATION * 1000);
    const t2 = setTimeout(() => onDone(),          FILL_DURATION * 1000 + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
            dark ? 'bg-[#0F0F0F]' : 'bg-[#F8F9FA]'
          }`}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.4, ease: 'easeInOut' } }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.35, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
          >
            <div className={`flex h-[88px] w-[88px] items-center justify-center rounded-[24px] ${
              dark
                ? 'bg-[#1E1E1E] border border-[#3C4043]'
                : 'bg-white border border-[#E8EAED] shadow-[0_2px_12px_rgba(60,64,67,0.12)]'
            }`}>
              <span className={`font-mono text-[34px] font-bold select-none leading-none ${
                dark ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'
              }`}>
                &gt;_
              </span>
            </div>
          </motion.div>

          {/* Loading bar — fills in sync with splash duration */}
          <div className={`mt-8 w-36 h-1 rounded-full overflow-hidden ${
            dark ? 'bg-[#2C2C2C]' : 'bg-[#E8EAED]'
          }`}>
            <motion.div
              className={`h-full rounded-full ${dark ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: FILL_DURATION, ease: 'easeInOut', delay: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
