import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

export type Plan = 'free' | 'pro' | 'club' | 'elite';

export interface PlanInfo {
  plan: Plan;
  isAdmin: boolean;
  matchCount: number;
  matchLimit: number; // -1 = ilimitado
  canCreateMatch: boolean;
  loading: boolean;
}

const DEFAULT_PLAN_INFO: PlanInfo = {
  plan: 'free',
  isAdmin: false,
  matchCount: 0,
  matchLimit: 10,
  canCreateMatch: true,
  loading: true,
};

export const usePlan = (): PlanInfo & { refresh: () => Promise<void> } => {
  const { user } = useAuth();
  const [info, setInfo] = useState<PlanInfo>(DEFAULT_PLAN_INFO);

  const refresh = useCallback(async () => {
    if (!user) {
      setInfo({ ...DEFAULT_PLAN_INFO, loading: false });
      return;
    }

    const { data, error } = await supabase.rpc('get_my_plan');
    if (error || !data || data.length === 0) {
      console.error('[plan] error:', error?.message);
      setInfo({ ...DEFAULT_PLAN_INFO, loading: false });
      return;
    }

    const row = data[0];
    setInfo({
      plan: row.plan as Plan,
      isAdmin: row.is_admin,
      matchCount: row.match_count,
      matchLimit: row.match_limit,
      canCreateMatch: row.can_create_match,
      loading: false,
    });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...info, refresh };
};

// Helper: ¿este plan tiene acceso al Modo Completo?
export const hasCompleteMode = (plan: Plan): boolean => {
  return plan === 'pro' || plan === 'club' || plan === 'elite';
};

// Helper: ¿este plan tiene acceso a videos + IA?
export const hasVideoAndAI = (plan: Plan): boolean => {
  return plan === 'club' || plan === 'elite';
};
