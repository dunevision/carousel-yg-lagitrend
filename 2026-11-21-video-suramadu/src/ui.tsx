import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {MONO, SANS} from './fonts';
import {CH, CTOP, CW, Cam, V3, clamp01, easeOut, project} from './kit';
import {FPS, Timed} from './script';

export const C = {
  cream: '#EDEBE0',
  ink: '#1c2b27',
  green: '#2f8f6b',
  orange: '#e0532b',
  blue: '#2f6fe0',
  red: '#d8344a',
};

const Title: React.FC<{text: string}> = ({text}) => (
  <>
    {text.split('*').map((part, i) => (
      <span key={i} style={{color: i % 2 ? C.green : C.ink}}>
        {part}
      </span>
    ))}
  </>
);

export const Header: React.FC<{kicker: string; title: string}> = ({kicker, title}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [2, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: CW,
        height: CTOP + 70,
        background: `linear-gradient(to bottom, ${C.cream} 0%, ${C.cream} ${(CTOP / (CTOP + 70)) * 100}%, rgba(237,235,224,0) 100%)`,
      }}
    >
      <div style={{position: 'absolute', left: 64, top: 108, right: 64, opacity: o, translate: `0 ${(1 - o) * 14}px`}}>
        <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 25, letterSpacing: 3, color: '#6b7a74', marginBottom: 14}}>{kicker}</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 62, lineHeight: 1.08, letterSpacing: -1.2}}>
          <Title text={title} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 64,
          top: 62,
          background: C.ink,
          color: '#fff',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 22,
          padding: '7px 16px',
          borderRadius: 12,
        }}
      >
        @yg_lagitrend
      </div>
    </div>
  );
};

export const Caption: React.FC<{s: Timed}> = ({s}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let idx = -1;
  s.phr.forEach((p, i) => {
    if (t >= p.s - 0.08) idx = i;
  });
  if (idx < 0) return null;
  const p = s.phr[idx];
  return (
    <div style={{position: 'absolute', left: 50, width: 900, top: 1440, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: 'rgba(12,42,34,0.9)',
          borderRadius: 26,
          padding: '20px 34px 24px',
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 56,
          lineHeight: 1.22,
          color: '#fff',
          boxShadow: '0 8px 26px rgba(0,0,0,0.25)',
        }}
      >
        {p.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.02;
          return (
            <span
              key={i}
              style={{
                color: on ? '#9be8bd' : '#fff',
                borderBottom: `6px solid ${on ? '#2ec27e' : 'transparent'}`,
                paddingBottom: 1,
              }}
            >
              {w.t}
              {i < p.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const SceneFrame: React.FC<{s: Timed; children: React.ReactNode}> = ({s, children}) => {
  const f = useCurrentFrame();
  const dip = interpolate(f, [0, 7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <div style={{position: 'absolute', left: 0, top: CTOP, width: CW, height: CH, overflow: 'hidden', background: C.cream}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: C.cream, opacity: dip, pointerEvents: 'none'}} />
      </div>
      <Header kicker={s.kicker} title={s.title} />
      <Caption s={s} />
    </AbsoluteFill>
  );
};

const TONES = {
  orange: {bg: C.orange, fg: '#fff', bd: C.orange},
  white: {bg: '#fff', fg: C.ink, bd: C.ink},
  blue: {bg: C.blue, fg: '#fff', bd: C.blue},
  red: {bg: C.red, fg: '#fff', bd: C.red},
  green: {bg: C.green, fg: '#fff', bd: C.green},
};
export type Tone = keyof typeof TONES;

export const Chip: React.FC<{label: string; tone?: Tone; size?: number}> = ({label, tone = 'orange', size = 32}) => {
  const T = TONES[tone];
  return (
    <div
      style={{
        background: T.bg,
        color: T.fg,
        border: `3px solid ${T.bd}`,
        borderRadius: 14,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size,
        padding: '8px 20px 10px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
      }}
    >
      {label}
    </div>
  );
};

// Chip + garis penunjuk yang menempel ke titik 3D
export const Callout: React.FC<{cam: Cam; at: V3; label: string; dx: number; dy: number; tone?: Tone; from?: number; size?: number}> = ({
  cam,
  at,
  label,
  dx,
  dy,
  tone = 'orange',
  from = 0,
  size,
}) => {
  const f = useCurrentFrame();
  const k = easeOut(clamp01((f - from) / 9));
  if (k <= 0) return null;
  const [x, y] = project(at, cam);
  const T = TONES[tone];
  return (
    <AbsoluteFill style={{opacity: k, pointerEvents: 'none'}}>
      <svg width={CW} height={CH} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke={T.bd} strokeWidth={4} />
        <circle cx={x} cy={y} r={10} fill={T.bg} stroke="#fff" strokeWidth={3} />
      </svg>
      <div style={{position: 'absolute', left: x + dx, top: y + dy, translate: `-50% -50%`, scale: `${0.8 + 0.2 * k}`}}>
        <Chip label={label} tone={tone} size={size} />
      </div>
    </AbsoluteFill>
  );
};

export const Tag: React.FC<{label: string; left?: number; top?: number; from?: number}> = ({label, left = 48, top = 70, from = 0}) => {
  const f = useCurrentFrame();
  const k = easeOut(clamp01((f - from) / 8));
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        opacity: k,
        background: '#fff',
        border: `3px solid ${C.ink}`,
        borderRadius: 8,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: 1.5,
        padding: '5px 14px',
        color: C.ink,
      }}
    >
      {label}
    </div>
  );
};

export const StatBox: React.FC<{label: string; value: string; left?: number; top: number; from?: number; w?: number}> = ({label, value, left = 48, top, from = 0, w = 330}) => {
  const f = useCurrentFrame();
  const k = easeOut(clamp01((f - from) / 10));
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        opacity: k,
        translate: `0 ${(1 - k) * 20}px`,
        background: '#fff',
        border: `4px solid ${C.ink}`,
        borderRadius: 18,
        padding: '14px 22px 12px',
        boxShadow: '0 6px 0 rgba(28,43,39,0.9)',
      }}
    >
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 1.5, color: '#6b7a74'}}>{label}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.05, whiteSpace: 'nowrap', color: C.orange, letterSpacing: -2}}>{value}</div>
    </div>
  );
};
