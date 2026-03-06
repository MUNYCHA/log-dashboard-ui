export const styles = {
  light: {
    background: "bg-gray-50",
    sidebar: "bg-white border-gray-200",
    header: "bg-white/80 border-gray-200",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    input: "bg-white border-gray-400 text-gray-900 placeholder-gray-500 shadow-sm", // Made border darker, added shadow
    card: "bg-white",
    hover: "hover:bg-gray-100", // Made hover more visible
    selected: "bg-blue-50 border-l-4 border-l-blue-500",
    logEntry: "hover:bg-gray-100 border-gray-200", // Made hover more visible
    statusBar: "bg-white/80 border-gray-200",
    scrollbar: "scrollbar-thumb-gray-300 scrollbar-track-gray-100",
    serverBadge: "bg-gray-200 text-gray-700",
    serverBadgeHover: "hover:bg-gray-300",
    dropdownItemSelected: "bg-blue-500/20 text-blue-600",
    // New specific styles for better contrast
    inputFocus: "ring-2 ring-blue-500/50 border-blue-500", // Focus ring for inputs
    button: "bg-gray-200 hover:bg-gray-300 text-gray-700", // Button styles
    buttonPrimary: "bg-blue-500 hover:bg-blue-600 text-white", // Primary button
  },
  dark: {
    background: "bg-[#0B1120]",
    sidebar: "bg-[#0F172A] border-gray-800/50",
    header: "bg-[#0F172A]/80 border-gray-800/50",
    text: "text-gray-200",
    textSecondary: "text-gray-300",
    textMuted: "text-gray-500",
    border: "border-gray-800/50",
    input: "bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500",
    card: "bg-[#0F172A]",
    hover: "hover:bg-gray-800/30",
    selected: "bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-l-green-400",
    logEntry: "hover:bg-gray-800/30 border-gray-800/30",
    statusBar: "bg-[#0F172A]/80 border-gray-800/50",
    scrollbar: "scrollbar-thumb-gray-700 scrollbar-track-gray-800/30",
    serverBadge: "bg-gray-800 text-gray-300",
    serverBadgeHover: "hover:bg-gray-700",
    dropdownItemSelected: "bg-green-500/20 text-green-400",
    inputFocus: "ring-2 ring-green-500/50 border-green-500/50",
    button: "bg-gray-700 hover:bg-gray-600 text-gray-200",
    buttonPrimary: "bg-green-500 hover:bg-green-600 text-white",
  }
};