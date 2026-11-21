import React from 'react';
import * as THREE from 'three';
import {Box, Cyl, DECK, TH, V3, rnd} from './kit';

const conc = (night: boolean) => (night ? '#b4b0bc' : '#e6e2d8');
const steel = (night: boolean) => (night ? '#7b8294' : '#868c93');

export const TowerAt: React.FC<{x: number; h?: number; night?: boolean; cap?: boolean}> = ({x, h = TH, night = false, cap = true}) => (
  <group position={[x, 0, 0]}>
    {cap ? <Box p={[0, -0.4, 0]} s={[6.5, 1.8, 10]} c={night ? '#5b5962' : '#bdb8ac'} /> : null}
    {[-1, 1].map((k) => (
      <Box key={k} p={[0, (h + 0.5) / 2, k * 3.2]} s={[1.4, h - 0.5, 1.4]} c={conc(night)} />
    ))}
    {h > DECK + 2 ? <Box p={[0, DECK - 1.1, 0]} s={[1.1, 0.7, 8]} c={conc(night)} /> : null}
    {h > TH - 1 ? <Box p={[0, h - 0.5, 0]} s={[1.3, 1.0, 8]} c={conc(night)} /> : null}
    {h > TH - 1 ? (
      <mesh position={[0, h + 0.3, 3.2]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#ff3030" emissive="#ff2020" emissiveIntensity={night ? 2 : 0.3} />
      </mesh>
    ) : null}
  </group>
);

export const DeckSeg: React.FC<{x0: number; x1: number; y?: number; night?: boolean; c?: string}> = ({x0, x1, y = DECK, night = false, c}) => {
  const len = x1 - x0;
  if (len < 0.02) return null;
  const mid = (x0 + x1) / 2;
  return (
    <group>
      <Box p={[mid, y, 0]} s={[len, 0.55, 6]} c={c ?? steel(night)} />
      <Box p={[mid, y + 0.3, 0]} s={[len, 0.08, 5.2]} c={night ? '#23262d' : '#3a3f46'} />
    </group>
  );
};

export const CablesAt: React.FC<{
  tx: number;
  dir: 1 | -1;
  h?: number;
  ok: (x: number) => boolean;
  night?: boolean;
  n?: number;
  start?: number;
  spacing?: number;
}> = ({tx, dir, h = TH, ok, night = false, n = 10, start = 2.2, spacing = 2.2}) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const ax = tx + dir * (start + i * spacing);
    if (!ok(ax)) continue;
    const ty = h - 0.6 - (n - 1 - i) * 0.3;
    [-1, 1].forEach((k) => {
      out.push(
        <Cyl
          key={`${i}${k}`}
          a={[tx, ty, k * 3.2]}
          b={[ax, DECK + 0.3, k * 3]}
          r={0.07}
          c={night ? '#d6dcff' : '#f6f3e8'}
          emissive={night ? '#8fa0ff' : undefined}
        />,
      );
    });
  }
  return <>{out}</>;
};

const Approach: React.FC<{side: 1 | -1; night: boolean; show: boolean}> = ({side, night, show}) => {
  if (!show) return null;
  const x0 = 44;
  const x1 = 230;
  const y0 = DECK;
  const y1 = 1.2;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const piers: React.ReactNode[] = [];
  for (let k = 0; k < 22; k++) {
    const x = x0 + 4 + k * 8;
    const dy = y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
    piers.push(<Box key={k} p={[side * x, (dy - 0.3 - 1.2) / 2, 0]} s={[0.9, dy + 0.9, 3]} c={conc(night)} />);
  }
  return (
    <group>
      <mesh position={[(side * (x0 + x1)) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, side * ang]}>
        <boxGeometry args={[len, 0.55, 6]} />
        <meshStandardMaterial color={steel(night)} flatShading />
      </mesh>
      {piers}
    </group>
  );
};

export const Bridge: React.FC<{gapHalf?: number; night?: boolean; h?: number; approach?: boolean; lamps?: boolean; segColor?: string}> = ({
  gapHalf = 0,
  night = false,
  h = TH,
  approach = true,
  lamps = false,
}) => {
  const ok = (x: number) => Math.abs(x) >= gapHalf - 0.01 && Math.abs(x) <= 44;
  const lampNodes: React.ReactNode[] = [];
  if (lamps) {
    for (let x = -44; x <= 44; x += 4) {
      if (Math.abs(x) < gapHalf) continue;
      [-1, 1].forEach((k) =>
        lampNodes.push(
          <mesh key={`${x}${k}`} position={[x, DECK + 0.95, k * 3.1]}>
            <sphereGeometry args={[0.16, 6, 6]} />
            <meshStandardMaterial color="#ffd98a" emissive="#ffc45a" emissiveIntensity={2.5} />
          </mesh>,
        ),
      );
    }
  }
  return (
    <group>
      <TowerAt x={-20} h={h} night={night} />
      <TowerAt x={20} h={h} night={night} />
      <DeckSeg x0={-44} x1={-gapHalf} night={night} />
      <DeckSeg x0={gapHalf} x1={44} night={night} />
      <Approach side={-1} night={night} show={approach} />
      <Approach side={1} night={night} show={approach} />
      {h > TH - 1 ? (
        <>
          <CablesAt tx={-20} dir={1} ok={ok} night={night} />
          <CablesAt tx={-20} dir={-1} ok={ok} night={night} />
          <CablesAt tx={20} dir={1} ok={ok} night={night} />
          <CablesAt tx={20} dir={-1} ok={ok} night={night} />
        </>
      ) : null}
      {lampNodes}
    </group>
  );
};

export const Gantry: React.FC<{x: number; y?: number; dir: 1 | -1; night?: boolean}> = ({x, y = DECK + 0.3, dir, night = false}) => {
  const c = '#f5b800';
  const em = night ? '#ff9d00' : undefined;
  return (
    <group>
      {[-1, 1].map((k) => (
        <group key={k}>
          <Cyl a={[x + dir * 2.2, y, k * 2.6]} b={[x + dir * 0.7, y + 3.4, k * 2.6]} r={0.17} c={c} emissive={em} />
          <Cyl a={[x + dir * 0.7, y + 3.4, k * 2.6]} b={[x - dir * 1.7, y + 3.4, k * 2.6]} r={0.17} c={c} emissive={em} />
          <Cyl a={[x - dir * 1.7, y + 3.4, k * 2.6]} b={[x - dir * 1.7, y + 0.2, k * 2.6]} r={0.1} c={c} emissive={em} />
        </group>
      ))}
      <Cyl a={[x - dir * 1.7, y + 3.4, -2.6]} b={[x - dir * 1.7, y + 3.4, 2.6]} r={0.14} c={c} emissive={em} />
      <Cyl a={[x + dir * 0.7, y + 3.4, -2.6]} b={[x + dir * 0.7, y + 3.4, 2.6]} r={0.14} c={c} emissive={em} />
      {night ? <pointLight position={[x - dir * 0.4, y + 3, 0]} intensity={60} distance={18} color="#ffcf70" /> : null}
    </group>
  );
};

export const Segment: React.FC<{p: V3; w?: number; glow?: boolean}> = ({p, w = 4.2, glow}) => (
  <Box p={p} s={[w, 0.8, 5.8]} c="#c8461c" emissive={glow ? '#ff5a1e' : undefined} ei={0.5} />
);

export const Searchlight: React.FC<{p: V3; tilt?: [number, number]; len?: number}> = ({p, tilt = [0, 0], len = 60}) => (
  <mesh position={[p[0] + tilt[1] * len * 0.5, p[1] + len / 2, p[2] + tilt[0] * len * 0.5]} rotation={[Math.PI + tilt[0], 0, tilt[1]]}>
    <coneGeometry args={[5, len, 24, 1, true]} />
    <meshBasicMaterial color="#c9d8ff" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
  </mesh>
);

export const CityLights: React.FC<{z?: number}> = ({z = -140}) => (
  <group>
    {Array.from({length: 110}).map((_, i) => (
      <mesh key={i} position={[-160 + i * 3 + rnd(i) * 2, 1.2 + rnd(i + 9) * 3.5, z - rnd(i + 3) * 25]}>
        <boxGeometry args={[0.9, 0.5 + rnd(i + 5) * 1.2, 0.9]} />
        <meshStandardMaterial color="#ffe3a0" emissive="#ffcb6b" emissiveIntensity={1.6} />
      </mesh>
    ))}
  </group>
);

export const Ship: React.FC<{p: V3; sc?: number}> = ({p, sc = 1}) => {
  const pal = ['#d94b3d', '#2f6fe0', '#f2b705', '#3aa675', '#e8e8e8', '#8a5bd1'];
  const boxes: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 3; j++)
      for (let l = 0; l < 2; l++)
        boxes.push(<Box key={`${i}${j}${l}`} p={[-3.4 + i * 1.15, 1.45 + l * 0.52, -0.95 + j * 0.95]} s={[1.05, 0.5, 0.9]} c={pal[Math.floor(rnd(i * 7 + j * 3 + l) * pal.length)]} />);
  return (
    <group position={p} scale={sc}>
      <Box p={[0, 0.55, 0]} s={[10, 1.3, 3.2]} c="#1c3f7a" />
      <Box p={[5.4, 0.5, 0]} s={[1.6, 1.0, 2.2]} c="#1c3f7a" rot={[0, 0, 0]} />
      <Box p={[-4.1, 1.9, 0]} s={[1.5, 1.8, 3]} c="#f3f3f0" />
      {boxes}
    </group>
  );
};
