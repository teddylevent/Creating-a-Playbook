import { useEffect, useRef, useState, useCallback } from 'react';

const AGENT_COLORS = { 0: '#7c3aed', 1: '#2563eb' };
const AGENT_RADIUS = 20;
const ARENA_PADDING = 20;

const HYPE_MESSAGES = [
  'HEAVY HIT!', 'CRUSHING BLOW!', 'DEMOLISHED!', 'OUCH!', 'LIGHTS OUT!',
  'SAVAGE!', 'OBLITERATED!', 'RAGDOLL!',
];

function randomHype() {
  return HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
}

export default function ArenaCanvas({ replay, autoPlay = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const flashRef = useRef({}); // { agentId: flashTicksRemaining }
  const hypeRef = useRef(null); // { text, x, y, ttl }

  const frames = replay?.frames || [];
  const events = replay?.events || [];
  const agents = replay?.agents || [];
  const arenaW = replay?.arena?.width || 800;
  const arenaH = replay?.arena?.height || 600;

  // Build event lookup by tick for fast access
  const eventsByTick = useRef({});
  useEffect(() => {
    const map = {};
    for (const ev of events) {
      if (!map[ev.tick]) map[ev.tick] = [];
      map[ev.tick].push(ev);
    }
    eventsByTick.current = map;
  }, [events]);

  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas || !frames[frameIdx]) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const scaleX = (W - ARENA_PADDING * 2) / arenaW;
    const scaleY = (H - ARENA_PADDING * 2) / arenaH;

    const tx = (x) => ARENA_PADDING + x * scaleX;
    const ty = (y) => ARENA_PADDING + y * scaleY;
    const tr = (r) => r * Math.min(scaleX, scaleY);

    // Process events for this tick
    const tickEvents = eventsByTick.current[frameIdx] || [];
    for (const ev of tickEvents) {
      if (ev.type === 'attack' || ev.type === 'heavy_attack') {
        flashRef.current[ev.targetId] = 6;
        const frame = frames[frameIdx];
        const pos = ev.targetId === agents[0]?.id ? frame.a : frame.b;
        hypeRef.current = {
          text: ev.type === 'heavy_attack' ? `HEAVY HIT! -${ev.damage}` : `-${ev.damage}`,
          x: tx(pos.x),
          y: ty(pos.y) - tr(AGENT_RADIUS) - 20,
          ttl: 30,
        };
      }
    }

    // Tick flash timers
    for (const id of Object.keys(flashRef.current)) {
      if (flashRef.current[id] > 0) flashRef.current[id]--;
    }
    if (hypeRef.current) hypeRef.current.ttl--;

    // ── Background ──────────────────────────────────────────────────
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // Arena border
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(ARENA_PADDING, ARENA_PADDING, W - ARENA_PADDING * 2, H - ARENA_PADDING * 2);

    // Grid lines
    ctx.strokeStyle = '#12122a';
    ctx.lineWidth = 1;
    const cols = 8, rows = 6;
    for (let i = 1; i < cols; i++) {
      const x = ARENA_PADDING + ((W - ARENA_PADDING * 2) / cols) * i;
      ctx.beginPath(); ctx.moveTo(x, ARENA_PADDING); ctx.lineTo(x, H - ARENA_PADDING); ctx.stroke();
    }
    for (let j = 1; j < rows; j++) {
      const y = ARENA_PADDING + ((H - ARENA_PADDING * 2) / rows) * j;
      ctx.beginPath(); ctx.moveTo(ARENA_PADDING, y); ctx.lineTo(W - ARENA_PADDING, y); ctx.stroke();
    }

    const frame = frames[frameIdx];
    const agentFrames = [frame.a, frame.b];

    // ── Draw agents ──────────────────────────────────────────────────
    agentFrames.forEach((af, i) => {
      const id = agents[i]?.id;
      const name = agents[i]?.name || `Agent ${i + 1}`;
      const color = AGENT_COLORS[i];
      const cx = tx(af.x);
      const cy = ty(af.y);
      const r = tr(AGENT_RADIUS);
      const isFlash = flashRef.current[id] > 0;

      // Shadow
      ctx.shadowColor = color;
      ctx.shadowBlur = isFlash ? 30 : 12;

      // Body
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = isFlash ? '#ffffff' : color;
      ctx.fill();
      ctx.strokeStyle = isFlash ? '#ffaa00' : '#ffffff33';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Initials
      ctx.fillStyle = isFlash ? '#000' : '#fff';
      ctx.font = `bold ${Math.round(r * 0.75)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.slice(0, 2).toUpperCase(), cx, cy);

      // ── Health bar ─────────────────────────────────────────────────
      const barW = 80, barH = 8;
      const bx = cx - barW / 2;
      const by = cy - r - 18;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(bx, by, barW, barH);

      const hpPct = Math.max(0, af.health) / 100;
      const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = hpColor;
      ctx.fillRect(bx, by, barW * hpPct, barH);

      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, barH);

      // HP label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${name}  HP: ${af.health}`, cx, by - 2);
    });

    // ── Hype message ─────────────────────────────────────────────────
    if (hypeRef.current && hypeRef.current.ttl > 0) {
      const h = hypeRef.current;
      const alpha = Math.min(1, h.ttl / 10);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillText(h.text, h.x, h.y - (30 - h.ttl));
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ── Tick counter ─────────────────────────────────────────────────
    ctx.fillStyle = '#4a4a6a';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`tick ${frameIdx} / ${frames.length - 1}`, W - ARENA_PADDING, H - 4);

    // ── KO overlay ───────────────────────────────────────────────────
    if (frameIdx === frames.length - 1) {
      const winnerIdx = frame.a.health > frame.b.health ? 0 : frame.b.health > frame.a.health ? 1 : -1;
      const winnerName = winnerIdx >= 0 ? agents[winnerIdx]?.name : null;

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = 'bold 48px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#7c3aed';
      ctx.shadowBlur = 20;
      if (winnerName) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('K.O.!', W / 2, H / 2 - 30);
        ctx.font = 'bold 26px Impact, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(`${winnerName} WINS`, W / 2, H / 2 + 20);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('DRAW', W / 2, H / 2);
      }
      ctx.shadowBlur = 0;
    }
  }, [frames, agents, arenaW, arenaH, events]);

  // Animation loop
  useEffect(() => {
    if (!playing) return;
    let currentTick = tick;
    const interval = Math.max(16, Math.round(1000 / 15 / speed));

    const step = () => {
      if (currentTick >= frames.length - 1) {
        setPlaying(false);
        return;
      }
      currentTick++;
      setTick(currentTick);
      drawFrame(currentTick);
      animRef.current = setTimeout(step, interval);
    };
    animRef.current = setTimeout(step, interval);
    return () => clearTimeout(animRef.current);
  }, [playing, speed, frames.length, drawFrame, tick]);

  // Draw on tick change (when paused)
  useEffect(() => {
    if (!playing) drawFrame(tick);
  }, [tick, playing, drawFrame]);

  // Initial draw
  useEffect(() => {
    setTick(0);
    drawFrame(0);
    flashRef.current = {};
    hypeRef.current = null;
  }, [replay, drawFrame]);

  if (!replay) return null;

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full rounded-xl border border-[#2a2a4a] bg-[#0a0a1a]"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          className="btn-secondary text-sm"
          onClick={() => { setTick(0); setPlaying(false); drawFrame(0); }}
        >
          &#9664;&#9664; Reset
        </button>
        <button
          className="btn-primary text-sm min-w-[80px]"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={() => { setTick((t) => Math.min(frames.length - 1, t + 1)); }}
          disabled={playing}
        >
          Step &#9654;
        </button>

        <label className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
          Speed
          <select
            className="bg-[#12122a] border border-[#2a2a4a] rounded px-2 py-1 text-sm"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={frames.length - 1}
        value={tick}
        onChange={(e) => { setTick(Number(e.target.value)); setPlaying(false); }}
        className="w-full accent-violet-500"
      />
      <p className="text-xs text-gray-500 text-center">
        Frame {tick + 1} / {frames.length} — drag scrubber or step through manually
      </p>
    </div>
  );
}
