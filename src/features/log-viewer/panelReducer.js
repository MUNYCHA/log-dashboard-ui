// ── Panel-local state ────────────────────────────────────────────────────────
// All fields here reset automatically on topic switch via RESET_TOPIC.
// Adding a new field here is sufficient — no separate reset list to maintain.
export const initialPanelState = (topic) => ({
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
  topicMeta: null,
});

export function panelReducer(state, action) {
  switch (action.type) {
    case 'RESET_TOPIC': return initialPanelState(action.topic);
    case 'PATCH': return { ...state, ...action.payload };
    default: return state;
  }
}
