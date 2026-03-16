import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Zap, Activity, Upload, Smartphone,
  Wifi, ArrowRight, Check, X, Github, BookOpen, Users, Globe,
  ChevronRight, Star, Sparkles, Shield, Clock
} from 'lucide-react';

/* ============================================================
   CANVAS PARTICLE BACKGROUND — AI-style neural network
   ============================================================ */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.alpha})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ============================================================
   ANIMATED BEAMS
   ============================================================ */
function Beams({ count = 8 }) {
  const beams = Array.from({ length: count }, (_, i) => ({
    left: `${10 + i * (80 / count)}%`,
    height: `${60 + Math.random() * 40}vh`,
    dur: `${3 + Math.random() * 4}s`,
    delay: `${i * 0.6}s`,
  }));
  return (
    <div className="beam-bg">
      {beams.map((b, i) => (
        <div key={i} className="beam" style={{
          left: b.left,
          height: b.height,
          '--dur': b.dur,
          '--delay': b.delay,
          top: 0,
        }} />
      ))}
    </div>
  );
}

/* ============================================================
   TYPING ANIMATION
   ============================================================ */
const WORDS = ['Your Devices', 'Your Home', 'Your Factory', 'Your World'];
function TypingText() {
  const [wIdx, setWIdx] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = WORDS[wIdx];
    let t;
    if (!del && text === word) t = setTimeout(() => setDel(true), 2000);
    else if (del && text === '') { setDel(false); setWIdx(i => (i + 1) % WORDS.length); }
    else t = setTimeout(() => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)), del ? 55 : 95);
    return () => clearTimeout(t);
  }, [text, del, wIdx]);
  return (
    <span style={{ color: 'var(--clr-green)', textShadow: 'var(--glow-green)' }}>
      {text}
      <span style={{ animation: 'neonFlicker 1.2s infinite', color: 'var(--clr-cyan)' }}>|</span>
    </span>
  );
}

/* ============================================================
   COUNT UP (IntersectionObserver)
   ============================================================ */
function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let v = 0;
        const end = parseFloat(target);
        const t = setInterval(() => {
          v += end / 60;
          if (v >= end) { setVal(end); clearInterval(t); }
          else setVal(parseFloat(v.toFixed(1)));
        }, 1800 / 60);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ============================================================
   BENTO GRID FEATURES
   ============================================================ */
const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Real-Time Dashboard',
    desc: 'Drag-and-drop widgets with sub-second data latency. Customize your workspace for any project at any scale.',
    span: 'col-span-2', // wide
    gradient: 'from-cyan-500/10 to-blue-500/5',
    accentColor: 'var(--clr-cyan)',
  },
  {
    icon: Cpu,
    title: 'Device Management',
    desc: 'Manage entire fleets. Monitor connectivity, firmware, and health across 500K+ endpoints.',
    span: 'col-span-1',
    gradient: 'from-violet-500/10 to-purple-500/5',
    accentColor: 'var(--clr-purple)',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'End-to-end encryption, RBAC, and SOC 2 Type II compliance built-in.',
    span: 'col-span-1',
    gradient: 'from-green-500/10 to-emerald-500/5',
    accentColor: 'var(--clr-green)',
  },
  {
    icon: Zap,
    title: 'Automations',
    desc: 'Trigger actions based on sensor thresholds, schedules, or external webhooks.',
    span: 'col-span-1',
    gradient: 'from-yellow-500/10 to-orange-500/5',
    accentColor: 'var(--clr-yellow)',
  },
  {
    icon: Activity,
    title: 'Data Streams',
    desc: 'High-frequency data logging with microsecond timestamps, S3 export, and real-time analytics.',
    span: 'col-span-2', // wide
    gradient: 'from-cyan-500/10 to-indigo-500/5',
    accentColor: 'var(--clr-cyan)',
  },
  {
    icon: Upload,
    title: 'Over-the-Air Updates',
    desc: 'Push firmware remotely to any device group in seconds, with staged rollout and rollback.',
    span: 'col-span-1',
    gradient: 'from-blue-500/10 to-cyan-500/5',
    accentColor: '#60a5fa',
  },
];

/* ============================================================
   HARDWARE LOGOS
   ============================================================ */
const HW = [
  'Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi', 'STM32',
  'Particle', 'Nordic nRF52', 'Texas Instruments', 'LoRa', 'Zigbee',
  'Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi', 'STM32',
  'Particle', 'Nordic nRF52', 'Texas Instruments', 'LoRa', 'Zigbee',
];

/* ============================================================
   PRICING
   ============================================================ */
const PLANS = [
  {
    name: 'Starter', price: '$0', period: '/month', highlight: false,
    desc: 'Perfect for prototyping and hobby projects.',
    features: [
      { text: '5 Devices', ok: true },
      { text: '1K datapoints/month', ok: true },
      { text: 'Community support', ok: true },
      { text: 'Automations', ok: false },
      { text: 'OTA Updates', ok: false },
    ]
  },
  {
    name: 'Plus', price: '$25', period: '/month', highlight: true,
    desc: 'For makers and small teams taking things to market.',
    features: [
      { text: '50 Devices', ok: true },
      { text: '10M datapoints/month', ok: true },
      { text: 'Email + Chat support', ok: true },
      { text: 'Automations', ok: true },
      { text: 'OTA Updates', ok: false },
    ]
  },
  {
    name: 'Pro', price: '$75', period: '/month', highlight: false,
    desc: 'For enterprises running at scale.',
    features: [
      { text: 'Unlimited Devices', ok: true },
      { text: 'Unlimited datapoints', ok: true },
      { text: '24/7 Priority support', ok: true },
      { text: 'Automations', ok: true },
      { text: 'OTA + White-label', ok: true },
    ]
  }
];

/* ============================================================
   MAIN LANDING PAGE
   ============================================================ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: 'var(--bg-void)', overflowX: 'hidden' }}>

      {/* ==================== NAV ==================== */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(3,7,18,0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', padding: '0 48px', height: '64px', gap: '32px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,var(--clr-cyan),#0070f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-cyan)' }}>
            <Wifi size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ background: 'linear-gradient(135deg,var(--clr-cyan),#fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MAAD IoT
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 28, marginLeft: 12, flex: 1, alignItems: 'center' }}>
          {['Features', 'Hardware', 'Pricing', 'Docs'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: 'var(--text-muted)', fontSize: '0.87rem', transition: 'color 0.15s', fontWeight: 500 }}
              onMouseOver={e => e.target.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section style={{
        minHeight: '100vh', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 24px 80px', overflow: 'hidden'
      }}>
        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0 }} className="retro-grid" />
        <ParticleCanvas />
        <Beams count={10} />

        {/* Glow orbs */}
        <div className="orb" style={{ width: 600, height: 600, top: '-10%', left: '5%', background: 'radial-gradient(circle,rgba(0,229,255,0.18) 0%,transparent 70%)', animationDelay: '0s' }} />
        <div className="orb" style={{ width: 500, height: 500, bottom: '0%', right: '0%', background: 'radial-gradient(circle,rgba(57,255,20,0.1) 0%,transparent 70%)', animationDelay: '-4s' }} />
        <div className="orb" style={{ width: 400, height: 400, top: '60%', left: '40%', background: 'radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%)', animationDelay: '-2s' }} />

        <div style={{
          position: 'relative', zIndex: 1, maxWidth: 920,
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 0.6s ease'
        }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,229,255,0.07)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 24, padding: '5px 18px', marginBottom: 36,
            fontSize: '0.72rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em',
            color: 'var(--clr-cyan)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.6s ease both',
          }}>
            <Sparkles size={12} />
            OTA Update 4.0 · Now with Edge AI Support
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(3rem, 7.5vw, 6rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900, lineHeight: 1.05,
            marginBottom: 12,
            animation: 'fadeInUp 0.7s 0.1s ease both',
            letterSpacing: '-0.01em',
          }}>
            <span className="shimmer-text">Connect. Control.</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Monitor.</span>
          </h1>

          {/* Typing */}
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.6rem)',
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            marginBottom: 24,
            animation: 'fadeInUp 0.7s 0.2s ease both',
          }}>
            <TypingText />
          </h2>

          {/* Subheadline */}
          <p style={{
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: 620, margin: '0 auto 48px',
            animation: 'fadeInUp 0.7s 0.3s ease both', lineHeight: 1.8,
          }}>
            The most powerful IoT platform to build connected hardware products and services at any scale — from a single garage prototype to enterprise fleet deployments.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 72,
            animation: 'fadeInUp 0.7s 0.4s ease both',
          }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}
              style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
              Start for Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/dashboard')}>
              See Live Demo
            </button>
          </div>

          {/* Stat Badges — floating with stagger */}
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.7s 0.5s ease both',
          }}>
            {[
              { val: '500', suf: 'K+', label: 'Devices Connected', icon: Cpu },
              { val: '99.9', suf: '%', label: 'Uptime SLA', icon: Clock },
              { val: '150', suf: '+', label: 'Countries', icon: Globe },
            ].map((s, i) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--r-lg)',
                padding: '16px 24px',
                minWidth: 148,
                backdropFilter: 'blur(16px)',
                animation: `floatY ${3.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                boxShadow: 'var(--shadow-glass)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                  <s.icon size={14} color="var(--clr-cyan)" />
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 900, color: 'var(--clr-cyan)', textShadow: 'var(--glow-cyan)', lineHeight: 1 }}>
                  <CountUp target={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BENTO FEATURES ==================== */}
      <section id="features" style={{ padding: '100px 48px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--clr-cyan)', marginBottom: 14, textTransform: 'uppercase', animation: 'fadeInUp 0.6s ease both' }}>PLATFORM CAPABILITIES</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16, animation: 'fadeInUp 0.6s 0.1s ease both' }}>
            Everything You Need to <span className="shimmer-text">Build at Scale</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>From single-device prototypes to million-node deployments.</p>
        </div>

        {/* Bento Grid — asymmetric */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: 16,
        }}>
          {FEATURES.map(({ icon: Icon, title, desc, span, accentColor }, i) => (
            <div
              key={title}
              className="card card-glow"
              style={{
                gridColumn: span === 'col-span-2' ? 'span 2' : 'span 1',
                padding: '28px 24px',
                minHeight: 200,
                animation: `fadeInScale 0.5s ${i * 0.07}s ease both`,
                cursor: 'default',
                background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
              }}
              onMouseOver={e => { e.currentTarget.style.setProperty('--hover-clr', accentColor); }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r-md)',
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: `0 0 20px ${accentColor}20`,
              }}>
                <Icon size={24} color={accentColor} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HARDWARE MARQUEE ==================== */}
      <section id="hardware" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--clr-cyan)', marginBottom: 10, textTransform: 'uppercase' }}>SUPPORTED HARDWARE</div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>Works with Your Favorite Chips</h2>
        </div>

        {/* Dual-lane marquee */}
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 28, animation: 'marquee 30s linear infinite', width: 'max-content', marginBottom: 16 }}>
            {HW.map((logo, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--r-md)',
                padding: '10px 24px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap', flexShrink: 0,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}>
                {logo}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 28, animation: 'marquee 24s linear infinite reverse', width: 'max-content' }}>
            {[...HW].reverse().map((logo, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,229,255,0.06)',
                borderRadius: 'var(--r-md)',
                padding: '10px 24px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--clr-cyan)', marginBottom: 14, textTransform: 'uppercase' }}>PRICING</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 16 }}>
            Simple, <span className="shimmer-text">Transparent</span> Pricing
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>Start for free. Scale as you grow. No hidden fees.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
          {PLANS.map((plan, i) => (
            <div key={plan.name} style={{
              background: plan.highlight ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${plan.highlight ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 'var(--r-xl)',
              padding: '36px 28px',
              position: 'relative',
              boxShadow: plan.highlight ? 'var(--glow-cyan), var(--shadow-card)' : 'var(--shadow-card)',
              transform: plan.highlight ? 'scale(1.04) translateY(-4px)' : 'scale(1)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              animation: `fadeInUp 0.5s ${i * 0.1}s ease both`,
            }}>
              {/* Top rim for highlighted */}
              {plan.highlight && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,var(--clr-cyan),transparent)', borderRadius: '24px 24px 0 0' }} />
              )}
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--clr-cyan),#0070f3)', color: '#000', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 800, padding: '4px 18px', borderRadius: 20, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.12em', color: plan.highlight ? 'var(--clr-cyan)' : 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{plan.name}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{plan.desc}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                {plan.features.map(f => (
                  <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.87rem', color: f.ok ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {f.ok
                      ? <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={10} color="var(--clr-green)" strokeWidth={3} />
                        </div>
                      : <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <X size={10} color="var(--text-muted)" strokeWidth={3} />
                        </div>
                    }
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/dashboard')}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FINAL CTA BANNER ==================== */}
      <section style={{ padding: '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="retro-grid" />
        <div className="orb" style={{ width: 600, height: 400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle,rgba(0,229,255,0.12) 0%,transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 16 }}>
            Ready to Connect <span className="shimmer-text">Your World</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.8 }}>
            Join 500,000+ developers building the future of connected hardware with MAAD IoT.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}
            style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
            Launch Dashboard <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ background: 'rgba(8,17,42,0.7)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '56px 48px 32px', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 40, marginBottom: 56 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', marginBottom: 16, background: 'linear-gradient(135deg,var(--clr-cyan),#fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MAAD IoT
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>The most powerful IoT platform for connected hardware at any scale.</p>
            </div>
            {[
              { label: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { label: 'Developers', links: ['Docs', 'API Reference', 'SDKs', 'Community'] },
              { label: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { label: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--clr-cyan)', marginBottom: 14, textTransform: 'uppercase' }}>{col.label}</div>
                <ul style={{ listStyle: 'none' }}>
                  {col.links.map(l => (
                    <li key={l} style={{ marginBottom: 9 }}>
                      <a href="#" style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}
                        onMouseOver={e => e.target.style.color = 'var(--text-primary)'}
                        onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
            <input type="email" placeholder="Enter your email for updates..." className="form-input" style={{ maxWidth: 300 }} />
            <button className="btn btn-primary">Subscribe</button>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2026 MAAD IoT Platform. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 14 }}>
              {[Github, BookOpen, Globe, Users].map((Icon, i) => (
                <div key={i} style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--clr-cyan)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
