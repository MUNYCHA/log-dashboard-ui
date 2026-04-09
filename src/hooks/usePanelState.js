import { useState, useReducer, useEffect, useCallback } from 'react';

// ── Panel-local state ────────────────────────────────────────────────────────
// All fields here reset automatically on topic switch via RESET_TOPIC.
// Adding a new field here is sufficient — no separate reset list to maintain.
const initialPanelState = (topic) => ({
  frozenLogs: null,
  frozenTopic: null,
  logSearchTerm: "",
  debouncedSearch: "",
  autoScroll: true,
  showServerDropdown: false,
  showPathDropdown: false,
  showMobileServerDropdown: false,
  showMobilePathDropdown: false,
  serverSearchTerm: "",
  pathSearchTerm: "",
  pathForTopic: { topic, path: null },
  isMobileMenuOpen: false,
  mobileMenuReady: false,
  keywords: [],
  keywordInput: "",
  debouncedKeywordInput: "",
  keywordMode: "or",
  timeRange: "all",
  customRangeMs: 0,
  atTop: true,
  atBottom: true,
  downloadError: null,
});

function panelReducer(state, action) {
  switch (action.type) {
    case 'RESET_TOPIC': return initialPanelState(action.topic);
    case 'PATCH': return { ...state, ...action.payload };
    default: return state;
  }
}

const usePanelState = (selectedTopic) => {
  const [state, dispatch] = useReducer(panelReducer, undefined, () => initialPanelState(selectedTopic));
  const { logSearchTerm, keywordInput, isMobileMenuOpen } = state;

  const [timestampGen, setTimestampGen] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Bumps timestamp counter every 5s so LogEntry relative times stay fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampGen((g) => g + 1);
      setNowMs(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Debounce search for server-side filter dispatch
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'PATCH', payload: { debouncedSearch: logSearchTerm } }), 300);
    return () => clearTimeout(t);
  }, [logSearchTerm]);

  // Debounce keyword input so filter and pending chip stay in sync
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'PATCH', payload: { debouncedKeywordInput: keywordInput } }), 300);
    return () => clearTimeout(t);
  }, [keywordInput]);

  // 300ms guard before mobile menu content becomes interactive (prevents double-tap)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const id = setTimeout(() => dispatch({ type: 'PATCH', payload: { mobileMenuReady: true } }), 300);
    return () => {
      clearTimeout(id);
      dispatch({ type: 'PATCH', payload: { mobileMenuReady: false } });
    };
  }, [isMobileMenuOpen]);

  const handleTimeRangeChange = useCallback((value, ms = 0) => {
    dispatch({ type: 'PATCH', payload: { timeRange: value, customRangeMs: ms } });
    if (value !== 'all') setNowMs(Date.now());
  }, []);

  return { state, dispatch, timestampGen, nowMs, handleTimeRangeChange };
};

export default usePanelState;
