// Palette pulled from the dataviz skill's validated default (light mode).
// Categorical slots are assigned in fixed order — never re-cycled per chart.
export const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
];

export const SEQUENTIAL_BLUE = {
  100: '#cde2fb',
  300: '#6da7ec',
  500: '#256abf',
  700: '#0d366b',
};

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
};

// Machine/alert status → semantic color + Tailwind badge classes
export const MACHINE_STATUS_STYLES = {
  running: { color: STATUS.good, badge: 'bg-green-100 text-green-800 border-green-200' },
  idle: { color: STATUS.warning, badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  down: { color: STATUS.critical, badge: 'bg-red-100 text-red-800 border-red-200' },
};

export const SEVERITY_STYLES = {
  low: { color: STATUS.good, badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { color: STATUS.warning, badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  high: { color: STATUS.serious, badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  critical: { color: STATUS.critical, badge: 'bg-red-100 text-red-800 border-red-200' },
};
