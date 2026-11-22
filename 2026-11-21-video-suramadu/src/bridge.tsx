import React, {useMemo} from 'react';
import {tex} from './fx';
import * as THREE from 'three';
import {Box, Cyl, DECK, Glow, TH, V3, rnd} from './kit';

const conc = (night: boolean) => (night ? '#9a98aa' : '#f2efe8');
const steel = (night: boolean) => (night ? '#7b8294' : '#868c93');
const LEG_Z0 = 3.5; // lebar kaki menara di bawah
const LEG_Z1 = 2.7; // di puncak
export const zAt = (y: number, h: number) => LEG_Z0 + (LEG_Z1 - LEG_Z0) * Math.min(1, Math.max(0, (y - 0.5) / Math.max(1, h - 0.5)));

// batang meruncing (penampang kotak) dari titik a ke b
const Taper: React.FC<{a: V3; b: V3; rBot: number; rTop: number; c: string}> = ({a, b, rBot, rTop, c}) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const map = useMemo(() => tex('concrete', 1, d.length() / 4), [d.length()]);
  return (
    <mesh position={mid} quaternion={q} castShadow receiveShadow>
      <cylinderGeometry args={[rTop, rBot, d.length(), 4]} />
      <meshStandardMaterial color={c} map={map} roughness={0.85} />
    </mesh>
  );
};

export const TowerAt: React.FC<{x: number; h?: number; night?: boolean; cap?: boolean}> = ({x, h = TH, night = false, cap = true}) => {
  const c = conc(night);
  const beams = [DECK - 1.1, h * 0.62].filter((y) => y < h - 1.5 && y > 1);
  return (
    <group position={[x, 0, 0]}>
      {cap ? (
        <>
          <Box p={[0, -0.5, 0]} s={[7, 2, 10.6]} c={night ? '#6a6878' : '#d4cfc4'} t="concrete" />
          <Box p={[0, 0.55, 0]} s={[5.2, 0.4, 9.2]} c={night ? '#7a7786' : '#e2ddd2'} t="concrete" />
        </>
      ) : null}
      {[-1, 1].map((k) => (
        <Taper key={k} a={[0, 0.7, k * LEG_Z0]} b={[0, h, k * LEG_Z1]} rBot={1.05} rTop={0.66} c={c} />
      ))}
      {beams.map((y, i) => (
        <Box key={i} p={[0, y, 0]} s={[1.05, 0.75, 2 * zAt(y, h)]} c={c} t="concrete" />
      ))}
      {h > TH - 1 ? (
        <>
          <Box p={[0, h - 0.45, 0]} s={[1.5, 1.0, 2 * LEG_Z1 + 0.6]} c={c} t="concrete" />
          <Box p={[0, h + 0.2, 0]} s={[0.9, 0.35, 2 * LEG_Z1 + 0.2]} c={night ? '#9a96a4' : '#d2cdbf'} />
          {[-1, 1].map((k) => (
            <group key={k}>
              <mesh position={[0, h + 0.75, k * LEG_Z1]}>
                <sphereGeometry args={[0.26, 10, 10]} />
                <meshStandardMaterial color="#ff3030" emissive="#ff2020" emissiveIntensity={night ? 2.5 : 0.4} />
              </mesh>
              {night ? <Glow p={[0, h + 0.75, k * LEG_Z1]} size={3.2} color="#ff4a3a" /> : null}
            </group>
          ))}
        </>
      ) : null}
    </group>
  );
};

export const DeckSeg: React.FC<{x0: number; x1: number; y?: number; night?: boolean; c?: string}> = ({x0, x1, y = DECK, night = false, c}) => {
  const len = x1 - x0;
  if (len < 0.02) return null;
  const mid = (x0 + x1) / 2;
  return (
    <group>
      <Box p={[mid, y, 0]} s={[len, 0.5, 6]} c={c ?? (night ? '#8a90a2' : '#c2c6cc')} t="deck" ts={3} metal={0.3} rough={0.6} />
      <Box p={[mid, y - 0.42, 0]} s={[len, 0.4, 3.4]} c={night ? '#5d6373' : '#6e747c'} />
      <Box p={[mid, y + 0.29, 0]} s={[len, 0.07, 5.2]} c={night ? '#5a5d66' : '#9a9da3'} t="asphalt" ts={3} rough={0.95} />
      <Box p={[mid, y + 0.34, 0]} s={[len, 0.02, 0.12]} c="#f4d03f" />
      {[-1, 1].map((k) => (
        <React.Fragment key={k}>
          <Box p={[mid, y + 0.45, k * 2.78]} s={[len, 0.3, 0.2]} c={night ? '#c7c9d6' : '#eceae3'} />
          <Box p={[mid, y + 0.34, k * 2.35]} s={[len, 0.02, 0.07]} c="#f3f3ee" />
        </React.Fragment>
      ))}
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
        <group key={`${i}${k}`}>
          <Cyl
            a={[tx, ty, k * zAt(ty, h)]}
            b={[ax, DECK + 0.45, k * 2.85]}
            r={0.075}
            c={night ? '#d6dcff' : '#f6f3e8'}
            emissive={night ? '#3a4688' : undefined}
          />
          <Box p={[ax, DECK + 0.5, k * 2.85]} s={[0.32, 0.4, 0.32]} c={night ? '#c4c8e8' : '#d9d3c2'} />
        </group>,
      );
    });
  }
  return <>{out}</>;
};

const Approach: React.FC<{side: 1 | -1; night: boolean}> = ({side, night}) => {
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
    piers.push(
      <group key={k}>
        <Box p={[side * x, (dy - 0.8 - 1.2) / 2, 0]} s={[0.9, dy + 0.4, 1.5]} c={conc(night)} t="concrete" />
        <Box p={[side * x, dy - 0.6, 0]} s={[1.2, 0.45, 3.6]} c={conc(night)} t="concrete" />
      </group>,
    );
  }
  return (
    <group>
      <mesh position={[(side * (x0 + x1)) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, side * ang]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.55, 6]} />
        <meshStandardMaterial color={steel(night)} flatShading />
      </mesh>
      <mesh position={[(side * (x0 + x1)) / 2, (y0 + y1) / 2 + 0.3, 0]} rotation={[0, 0, side * ang]}>
        <boxGeometry args={[len, 0.07, 5.2]} />
        <meshStandardMaterial color={night ? '#23262d' : '#33383f'} flatShading />
      </mesh>
      {piers}
    </group>
  );
};

// daratan di ujung jembatan (Surabaya di kiri, Madura di kanan)
const Shore: React.FC<{night: boolean}> = ({night}) => (
  <group>
    {[-1, 1].map((side) => (
      <group key={side}>
        <Box p={[side * 340, 0.2, 0]} s={[220, 2.4, 420]} c={night ? '#2d3a40' : side < 0 ? '#aeb59a' : '#8fbf7a'} />
        {Array.from({length: 70}).map((_, i) => (
          <Box
            key={i}
            p={[side * (240 + rnd(i * 2) * 150), 1.8 + rnd(i + 3) * (side < 0 ? 5 : 1.2), -170 + rnd(i * 3) * 340]}
            s={[3 + rnd(i) * 5, 2 + rnd(i + 4) * (side < 0 ? 9 : 2), 3 + rnd(i + 7) * 5]}
            c={night ? '#4c4f5e' : side < 0 ? '#d7d2c8' : '#c97b5e'}
            emissive={night ? '#ffcf80' : undefined}
            ei={0.35}
          />
        ))}
      </group>
    ))}
  </group>
);

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
          <group key={`${x}${k}`}>
            <mesh position={[x, DECK + 0.95, k * 2.9]}>
              <sphereGeometry args={[0.16, 6, 6]} />
              <meshStandardMaterial color="#ffd98a" emissive="#ffc45a" emissiveIntensity={2.5} />
            </mesh>
            {Math.abs(x) % 8 === 0 ? <Glow p={[x, DECK + 1.0, k * 2.9]} size={2.4} /> : null}
          </group>,
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
      {approach ? (
        <>
          <Approach side={-1} night={night} />
          <Approach side={1} night={night} />
          <Shore night={night} />
        </>
      ) : null}
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
      {night ? <Glow p={[x - dir * 0.4, y + 3.3, 0]} size={7} color="#ffb84a" opacity={0.8} /> : null}
    </group>
  );
};

export const Segment: React.FC<{p: V3; w?: number; glow?: boolean}> = ({p, w = 4.2, glow}) => (
  <group>
    <Box p={p} s={[w, 0.8, 5.8]} c="#c8461c" emissive={glow ? '#ff5a1e' : undefined} ei={0.5} />
    <Box p={[p[0], p[1] + 0.45, p[2]]} s={[w, 0.12, 5.4]} c="#2f3238" />
  </group>
);

export const Searchlight: React.FC<{p: V3; tilt?: [number, number]; len?: number}> = ({p, tilt = [0, 0], len = 60}) => (
  <group>
    <mesh position={[p[0] + tilt[1] * len * 0.5, p[1] + len / 2, p[2] + tilt[0] * len * 0.5]} rotation={[Math.PI + tilt[0], 0, tilt[1]]}>
      <coneGeometry args={[5, len, 24, 1, true]} />
      <meshBasicMaterial color="#c9d8ff" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} fog={false} />
    </mesh>
    <Glow p={[p[0], p[1] + 0.5, p[2]]} size={6} color="#cfe0ff" opacity={0.8} />
  </group>
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
      <Box p={[0, 0.15, 0]} s={[10.2, 0.4, 3.3]} c="#9b2f2f" />
      <mesh position={[5.9, 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[2.1, 1.3, 2.1]} />
        <meshStandardMaterial color="#1c3f7a" flatShading />
      </mesh>
      <Box p={[-4.1, 1.9, 0]} s={[1.5, 1.8, 3]} c="#f3f3f0" />
      <Box p={[-4.1, 2.9, 0]} s={[1.0, 0.4, 2.6]} c="#2b3238" />
      {boxes}
    </group>
  );
};
