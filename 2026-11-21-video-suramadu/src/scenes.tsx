import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Box, Burst, Cam, Clouds, Cyl, DECK, Person, Sea, Stage, TH, V3, clamp01, ease, easeOut, lerp, lerp3, rnd} from './kit';
import {Bridge, CablesAt, CityLights, DeckSeg, Gantry, Searchlight, Segment, Ship, TowerAt} from './bridge';
import {Callout, SceneFrame, StatBox, Tag, C} from './ui';
import {FPS, Timed} from './script';

type P = {s: Timed};
const DAY_BG = '#dcefec';
const DAY_SKY: [string, string] = ['#6fb0e4', '#e3f2ee'];
const NIGHT_SKY: [string, string] = ['#03051a', '#1b2b66'];
const SEA_DAY = '#86cfc6';
const NIGHT_BG = '#15204e';

const useT = (s: Timed) => {
  const f = useCurrentFrame();
  return {f, t: f / FPS, p: clamp01(f / s.dur)};
};

const NightWorld: React.FC<{f: number; gapHalf: number; lights?: boolean}> = ({f, gapHalf, lights = true}) => (
  <>
    <Sea f={f} color="#16275a" size={600} seg={130} amp={0.12} />
    <Bridge night gapHalf={gapHalf} lamps />
    <CityLights />
    {lights ? (
      <>
        <Searchlight p={[-30, 1, -10]} tilt={[0.12, -0.22]} />
        <Searchlight p={[-10, 1, -14]} tilt={[0.08, 0.1]} />
        <Searchlight p={[30, 1, -10]} tilt={[0.12, 0.22]} />
        <Searchlight p={[12, 1, -14]} tilt={[0.08, -0.1]} />
      </>
    ) : null}
  </>
);

// ---------- 01 ----------
const S01: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: lerp3([-72, 19, 18], [-54, 14, 11], p), look: [0, 7, 0], fov: 46};
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={NIGHT_BG} sky={NIGHT_SKY} stars fog={[90, 330]} night>
        <NightWorld f={f} gapHalf={1.4} />
      </Stage>
      <Callout cam={cam} at={[0, DECK + 0.3, 0]} label="potongan terakhir" dx={150} dy={230} from={40} />
    </SceneFrame>
  );
};

// ---------- 02 & 14: celah malam ----------
const GapNight: React.FC<{f: number; segY: number; showSeg?: boolean; g?: number}> = ({f, segY, showSeg = true, g = 2.3}) => (
  <>
    <Sea f={f} color="#16275a" size={600} seg={130} amp={0.1} />
    <Bridge night gapHalf={g} lamps />
    <CityLights />
    <Gantry x={-g} dir={-1} night />
    <Gantry x={g} dir={1} night />
    {showSeg ? (
      <>
        <Segment p={[0, segY, 0]} glow />
        {[-1, 1].map((k) => (
          <React.Fragment key={k}>
            <Cyl a={[-0.6, DECK + 3.7, k * 2.6]} b={[-1.6, segY + 0.45, k * 2.6]} r={0.05} c="#ffd98a" />
            <Cyl a={[0.6, DECK + 3.7, k * 2.6]} b={[1.6, segY + 0.45, k * 2.6]} r={0.05} c="#ffd98a" />
          </React.Fragment>
        ))}
      </>
    ) : null}
    <Searchlight p={[-14, 1, -14]} tilt={[0.1, -0.2]} />
    <Searchlight p={[14, 1, -14]} tilt={[0.1, 0.2]} />
  </>
);

const S02: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: [lerp(-1.5, 1.2, p), lerp(6.2, 5.6, p), lerp(17, 13.5, p)], look: [0, 4.2, 0], fov: 52};
  const segY = lerp(0.5, DECK + 0.05, ease((p - 0.1) / 0.8));
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={NIGHT_BG} sky={NIGHT_SKY} stars fog={[40, 260]} night>
        <GapNight f={f} segY={segY} />
      </Stage>
      <Callout cam={cam} at={[0, segY, 2.9]} label="potongan terakhir" dx={170} dy={190} from={12} />
    </SceneFrame>
  );
};

// ---------- 03 ----------
const S03: React.FC<P> = ({s}) => {
  const {f, t} = useT(s);
  const cam: Cam = {pos: [-68, 9, 10], look: [0, 17, 0], fov: 58};
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={NIGHT_BG} sky={NIGHT_SKY} stars fog={[90, 340]} night>
        <NightWorld f={f} gapHalf={0} />
        <Burst c={[-8, 26, -4]} t={t - 0.2} color="#ffffff" />
        <Burst c={[2, 31, -6]} t={t - 0.55} color="#8fc2ff" r={10} />
        <Burst c={[12, 25, -3]} t={t - 0.9} color="#9dffb0" />
        <Burst c={[-18, 20, -5]} t={t - 1.2} color="#ffd27a" r={7} />
      </Stage>
    </SceneFrame>
  );
};

// ---------- 04 ----------
const DayWorld: React.FC<{f: number; gapHalf: number; dy?: number; h?: number}> = ({f, gapHalf, dy = 0, h = TH}) => (
  <>
    <Sea f={f} color={SEA_DAY} size={600} seg={130} />
        <Clouds f={f} />
    <group position={[0, dy, 0]}>
      <Bridge gapHalf={gapHalf} h={h} />
    </group>
  </>
);

const S04: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: lerp3([-38, 25, 54], [-30, 22, 50], p), look: [0, 5, 0], fov: 48};
  const year = Math.round(lerp(2009, 2004, easeOut(p / 0.62)));
  const dy = -ease((p - 0.55) / 0.35) * 45;
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[150, 480]}>
        <DayWorld f={f} gapHalf={1.4} dy={dy} />
      </Stage>
      <Tag label="DIPUTAR MUNDUR" left={48} top={64} />
      <StatBox label="MUNDUR KE" value={String(year)} top={560} from={6} />
    </SceneFrame>
  );
};

// ---------- 05 ----------
const S05: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: [6, 34, 26], look: [0, 0, -3], fov: 42};
  const z = lerp(10, -14, p);
  const strips: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    strips.push(<Box key={`a${i}`} p={[-8, 0.12, -60 + i * 4]} s={[0.45, 0.05, 2.2]} c="#f07a2e" />);
    strips.push(<Box key={`b${i}`} p={[8, 0.12, -60 + i * 4]} s={[0.45, 0.05, 2.2]} c="#f07a2e" />);
  }
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg="#cfe7e4">
        <Box p={[0, -2.5, 0]} s={[200, 1, 200]} c="#e4c9a9" />
        <Box p={[0, 0, 0]} s={[200, 0.1, 200]} c="#7fcfc4" opacity={0.55} />
        <Box p={[0, 0.06, -1]} s={[14, 0.02, 120]} c="#f2ddc0" opacity={0.7} />
        {strips}
        <group position={[0, 0.5, z]}>
          <Box p={[0, 0, 0]} s={[2.4, 0.9, 6.6]} c="#5d86b0" />
          <Box p={[0, 0.75, -0.9]} s={[1.6, 1.0, 1.9]} c="#e3edf5" />
          <Box p={[0, 0.5, 2.5]} s={[2.1, 0.2, 1.8]} c="#f07a2e" />
          <Cyl a={[0, 1.2, -0.9]} b={[0, 2.6, -0.9]} r={0.07} c="#34495e" />
          {[-1, 1].map((k) => (
            <React.Fragment key={k}>
              <Cyl a={[k * 0.9, 0.5, 3.3]} b={[k * 5.2, 0, 13]} r={0.05} c="#233" />
              <mesh position={[k * 5.2, 0.2, 13]}>
                <sphereGeometry args={[0.55, 10, 8]} />
                <meshStandardMaterial color="#f07a2e" flatShading />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      </Stage>
      <Callout cam={cam} at={[0, 1.8, z - 0.9]} label="kapal penyapu ranjau" tone="white" dx={-210} dy={-170} from={14} size={30} />
      <Callout cam={cam} at={[5.2, 0.6, z + 13]} label="alat sapu ditarik" dx={-60} dy={140} from={34} size={30} />
    </SceneFrame>
  );
};

// ---------- cross-section laut ----------
const Mine: React.FC<{p: V3; k: number; hot?: boolean}> = ({p, k, hot}) => {
  const dirs: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  return (
    <group position={p} scale={k}>
      <mesh>
        <sphereGeometry args={[0.85, 14, 10]} />
        <meshStandardMaterial color="#b3402a" flatShading emissive={hot ? '#ff5a30' : '#000'} emissiveIntensity={hot ? 1 : 0} />
      </mesh>
      {dirs.map((d, i) => (
        <mesh key={i} position={[d[0] * 0.95, d[1] * 0.95, d[2] * 0.95]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d))}>
          <coneGeometry args={[0.2, 0.45, 6]} />
          <meshStandardMaterial color="#8c2f1f" flatShading />
        </mesh>
      ))}
    </group>
  );
};

const Seabed: React.FC<{f: number}> = ({f}) => (
  <>
    <Box p={[0, -9, 0]} s={[60, 8, 9]} c="#7a5a3f" />
    <Box p={[0, -5.1, 0]} s={[60, 0.3, 9]} c="#a07c58" />
    {Array.from({length: 36}).map((_, i) => (
      <Box key={i} p={[-14 + rnd(i) * 28, -5.6 - rnd(i + 4) * 5, 4.55]} s={[0.4 + rnd(i + 2), 0.18, 0.05]} c="#5d4330" />
    ))}
    <Box p={[0, 0, 0]} s={[60, 10, 9]} c="#6fc7c0" opacity={0.42} />
    <Box p={[0, 5.02, 0]} s={[60, 0.1, 9]} c="#d7fff7" />
    {Array.from({length: 14}).map((_, i) => (
      <mesh key={i} position={[-12 + i * 1.9, -3.5 + ((f * 0.03 + i * 0.37) % 6), 3.5 + rnd(i) * 0.6]}>
        <sphereGeometry args={[0.07, 5, 5]} />
        <meshBasicMaterial color="#e8fffb" transparent opacity={0.6} />
      </mesh>
    ))}
  </>
);

const S06: React.FC<P> = ({s}) => {
  const {f, t} = useT(s);
  const cam: Cam = {pos: [0, -1.5, 36], look: [0, -1.5, 0], fov: 46};
  const t3 = s.phr[2].s;
  const xs = [-5.8, -2, 1.8, 5.6];
  const rings = [0, 1, 2].map((i) => ((f * 0.17 + i * 3.2) % 9.6) + 1);
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY}>
        <Seabed f={f} />
        <Box p={[0, 5.4, 0]} s={[3.6, 0.7, 1.6]} c="#5d86b0" />
        <Box p={[-0.3, 6.1, 0]} s={[1.3, 0.8, 1.2]} c="#e3edf5" />
        {rings.map((r, i) => (
          <mesh key={i} position={[0, 5, 1]}>
            <ringGeometry args={[r, r + 0.16, 56, 1, Math.PI * 1.08, Math.PI * 0.84]} />
            <meshBasicMaterial color="#bff7ee" transparent opacity={clamp01(1 - r / 11)} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {xs.map((x, i) => {
          const te = t3 + 0.35 + i * 0.28;
          const boom = t - te;
          const alive = boom < 0;
          return (
            <group key={i}>
              <Cyl a={[x, -5, 0]} b={[x, -3.5 + Math.sin(f * 0.06 + i) * 0.15, 0]} r={0.05} c="#3a3a3a" />
              {alive ? <Mine p={[x, -3.5 + Math.sin(f * 0.06 + i) * 0.15, 0]} k={1} hot={t > s.phr[1].s + 0.9 + i * 0.2} /> : null}
              {boom >= 0 && boom < 0.7 ? (
                <mesh position={[x, -3.3, 0]} scale={1 + boom * 6}>
                  <sphereGeometry args={[1, 12, 10]} />
                  <meshBasicMaterial color={boom < 0.15 ? '#ffffff' : '#ff9a3a'} transparent opacity={1 - boom / 0.7} />
                </mesh>
              ) : null}
              {boom >= 0 && boom < 1.2 ? (
                <Box p={[x, -3 + boom * 9, 0]} s={[0.9, 1.4 + boom * 6, 0.9]} c="#e9fffb" opacity={clamp01(1 - boom / 1.2) * 0.8} />
              ) : null}
            </group>
          );
        })}
      </Stage>
      <Tag label="ILUSTRASI · SELAT DIBELAH" left={48} top={60} />
      <Callout cam={cam} at={[0.6, 5.2, 0.9]} label="sonar" tone="blue" dx={250} dy={-30} from={20} />
      <Callout cam={cam} at={[-2, -3.5, 0.9]} label="ranjau laut sisa perang" tone="red" dx={-30} dy={-300} from={Math.round((s.phr[1].s + 0.3) * FPS)} size={29} />
      <StatBox label="RANJAU DILEDAKKAN" value="56" left={48} top={900} from={Math.round(t3 * FPS)} w={420} />
    </SceneFrame>
  );
};

// ---------- 07 pondasi ----------
const S07: React.FC<P> = ({s}) => {
  const {f, t, p} = useT(s);
  const cam: Cam = {pos: [0, -1.5, 38], look: [0, -0.5, 0], fov: 46};
  const xs = [-4, 0, 4];
  const capY = lerp(16, 9.2, easeOut((p - 0.62) / 0.25));
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY}>
        <Seabed f={f} />
        {xs.map((x, i) => {
          const k = ease((t - 0.7 - i * 0.45) / 1.7);
          const top = lerp(21, 8.5, k);
          return <Box key={i} p={[x, top - 8, 0]} s={[1.0, 16, 1.0]} c="#7d8791" />;
        })}
        <Box p={[0, capY, 0]} s={[11, 1.6, 6]} c="#d8d3c8" />
      </Stage>
      <Callout cam={cam} at={[4, -3, 0.6]} label="tiang pondasi" tone="orange" dx={-180} dy={-380} from={50} />
      <Callout cam={cam} at={[-6, -7.4, 4.6]} label="dasar selat" tone="white" dx={60} dy={170} from={80} size={28} />
    </SceneFrame>
  );
};

// ---------- 08 tongkat di lumpur ----------
const S08: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: [0, 2.2, 25], look: [0, 0.2, 0], fov: 46};
  const k = ease((p - 0.08) / 0.5);
  const bottom = lerp(1.6, -6.4, k);
  const top = bottom + 11;
  const arrows = [-5.5, -3.2, -0.9].map((y) => y);
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg="#cde9d4">
        <Box p={[0, 0.3, 0]} s={[34, 0.6, 9]} c="#7cc24f" />
        <Box p={[0, -4.8, 0]} s={[34, 9.6, 9]} c="#4a3225" />
        {Array.from({length: 60}).map((_, i) => (
          <Box key={i} p={[-14 + rnd(i) * 28, -0.8 - rnd(i + 5) * 8.4, 4.55]} s={[0.4 + rnd(i + 3) * 0.8, 0.16, 0.05]} c="#2f1f16" />
        ))}
        {Array.from({length: 46}).map((_, i) => (
          <mesh key={i} position={[-15 + i * 0.68, 1.1, 3 + rnd(i) * 1.2]} rotation={[0, 0, (rnd(i + 2) - 0.5) * 0.4]}>
            <coneGeometry args={[0.12, 1.5 + rnd(i + 1), 4]} />
            <meshStandardMaterial color="#4fa83a" flatShading />
          </mesh>
        ))}
        <Cyl a={[1.6, bottom, 0]} b={[1.6, top, 0]} r={0.33} c="#f2b705" />
        <Person p={[-0.4, 0.6, 0]} f={f} rotY={Math.PI / 2} sc={1.7} shirt="#eee9e0" armsFwd={-2.4} />
        {k > 0.55
          ? arrows.map((y, i) => {
              const a = clamp01((k - 0.55) / 0.3 - i * 0.12);
              return [-1, 1].map((sd) => (
                <group key={`${i}${sd}`} position={[1.6 + sd * 1.0, y, 0.2]} scale={a}>
                  <Cyl a={[0, -0.8, 0]} b={[0, 0.5, 0]} r={0.09} c="#f07a2e" />
                  <mesh position={[0, 0.8, 0]}>
                    <coneGeometry args={[0.28, 0.5, 6]} />
                    <meshStandardMaterial color="#f07a2e" flatShading />
                  </mesh>
                </group>
              ));
            })
          : null}
        {k > 0.9 ? (
          <group position={[1.6, -7.4, 0.6]}>
            <Box p={[0, 0, 0]} s={[1.5, 0.22, 0.2]} c={C.red} rot={[0, 0, 0.78]} />
            <Box p={[0, 0, 0]} s={[1.5, 0.22, 0.2]} c={C.red} rot={[0, 0, -0.78]} />
          </group>
        ) : null}
      </Stage>
      <Tag label="PERUMPAMAAN" left={48} top={70} />
      <Callout cam={cam} at={[2.6, -3.4, 0.4]} label="gesekan" dx={230} dy={-30} from={Math.round(s.phr[2].s * FPS)} />
      <Callout cam={cam} at={[1.6, -7.4, 0.6]} label="ujung" tone="red" dx={-200} dy={20} from={Math.round(s.phr[1].s * FPS) + 10} />
    </SceneFrame>
  );
};

// ---------- 09 menara ----------
const Crane: React.FC<{x: number; h: number}> = ({x, h}) => (
  <group>
    <Cyl a={[x + 0.9, h, 0]} b={[x + 0.9, h + 6.5, 0]} r={0.18} c="#f5b800" />
    <Cyl a={[x - 4, h + 6.5, 0]} b={[x + 3.5, h + 6.5, 0]} r={0.14} c="#f5b800" />
    <Cyl a={[x - 3, h + 6.5, 0]} b={[x - 3, h + 3, 0]} r={0.04} c="#333" />
  </group>
);

const S09: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: lerp3([-3, 9, 72], [3, 11, 64], p), look: [0, 7, 0], fov: 52};
  const hl = lerp(4, TH, easeOut((p - 0.05) / 0.7));
  const hr = lerp(3, TH, easeOut((p - 0.1) / 0.75));
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[80, 380]}>
        <Sea f={f} color={SEA_DAY} size={600} seg={130} />
        <Clouds f={f} />
        <TowerAt x={-20} h={hl} />
        <TowerAt x={20} h={hr} />
        <Crane x={-20} h={hl} />
        <Crane x={20} h={hr} />
        <Cyl a={[-25, 0, 6]} b={[-25, hl, 6]} r={0.07} c={C.orange} />
        <Box p={[-25, hl, 6]} s={[1.2, 0.1, 0.1]} c={C.orange} />
      </Stage>
      <Callout cam={cam} at={[-25, hl, 6]} label="140 m+" dx={130} dy={-80} from={Math.round(s.phr[1].s * FPS) - 6} />
    </SceneFrame>
  );
};

// ---------- 10 lantai + kabel ----------
const S10: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: [lerp(-8, 8, p), 8.5, 29], look: [0, 6.5, 0], fov: 50};
  const cyc = 38;
  const kk = Math.max(0, f - 12) / cyc;
  const n = Math.min(5, Math.floor(kk));
  const frac = n >= 5 ? 1 : kk - n;
  const L = 3 + n * 3.4;
  const segY = lerp(0.9, DECK, ease(frac));
  const ok = (x: number) => Math.abs(x) <= L - 0.5;
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[100, 400]}>
        <Sea f={f} color={SEA_DAY} size={600} seg={130} />
        <Clouds f={f} />
        <TowerAt x={0} />
        <DeckSeg x0={-L} x1={L} />
        {[-1, 1].map((d) => (
          <React.Fragment key={d}>
            <CablesAt tx={0} dir={d as 1 | -1} ok={ok} n={9} start={2.2} spacing={1.7} />
            {n < 5 ? <Segment p={[d * (L + 1.7), segY, 0]} w={3.4} /> : null}
            {n < 5 ? <Box p={[d * (L + 1.7), 0.15, 0]} s={[4.6, 0.5, 6.4]} c="#6c727a" /> : null}
            <Gantry x={d * L} dir={d as 1 | -1} />
          </React.Fragment>
        ))}
      </Stage>
      <Callout cam={cam} at={[L + 1.7, segY, 3]} label="segmen baja" dx={110} dy={150} from={30} />
      <Callout cam={cam} at={[0, TH - 0.6 - 3, 3.2]} label="kabel" tone="white" dx={-170} dy={-120} from={Math.round(s.phr[2].s * FPS)} />
    </SceneFrame>
  );
};

// ---------- 11 tukang pikul ----------
const Basket: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.36, 0.5, 10]} />
      <meshStandardMaterial color="#d58a3c" flatShading />
    </mesh>
    {[-0.18, 0.1, 0.22].map((x, i) => (
      <mesh key={i} position={[x, 0.32, (i - 1) * 0.15]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#f2c230" flatShading />
      </mesh>
    ))}
  </group>
);

const S11: React.FC<P> = ({s}) => {
  const {f, t, p} = useT(s);
  const px = f * 0.03;
  const cam: Cam = {pos: [px + 1, 3.2, 14], look: [px, 2.1, 0], fov: 46};
  const amp = 0.26 * (1 - ease((p - 0.15) / 0.45));
  const a = Math.sin(f * 0.17) * amp + (p < 0.6 ? 0.1 * (1 - p / 0.6) : 0);
  const R = 1.75;
  const yPole = 1.9;
  const rot = 0.5;
  const endL: V3 = [-R * Math.cos(a), yPole - R * Math.sin(a), 0];
  const endR: V3 = [R * Math.cos(a), yPole + R * Math.sin(a), 0];
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[60, 260]}>
        <Clouds f={f} z={-120} y={45} />
        <Box p={[px, -0.25, 0]} s={[80, 0.5, 30]} c="#79b84a" />
        <Box p={[px, 0.03, 3.6]} s={[80, 0.06, 4.4]} c="#8b8f95" />
        {Array.from({length: 24}).map((_, i) => (
          <Box key={i} p={[Math.floor(px / 3) * 3 - 28 + i * 3, 0.07, 3.6]} s={[1.3, 0.02, 0.14]} c="#f3f3ee" />
        ))}
        {Array.from({length: 4}).map((_, i) => {
          const hx = Math.floor(px / 20) * 20 - 20 + i * 20;
          return (
            <group key={i} position={[hx, 0, -5]}>
              <Box p={[0, 2.2, 0]} s={[11, 4.4, 4]} c="#f3efe5" />
              <Box p={[0, 4.9, 0]} s={[12.4, 1.0, 5.4]} c="#c8553d" rot={[0, 0, 0]} />
              {[-3.5, 0, 3.5].map((wx) => (
                <Box key={wx} p={[wx, 2.6, 2.05]} s={[1.5, 1.7, 0.1]} c="#2b3238" />
              ))}
            </group>
          );
        })}
        <group position={[px, 0, 1.2]} rotation={[0, rot, 0]}>
          <Person p={[0, 0, 0]} f={f} walk shirt="#d8412f" pants="#222" sc={1.1} armsFwd={-0.3} />
          <group position={[0, yPole * 1.1, 0]} rotation={[0, 0, a]}>
            <Cyl a={[-R, 0, 0]} b={[R, 0, 0]} r={0.06} c="#7a4d26" />
          </group>
          <Cyl a={[endL[0], endL[1] * 1.1, 0]} b={[endL[0], endL[1] * 1.1 - 1.1, 0]} r={0.025} c="#5b3a1d" />
          <Cyl a={[endR[0], endR[1] * 1.1, 0]} b={[endR[0], endR[1] * 1.1 - 1.1, 0]} r={0.025} c="#5b3a1d" />
          <Basket p={[endL[0], endL[1] * 1.1 - 1.4, 0]} />
          <Basket p={[endR[0], endR[1] * 1.1 - 1.4, 0]} />
        </group>
      </Stage>
      <Tag label="PERUMPAMAAN" left={48} top={70} />
      <Callout cam={cam} at={[px + 0.3, 3.4, 1.4]} label="seimbang" tone="green" dx={150} dy={-250} from={Math.round(s.dur * 0.55)} />
    </SceneFrame>
  );
};

// ---------- 12 tinggi 35 m ----------
const S12: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: [lerp(8, 13, p), 4.6, 19], look: [lerp(8, 13, p), 3.4, 0], fov: 54};
  const sx = lerp(3, 20, p);
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[100, 420]}>
        <Sea f={f} color={SEA_DAY} size={600} seg={130} amp={0.07} />
        <Clouds f={f} />
        <Bridge />
        <Ship p={[sx, 0.1, 2.5]} sc={0.6} />
        <Cyl a={[10.5, 0, 4.2]} b={[10.5, DECK - 0.3, 4.2]} r={0.05} c={C.orange} />
        <Box p={[10.5, 0, 4.2]} s={[1.0, 0.07, 0.07]} c={C.orange} />
        <Box p={[10.5, DECK - 0.3, 4.2]} s={[1.0, 0.07, 0.07]} c={C.orange} />
      </Stage>
      <Callout cam={cam} at={[10.5, 1.6, 4.2]} label="35 m" dx={-180} dy={-120} from={8} />
      <Callout cam={cam} at={[sx, 1.2, 2.5]} label="kapal lewat" tone="blue" dx={-60} dy={190} from={Math.round(s.phr[1].s * FPS)} />
    </SceneFrame>
  );
};

// ---------- 13 makin deket ----------
const S13: React.FC<P> = ({s}) => {
  const {f, p} = useT(s);
  const cam: Cam = {pos: lerp3([-40, 26, 50], [-16, 17, 36], p), look: [0, 5, 0], fov: 48};
  const g = lerp(16, 2.6, ease(p));
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[150, 480]}>
        <Sea f={f} color={SEA_DAY} size={600} seg={130} />
        <Clouds f={f} />
        <Bridge gapHalf={g} />
        <Gantry x={-g} dir={-1} />
        <Gantry x={g} dir={1} />
      </Stage>
      <Callout cam={cam} at={[0, DECK, 0]} label="bentang tengah" tone="blue" dx={150} dy={210} from={Math.round(s.phr[1].s * FPS)} />
    </SceneFrame>
  );
};

// ---------- 14 penutup ----------
const S14: React.FC<P> = ({s}) => {
  const {f, t, p} = useT(s);
  const q = clamp01(p / 0.55);
  const pull = ease((p - 0.38) / 0.5);
  const cam: Cam = {pos: lerp3([0.8, 5.8, 14], [-26, 20, 50], pull), look: lerp3([0, 4.2, 0], [0, 8, 0], pull), fov: 52};
  const segY = lerp(5.6, DECK + 0.05, ease((p - 0.08) / 0.3));
  const tf = s.phr[2].s;
  return (
    <SceneFrame s={s}>
      <Stage cam={cam} bg={NIGHT_BG} sky={NIGHT_SKY} stars fog={[50, 320]} night>
        <GapNight f={f} segY={segY} showSeg g={2.3} />
        <Burst c={[-8, 28, -4]} t={t - tf + 0.2} color="#ffffff" />
        <Burst c={[8, 32, -6]} t={t - tf + 0.5} color="#8fc2ff" r={10} />
        <Burst c={[0, 24, -2]} t={t - tf + 0.9} color="#9dffb0" />
      </Stage>
      <StatBox label="DIBUKA UNTUK UMUM" value="10 Juni 2009" left={48} top={640} from={Math.round(tf * FPS)} w={640} />
    </SceneFrame>
  );
};

export const SCENE_COMPONENTS: React.FC<P>[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14];
