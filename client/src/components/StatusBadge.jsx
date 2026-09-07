import { MACHINE_STATUS_STYLES, SEVERITY_STYLES } from '../theme/colors.js';

export function MachineStatusBadge({ status }) {
  const style = MACHINE_STATUS_STYLES[status] || MACHINE_STATUS_STYLES.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style.badge}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style.badge}`}>
      {severity}
    </span>
  );
}
