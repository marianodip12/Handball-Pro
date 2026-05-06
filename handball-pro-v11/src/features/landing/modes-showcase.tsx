import { Link } from 'react-router-dom';

/**
 * Showcase visual de Modo Rápido vs Modo Completo.
 * Pensado para la landing — explica la diferencia entre Free y Pro.
 */
export const ModesShowcase = () => {
  return (
    <section id="modes" className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 w-full">
      <div className="text-center mb-10 md:mb-12">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
          Dos formas de usar la app
        </p>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
          Modo Rápido o Modo Completo
        </h2>
        <p className="mt-3 text-sm md:text-base text-muted-fg max-w-2xl mx-auto leading-relaxed">
          Elegí el que necesites. El Modo Rápido es gratis para siempre. El Completo lo desbloqueás con el plan Pro y te da análisis profundo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Modo Rápido */}
        <ModeColumn
          variant="rapido"
          title="Modo Rápido"
          tag="FREE"
          accent="#1D9E75"
          icon="⚡"
          tagline="Registrá todo lo que pasa en 2 toques"
          description="Pensado para anotar el partido sin perder ninguna jugada. Botones grandes, sin distracciones."
          features={[
            'Goles y asistencias',
            'Atajadas y errores',
            'Lanzamientos al palo',
            '7 metros',
            'Faltas (2 minutos)',
            'Tarjetas amarilla, roja, azul',
            'Cambios y sustituciones',
            'Score y minuto en vivo',
          ]}
        />

        {/* Modo Completo */}
        <ModeColumn
          variant="completo"
          title="Modo Completo"
          tag="DESDE PRO"
          accent="#378ADD"
          icon="📊"
          tagline="Profundizá cuando lo necesites"
          description="Mismo Modo Rápido + análisis avanzado. Vení mañana al entreno con datos concretos sobre dónde y cómo se ganó o perdió el partido."
          features={[
            'Todo lo del Modo Rápido',
            'Mapa de tiros por zona',
            'Eficacia por jugador',
            'Heatmap de la cancha',
            'Comparativa entre partidos',
            'Tendencias por temporada',
            'Stats de arquero (zona del tiro)',
            'Exportar PDF + compartir',
          ]}
          highlight
        />
      </div>

      {/* Mini explainer */}
      <div className="mt-6 rounded-xl border border-border bg-surface/50 p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="text-2xl">💡</div>
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">¿Tenés Pro y querés solo lo básico?</p>
          <p className="text-muted-fg leading-relaxed">
            En el plan Pro podés elegir registrar partidos en Modo Rápido o Modo Completo. El Modo Rápido sigue disponible para los días en que solo querés anotar y listo.
          </p>
        </div>
        <Link
          to="/app/plans"
          className="text-xs px-4 py-2 rounded-md bg-primary text-primary-fg hover:bg-primary/90 transition-colors font-semibold whitespace-nowrap"
        >
          Ver planes →
        </Link>
      </div>
    </section>
  );
};

const ModeColumn = ({
  variant,
  title,
  tag,
  accent,
  icon,
  tagline,
  description,
  features,
  highlight = false,
}: {
  variant: 'rapido' | 'completo';
  title: string;
  tag: string;
  accent: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  highlight?: boolean;
}) => {
  return (
    <div
      className="rounded-2xl border bg-surface p-5 md:p-6 flex flex-col"
      style={{
        borderColor: highlight ? accent : undefined,
        borderWidth: highlight ? '1.5px' : '0.5px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl grid place-items-center text-xl"
          style={{ background: accent }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg md:text-xl font-bold">{title}</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider"
              style={{ background: accent, color: '#fff' }}
            >
              {tag}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-fg mt-0.5">{tagline}</p>
        </div>
      </div>

      <p className="text-sm text-muted-fg leading-relaxed mb-4">{description}</p>

      {/* Mini visual mockup */}
      <div className="rounded-lg border border-border bg-bg/40 p-3 mb-4 min-h-[120px]">
        {variant === 'rapido' ? <RapidoMockup accent={accent} /> : <CompletoMockup accent={accent} />}
      </div>

      {/* Features */}
      <ul className="space-y-1.5 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-xs" style={{ color: accent }}>✓</span>
            <span className="text-fg/90 leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Mockup visual del Modo Rápido — botones grandes y simples
const RapidoMockup = ({ accent }: { accent: string }) => (
  <div className="grid grid-cols-3 gap-2">
    {[
      { label: 'GOL', color: accent },
      { label: 'ATAJADA', color: '#378ADD' },
      { label: 'ERRADO', color: '#71717A' },
      { label: 'PALO', color: '#71717A' },
      { label: '7M', color: '#BA7517' },
      { label: '2 MIN', color: '#DC2626' },
    ].map((b) => (
      <div
        key={b.label}
        className="h-10 rounded-md grid place-items-center text-[10px] font-bold tracking-wider text-white"
        style={{ background: b.color }}
      >
        {b.label}
      </div>
    ))}
  </div>
);

// Mockup visual del Modo Completo — cancha con zonas + heatmap
const CompletoMockup = ({ accent }: { accent: string }) => (
  <div className="space-y-2">
    {/* Cancha con zonas */}
    <div className="relative h-[70px] rounded bg-gradient-to-br from-emerald-900/30 to-emerald-700/20 border border-emerald-700/30 overflow-hidden">
      {/* Centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-white/20" />
      </div>
      {/* Áreas de portería */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-3/5 border-r border-white/30" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-3/5 border-l border-white/30" />
      {/* Puntos de tiro (heatmap simulation) */}
      <div className="absolute left-[20%] top-[30%] w-2.5 h-2.5 rounded-full bg-red-500/80 blur-[1px]" />
      <div className="absolute left-[18%] top-[55%] w-2 h-2 rounded-full bg-red-400/70 blur-[1px]" />
      <div className="absolute left-[22%] top-[65%] w-3 h-3 rounded-full bg-red-600/90 blur-[2px]" />
      <div className="absolute right-[20%] top-[40%] w-2 h-2 rounded-full bg-yellow-500/70 blur-[1px]" />
      <div className="absolute right-[15%] top-[50%] w-2.5 h-2.5 rounded-full bg-orange-500/80 blur-[1px]" />
    </div>
    {/* Mini stats bars */}
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[9px]">
        <span className="text-muted-fg w-12 text-right">Centro</span>
        <div className="flex-1 h-1.5 bg-bg/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '78%', background: accent }} />
        </div>
        <span className="text-fg/80 w-6">78%</span>
      </div>
      <div className="flex items-center gap-1.5 text-[9px]">
        <span className="text-muted-fg w-12 text-right">Punta</span>
        <div className="flex-1 h-1.5 bg-bg/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '52%', background: accent }} />
        </div>
        <span className="text-fg/80 w-6">52%</span>
      </div>
      <div className="flex items-center gap-1.5 text-[9px]">
        <span className="text-muted-fg w-12 text-right">Pivote</span>
        <div className="flex-1 h-1.5 bg-bg/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '64%', background: accent }} />
        </div>
        <span className="text-fg/80 w-6">64%</span>
      </div>
    </div>
  </div>
);
