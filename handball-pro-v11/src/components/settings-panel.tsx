import { useState } from 'react';
import { useMatchStore } from '@/lib/store';
import { cn } from '@/lib/cn';

/**
 * SETTINGS PANEL — toggles para modos experimentales.
 *
 * Vive como botón "⚙️ Modos" en la sidebar; al click se abre un popover
 * mini con los switches. Mantenemos esto separado del flujo principal porque
 * son features opt-in para usuarios avanzados.
 */
export const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const superpowerMode = useMatchStore((s) => s.superpowerMode);
  const setSuperpowerMode = useMatchStore((s) => s.setSuperpowerMode);
  const uiProMax = useMatchStore((s) => s.uiProMax);
  const setUiProMax = useMatchStore((s) => s.setUiProMax);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          (superpowerMode || uiProMax)
            ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30'
            : 'text-muted-fg hover:text-fg hover:bg-surface-2',
        )}
      >
        <span>⚙️</span>
        <span className="flex-1 text-left">Modos</span>
        {(superpowerMode || uiProMax) && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ON
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 z-40 rounded-md border border-border bg-surface shadow-xl p-2 space-y-1">
          <ToggleRow
            id="superpower"
            label="Superpower Mode"
            icon="⚡"
            description="Atajos y panel denso en live match"
            checked={superpowerMode}
            onChange={setSuperpowerMode}
          />
          <ToggleRow
            id="ui-pro-max"
            label="UI Pro Max"
            icon="✨"
            description="Tema premium · animaciones · más densidad"
            checked={uiProMax}
            onChange={setUiProMax}
          />
          <p className="text-[9px] text-muted-fg/80 leading-snug px-1 pt-1">
            Modos experimentales. Si algo se ve raro, desactivá y reportá.
          </p>
        </div>
      )}
    </div>
  );
};

const ToggleRow = ({
  id, label, icon, description, checked, onChange,
}: {
  id: string;
  label: string;
  icon: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label
    htmlFor={id}
    className="flex items-start gap-2 px-2 py-2 rounded-md hover:bg-surface-2 cursor-pointer"
  >
    <span className="text-base leading-none pt-0.5">{icon}</span>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-fg">{label}</div>
      <div className="text-[10px] text-muted-fg leading-tight mt-0.5">{description}</div>
    </div>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 rounded border-border accent-primary cursor-pointer"
    />
  </label>
);
