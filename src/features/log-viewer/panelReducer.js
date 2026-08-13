// ── Panel-local state ────────────────────────────────────────────────────────
// All fields here reset automatically on channel switch via RESET_CHANNEL.
// Adding a new field here is sufficient — no separate reset list to maintain.
export const initialPanelState = (channel) => ({
  frozenLogs: null,
  frozenChannel: null,
  logSearchTerm: "",
  debouncedSearch: "",
  autoScroll: true,
  showServerDropdown: false,
  showPathDropdown: false,
  showMobileServerDropdown: false,
  showMobilePathDropdown: false,
  serverSearchTerm: "",
  pathSearchTerm: "",
  pathForChannel: { channel, path: null },
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
  channelMeta: null,
});

export function panelReducer(state, action) {
  switch (action.type) {
    case 'RESET_CHANNEL': return initialPanelState(action.channel);
    case 'PATCH': return { ...state, ...action.payload };
    default: return state;
  }
}
