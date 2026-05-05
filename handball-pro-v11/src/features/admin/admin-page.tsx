import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/cn';

interface AdminMatch {
  match_id: string;
  user_email: string;
  home_name: string;
  away_name: string;
  home_score: number;
  away_score: number;
  status: string;
  match_date: string;
  competition: string;
  created_at: string;
  events_count: number;
}

interface AdminUser {
  user_id: string;
  user_email: string;
  is_anonymous: boolean;
  is_admin: boolean;
  matches_count: number;
  teams_count: number;
  created_at: string;
}

type Tab = 'matches' | 'users';

export const AdminPage = () => {
  
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('matches');
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('is_current_user_admin');
      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    })();
  }, []);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc('admin_get_all_matches');
    setMatches((data as AdminMatch[]) ?? []);
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc('admin_get_all_users');
    setUsers((data as AdminUser[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;
    if (tab === 'matches') loadMatches();
    else loadUsers();
  }, [isAdmin, tab, loadMatches, loadUsers]);

  const handleDeleteMatch = async (matchId: string, label: string) => {
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;
    await supabase.rpc('admin_delete_match', { target_match_id: matchId });
    loadMatches();
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-fg text-sm">
        Verificando permisos…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl">🔒</div>
        <h1 className="text-xl font-bold">Acceso denegado</h1>
        <p className="text-sm text-muted-fg">No tenés permisos de administrador.</p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="text-sm text-primary hover:underline"
        >
          ← Volver a la app
        </button>
      </div>
    );
  }

  const statusLabel = (s: string) => {
    if (s === 'finished') return { text: 'Finalizado', cls: 'bg-green-500/15 text-green-400 border-green-500/30' };
    if (s === 'live') return { text: 'En vivo', cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
    return { text: s, cls: 'bg-surface-2 text-muted-fg border-border' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛡️ Panel de Administración
        </h1>
        <p className="text-sm text-muted-fg mt-1">
          Vista global de todos los usuarios y partidos del sistema.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
        <TabBtn active={tab === 'matches'} onClick={() => setTab('matches')}>
          📋 Partidos ({matches.length})
        </TabBtn>
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
          👥 Usuarios ({users.length})
        </TabBtn>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-fg text-sm">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
          Cargando…
        </div>
      ) : tab === 'matches' ? (
        /* ─── MATCHES TABLE ─── */
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Partido</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Score</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Estado</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Eventos</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Fecha</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => {
                  const sl = statusLabel(m.status);
                  return (
                    <tr key={m.match_id} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{m.home_name} vs {m.away_name}</div>
                        <div className="text-[10px] text-muted-fg">{m.competition} · {m.match_date}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-semibold">
                        {m.home_score} - {m.away_score}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase', sl.cls)}>
                          {sl.text}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-muted-fg">{m.events_count}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-fg truncate block max-w-[160px]" title={m.user_email}>
                          {m.user_email}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-fg whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteMatch(m.match_id, `${m.home_name} vs ${m.away_name}`)}
                          className="text-muted-fg hover:text-danger transition-colors"
                          title="Eliminar partido"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {matches.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-fg">Sin partidos en el sistema.</div>
          )}
        </div>
      ) : (
        /* ─── USERS TABLE ─── */
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Usuario</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Tipo</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Partidos</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Equipos</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold',
                          u.is_admin
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : u.is_anonymous
                              ? 'bg-surface-2 text-muted-fg border border-border'
                              : 'bg-green-500/15 text-green-400 border border-green-500/30',
                        )}>
                          {u.is_admin ? '👑' : u.is_anonymous ? '?' : u.user_email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{u.user_email}</div>
                          <div className="text-[10px] text-muted-fg font-mono">{u.user_id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase',
                        u.is_admin
                          ? 'bg-primary/15 text-primary border-primary/30'
                          : u.is_anonymous
                            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                            : 'bg-green-500/15 text-green-400 border-green-500/30',
                      )}>
                        {u.is_admin ? 'Admin' : u.is_anonymous ? 'Anónimo' : 'Registrado'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono">{u.matches_count}</td>
                    <td className="px-3 py-3 text-center font-mono">{u.teams_count}</td>
                    <td className="px-3 py-3 text-xs text-muted-fg whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
      active ? 'bg-primary/15 text-primary' : 'text-muted-fg hover:text-fg hover:bg-surface-2',
    )}
  >
    {children}
  </button>
);
