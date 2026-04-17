import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal, Play, CheckCircle2, XCircle, Clock, Loader2,
  ChevronRight, AlertTriangle, RefreshCw, History, Shield
} from 'lucide-react';
import client from '../../api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommandMeta {
  command: string;
  description: string;
  safe: boolean;
}

interface CommandGroups {
  [group: string]: CommandMeta[];
}

interface HistoryEntry {
  id: number;
  command: string;
  output: string;
  success: boolean;
  ran_at: string;
}

type RunState = 'idle' | 'running' | 'success' | 'error';

// ─── Group Icon Map ───────────────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
  'Cache & Config': '#818cf8',
  'Database':       '#34d399',
  'Storage':        '#fb923c',
  'Queue':          '#f472b6',
  'Academic':       '#60a5fa',
  'Finance':        '#fbbf24',
  'System':         '#a78bfa',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const [groups, setGroups]               = useState({});
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [runState, setRunState]           = useState('idle');
  const [output, setOutput]               = useState('');
  const [history, setHistory]             = useState([]);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [activeGroup, setActiveGroup]     = useState<string | null>(null);
  const outputRef                         = useRef<HTMLDivElement>(null);
  const historyId                         = useRef(0);

  // Fetch command whitelist
  useEffect(() => {
    client.get('/admin/commands')
      .then((res: { data: any }) => {
        setGroups(res.data.groups);
        const firstGroup = Object.keys(res.data.groups)[0];
        if (firstGroup) setActiveGroup(firstGroup);
      })
      .catch(() => setError('Failed to load command list.'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll terminal output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSelect = (cmd: CommandMeta) => {
    setSelected(cmd);
    setOutput('');
    setRunState('idle');
  };

  const handleRun = useCallback(async () => {
    if (!selected) return;
    setShowConfirm(false);
    setRunState('running');
    setOutput('');

    try {
      const res = await client.post('/admin/commands/run', { command: selected.command });
      const data = res.data;
      setOutput(data.output);
      setRunState(data.success ? 'success' : 'error');
      setHistory((prev: HistoryEntry[]) => [{
        id: ++historyId.current,
        command: selected.command,
        output: data.output,
        success: data.success,
        ran_at: data.ran_at ?? new Date().toISOString(),
      }, ...prev.slice(0, 19)]);
    } catch (err: any) {
      const msg = err.response?.data?.output || err.response?.data?.message || 'Request failed.';
      setOutput(msg);
      setRunState('error');
    }
  }, [selected]);

  const triggerRun = () => {
    if (!selected) return;
    if (!selected.safe) { setShowConfirm(true); return; }
    handleRun();
  };

  // ─── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    const map: Record<RunState, { icon: any, label: string, cls: string }> = {
      idle:    { icon: <Clock size={13} />,     label: 'Ready',   cls: 'text-slate-400' },
      running: { icon: <Loader2 size={13} className="animate-spin" />, label: 'Running…', cls: 'text-amber-400' },
      success: { icon: <CheckCircle2 size={13} />, label: 'Success', cls: 'text-emerald-400' },
      error:   { icon: <XCircle size={13} />,   label: 'Failed',  cls: 'text-rose-400' },
    };
    const s = map[runState];
    return (
      <span className={`flex items-center gap-1.5 text-xs font-mono font-medium ${s.cls}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm font-mono">Loading command registry…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-8 text-center max-w-sm">
          <XCircle size={32} className="text-rose-400 mx-auto mb-3" />
          <p className="text-rose-300 text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  const groupNames = Object.keys(groups);

  return (
    <div className="min-h-screen bg-[#0a0b14] text-slate-100 font-mono p-6 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Terminal size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Command Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">Secure Artisan Runner · Admin Only</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-800/40 rounded-lg px-3 py-1.5">
          <Shield size={12} className="text-violet-400" />
          <span className="text-[11px] text-violet-300 font-semibold">Whitelist Enforced</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── Left: Command Browser ── */}
        <aside className="w-72 flex flex-col gap-3 shrink-0">

          {/* Group tabs */}
          <div className="flex flex-wrap gap-1.5">
            {groupNames.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeGroup === g
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#12131f] border border-[#1e2035] text-slate-500 hover:text-slate-300'
                }`}
                style={activeGroup === g ? {} : {}}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Command list */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {activeGroup && (groups[activeGroup] ?? []).map((cmd: CommandMeta) => {
              const isSelected = selected?.command === cmd.command;
              const accent = GROUP_COLORS[activeGroup] ?? '#818cf8';
              return (
                <button
                  key={cmd.command}
                  onClick={() => handleSelect(cmd)}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 transition-all group ${
                    isSelected
                      ? 'bg-[#12131f] border-violet-600/60 shadow-[0_0_0_1px_rgba(124,58,237,0.3)]'
                      : 'bg-[#0e0f1c] border-[#1a1b2e] hover:border-[#2a2b45] hover:bg-[#12131f]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <code className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {cmd.command}
                    </code>
                    {!cmd.safe && (
                      <span className="shrink-0 text-[9px] bg-amber-900/40 text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        ⚠ Caution
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{cmd.description}</p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold" style={{ color: accent }}>
                      <ChevronRight size={11} />Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Right: Terminal Panel ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Terminal toolbar */}
          <div className="flex items-center justify-between bg-[#0e0f1c] border border-[#1a1b2e] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Traffic light dots */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[11px] text-slate-500">
                {selected
                  ? <><span className="text-slate-300">$</span> php artisan <span className="text-violet-400 font-bold">{selected.command}</span></>
                  : <span className="italic">Select a command to run…</span>
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge />
              <button
                disabled={!selected || runState === 'running'}
                onClick={triggerRun}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
              >
                {runState === 'running'
                  ? <><Loader2 size={12} className="animate-spin" />Running</>
                  : <><Play size={12} />Run</>
                }
              </button>
            </div>
          </div>

          {/* Terminal output */}
          <div
            ref={outputRef}
            className="flex-1 bg-[#060710] border border-[#1a1b2e] rounded-xl p-5 overflow-y-auto min-h-[300px] max-h-[500px]"
          >
            {output ? (
              <pre className={`text-[12px] leading-6 whitespace-pre-wrap wrap-break-word ${
                runState === 'error' ? 'text-rose-400' : 'text-emerald-300'
              }`}>{output}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-700">
                <Terminal size={36} strokeWidth={1.5} />
                <p className="text-xs">Output will appear here after running a command</p>
              </div>
            )}
          </div>

          {/* Run History */}
          {history.length > 0 && (
            <div className="bg-[#0e0f1c] border border-[#1a1b2e] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <History size={13} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session History</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {history.map((h: HistoryEntry) => (
                  <div
                    key={h.id}
                    onClick={() => { setSelected({ command: h.command, description: '', safe: true }); setOutput(h.output); setRunState(h.success ? 'success' : 'error'); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#12131f] hover:bg-[#15162a] cursor-pointer transition-all group"
                  >
                    {h.success
                      ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      : <XCircle size={11} className="text-rose-500 shrink-0" />
                    }
                    <code className="text-[11px] text-slate-300 flex-1 truncate">{h.command}</code>
                    <span className="text-[10px] text-slate-600">
                      {new Date(h.ran_at).toLocaleTimeString()}
                    </span>
                    <RefreshCw size={10} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal (for non-safe commands) ── */}
      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0e0f1c] border border-amber-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Execution</h3>
                <p className="text-xs text-amber-500/80 mt-0.5">This command may modify data</p>
              </div>
            </div>
            <div className="bg-black/40 rounded-xl p-4 mb-5 border border-[#1e2035]">
              <code className="text-[12px] text-violet-300 font-bold">php artisan {selected.command}</code>
              <p className="text-xs text-slate-400 mt-2">{selected.description}</p>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This operation is marked <span className="text-amber-400 font-semibold">Caution</span> because it modifies application state, database records, or triggers system-wide processes. Are you sure you want to run it now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#12131f] border border-[#1e2035] text-slate-300 text-sm font-semibold hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRun}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-all"
              >
                Yes, Run It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
