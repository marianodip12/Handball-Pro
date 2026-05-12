import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { Ticket, TicketStatus } from '@/features/support/support-page';

const STATUS_OPTIONS: { value: TicketStatus; label: string; cls: string }[] = [
  { value: 'open',        label: 'Abierto',     cls: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  { value: 'in_progress', label: 'En proceso',  cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  { value: 'resolved',    label: 'Resuelto',    cls: 'bg-green-500/15 text-green-300 border-green-500/40' },
  { value: 'closed',      label: 'Cerrado',     cls: 'bg-surface-2 text-muted-fg border-border' },
];

const CATEGORY_ICON: Record<string, string> = {
  bug: '🐛', feature: '💡', pago: '💳', cuenta: '👤', otro: '💬',
};

export const AdminTicketsPanel = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('open');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: rpcErr } = await supabase.rpc('admin_list_tickets');
    if (rpcErr) {
      console.error('[admin-tickets] list error:', rpcErr.message);
      setError(rpcErr.message);
    } else {
      setTickets((data ?? []) as Ticket[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const filtered = useMemo(
    () => (filterStatus === 'all' ? tickets : tickets.filter((t) => t.status === filterStatus)),
    [tickets, filterStatus],
  );

  const counts = useMemo(() => {
    const c: Record<TicketStatus | 'all', number> = {
      all: tickets.length, open: 0, in_progress: 0, resolved: 0, closed: 0,
    };
    for (const t of tickets) c[t.status] += 1;
    return c;
  }, [tickets]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">🎫 Tickets de soporte</h2>
        <Button variant="ghost" onClick={refresh}>↻ Refrescar</Button>
      </header>

      {/* Filtros por estado */}
      <div className="flex gap-1.5 flex-wrap">
        <FilterChip label={`Todos (${counts.all})`} active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
        {STATUS_OPTIONS.map((s) => (
          <FilterChip
            key={s.value}
            label={`${s.label} (${counts[s.value]})`}
            active={filterStatus === s.value}
            onClick={() => setFilterStatus(s.value)}
            cls={s.cls}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-md p-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-fg">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-fg italic">No hay tickets con este filtro.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <AdminTicketCard key={t.id} ticket={t} onUpdated={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────

const AdminTicketCard = ({
  ticket,
  onUpdated,
}: {
  ticket: Ticket;
  onUpdated: () => Promise<void>;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(ticket.admin_reply ?? '');
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const created = new Date(ticket.created_at).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const status = STATUS_OPTIONS.find((s) => s.value === ticket.status) ?? STATUS_OPTIONS[0];

  const handleReply = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('admin_reply_ticket', {
      p_ticket_id: ticket.id,
      p_reply: reply.trim() || null,
    });
    setSaving(false);
    if (error) {
      window.alert('Error al guardar respuesta: ' + error.message);
      return;
    }
    await onUpdated();
  };

  const handleStatus = async (newStatus: TicketStatus) => {
    setSavingStatus(true);
    const { error } = await supabase.rpc('admin_set_ticket_status', {
      p_ticket_id: ticket.id,
      p_status: newStatus,
    });
    setSavingStatus(false);
    if (error) {
      window.alert('Error al cambiar estado: ' + error.message);
      return;
    }
    await onUpdated();
  };

  return (
    <li className="rounded-lg border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-surface-2/40 transition-colors"
      >
        <span className="text-base shrink-0">{CATEGORY_ICON[ticket.category] ?? '💬'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{ticket.subject}</span>
            <span className={cn('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-semibold', status.cls)}>
              {status.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-fg mt-0.5 truncate">
            {ticket.user_email ?? ticket.user_id.slice(0, 8)} · {created}
          </p>
        </div>
        <span className={cn('text-muted-fg transition-transform shrink-0', expanded && 'rotate-180')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>

      {expanded && (
        <div className="px-3 py-3 border-t border-border bg-bg/40 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-fg mb-1">Mensaje del usuario</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.body}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-fg mb-1">Respuesta (visible para el usuario)</p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Respondé al usuario…"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
              maxLength={4000}
            />
            <div className="flex justify-end mt-1.5">
              <Button onClick={handleReply} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar respuesta'}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-fg mb-1.5">Cambiar estado</p>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={savingStatus || s.value === ticket.status}
                  onClick={() => handleStatus(s.value)}
                  className={cn(
                    'text-[10px] uppercase tracking-wider px-2 py-1 rounded border font-semibold transition-colors',
                    s.value === ticket.status
                      ? cn(s.cls, 'opacity-60 cursor-default')
                      : 'border-border bg-surface-2 text-muted-fg hover:text-fg hover:border-primary/50',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

const FilterChip = ({
  label, active, onClick, cls,
}: { label: string; active: boolean; onClick: () => void; cls?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-semibold transition-colors',
      active
        ? cls ?? 'bg-primary/15 text-primary border-primary/40'
        : 'border-border bg-surface-2/40 text-muted-fg hover:text-fg',
    )}
  >
    {label}
  </button>
);
