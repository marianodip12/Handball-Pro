import { useMemo, useState } from 'react';
import { CourtView } from '@/components/handball/court-view';
import { GoalGrid } from '@/components/handball/goal-grid';
import { useT } from '@/lib/i18n';
import type { CourtZoneId, GoalZoneId } from '@/domain/types';
import { cn } from '@/lib/cn';

type Outcome = 'goal' | 'saved' | 'miss' | 'post';

interface DemoShot {
  id: number;
  goalZone: GoalZoneId;
  courtZone: CourtZoneId;
  outcome: Outcome;
}

// Pre-loaded sample data so the heatmap looks alive on first load
const SEED_SHOTS: DemoShot[] = [
  { id: 1, goalZone: 'tl', courtZone: 'lateral_left',  outcome: 'goal' },
  { id: 2, goalZone: 'br', courtZone: 'extreme_right', outcome: 'goal' },
  { id: 3, goalZone: 'mc', courtZone: 'center_above',  outcome: 'saved' },
  { id: 4, goalZone: 'tr', courtZone: 'lateral_right', outcome: 'goal' },
  { id: 5, goalZone: 'bl', courtZone: 'near_left',     outcome: 'miss' },
  { id: 6, goalZone: 'tc', courtZone: 'near_center',   outcome: 'goal' },
  { id: 7, goalZone: 'ml', courtZone: 'extreme_left',  outcome: 'saved' },
  { id: 8, goalZone: 'br', courtZone: 'lateral_right', outcome: 'post' },
];

const OUTCOME_COLORS: Record<Outcome, string> = {
  goal:  '#22c55e',
  saved: '#3b82f6',
  miss:  '#ef4444',
  post:  '#f59e0b',
};

export const InteractiveDemo = () => {
  const t = useT();
  const [shots, setShots] = useState<DemoShot[]>(SEED_SHOTS);
  const [draftGoal, setDraftGoal] = useState<GoalZoneId | null>(null);
  const [draftCourt, setDraftCourt] = useState<CourtZoneId | null>(null);

  const canPickOutcome = draftGoal !== null && draftCourt !== null;

  const stats = useMemo(() => {
    const total = shots.length;
    const goals = shots.filter((s) => s.outcome === 'goal').length;
    const pct = total > 0 ? Math.round((goals / total) * 100) : 0;
    return { total, goals, pct };
  }, [shots]);

  const handleOutcome = (outcome: Outcome) => {
    if (!draftGoal || !draftCourt) return;
    setShots((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        goalZone: draftGoal,
        courtZone: draftCourt,
        outcome,
      },
    ]);
    setDraftGoal(null);
    setDraftCourt(null);
  };

  const handleReset = () => {
    setShots(SEED_SHOTS);
    setDraftGoal(null);
    setDraftCourt(null);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 md:p-6 space-y-5">
      {/* Status row */}
      <div className="grid grid-cols-3 gap-2">
        <DemoStat label={t.landing_demo_summary_shots} value={stats.total} color="#94a3b8" />
        <DemoStat label={t.landing_demo_summary_goals} value={stats.goals} color="#22c55e" />
        <DemoStat label={t.landing_demo_summary_pct}   value={`${stats.pct}%`} color="#3b82f6" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Goal zone */}
        <section>
          <p className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">
            {t.landing_demo_goal_label}
          </p>
          <div className="max-w-[260px] mx-auto">
            <GoalGrid
              selected={draftGoal}
              onSelect={(z) => setDraftGoal(draftGoal === z ? null : z)}
            />
          </div>
        </section>

        {/* Court zone */}
        <section>
          <p className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">
            {t.landing_demo_court_label}
          </p>
          <div className="max-w-[280px] mx-auto">
            <CourtView
              selectedZone={draftCourt}
              onZoneSelect={(z) => setDraftCourt(draftCourt === z ? null : z)}
            />
          </div>
        </section>
      </div>

      {/* Outcome row — disabled until both zones picked */}
      <section>
        <p className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">
          {t.landing_demo_outcome_label}
        </p>
        <div className="grid grid-cols-4 gap-2">
          <OutcomeBtn label={t.landing_demo_outcome_goal}  color={OUTCOME_COLORS.goal}  disabled={!canPickOutcome} onClick={() => handleOutcome('goal')} />
          <OutcomeBtn label={t.landing_demo_outcome_saved} color={OUTCOME_COLORS.saved} disabled={!canPickOutcome} onClick={() => handleOutcome('saved')} />
          <OutcomeBtn label={t.landing_demo_outcome_miss}  color={OUTCOME_COLORS.miss}  disabled={!canPickOutcome} onClick={() => handleOutcome('miss')} />
          <OutcomeBtn label={t.landing_demo_outcome_post}  color={OUTCOME_COLORS.post}  disabled={!canPickOutcome} onClick={() => handleOutcome('post')} />
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-muted-fg hover:text-fg transition-colors px-3 py-1.5 rounded border border-border bg-surface-2"
        >
          ↺ {t.landing_demo_reset}
        </button>
      </div>
    </div>
  );
};

const DemoStat = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className="rounded-md border border-border bg-surface-2/40 p-3 text-center">
    <div className="font-mono text-2xl font-semibold tabular leading-none" style={{ color }}>
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-widest text-muted-fg mt-1.5">{label}</div>
  </div>
);

const OutcomeBtn = ({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'h-11 rounded-md border text-xs font-medium transition-all',
      disabled
        ? 'border-border bg-surface-2/30 text-muted-fg/60 cursor-not-allowed'
        : 'hover:scale-[1.02] active:scale-[0.98] text-white',
    )}
    style={!disabled ? { background: color, borderColor: color } : undefined}
  >
    {label}
  </button>
);
