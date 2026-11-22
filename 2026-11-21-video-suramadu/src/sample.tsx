import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Cam, Clouds, DECK, Stage, clamp01, ease, lerp, lerp3} from './kit';
import {Bridge} from './bridge';
import {RealSea} from './fx';
import {Model, usePreload} from './Model';
import {Callout, SceneFrame} from './ui';
import {FPS, TIMED, Timed} from './script';

const DAY_BG = '#cfe6ee';
const DAY_SKY: [string, string] = ['#3f8fd6', '#cfe6ee'];

// Cuplikan 8 detik: kapal kargo lewat di bawah bentang utama, kendaraan di lantai jembatan.
// Semua model dari Kenney (CC0).
export const SAMPLE_DUR = 8 * FPS;
export const SAMPLE: Timed = {...TIMED[11], dur: SAMPLE_DUR, from: 0};

const CARS = [
  {f: 'car/van.glb', lane: 1.2, v: 0.075, x0: -40, dir: 1},
  {f: 'car/delivery.glb', lane: 1.2, v: 0.06, x0: -62, dir: 1},
  {f: 'car/taxi.glb', lane: -1.2, v: 0.085, x0: 44, dir: -1},
  {f: 'car/suv.glb', lane: -1.2, v: 0.065, x0: 70, dir: -1},
  {f: 'car/sedan.glb', lane: 1.2, v: 0.08, x0: -85, dir: 1},
  {f: 'car/police.glb', lane: -1.2, v: 0.07, x0: 100, dir: -1},
];

const FILES = [...CARS.map((c) => c.f), 'watercraft/ship-cargo-a.glb', 'watercraft/boat-tug-a.glb', 'watercraft/boat-fishing-small.glb', 'watercraft/buoy.glb', 'watercraft/buoy-flag.glb'];

export const Sampel: React.FC = () => {
  const f = useCurrentFrame();
  const ready = usePreload(FILES);
  const p = clamp01(f / SAMPLE_DUR);
  const shipZ = lerp(24, -26, ease(p * 0.9 + 0.05));
  const bob = Math.sin(f * 0.09) * 0.035;
  const cam: Cam = {pos: lerp3([-20, 9, 34], [-13, 7.2, 22], p), look: [0, 2.6, lerp(6, -6, p)], fov: 50};
  return (
    <SceneFrame s={SAMPLE}>
      {ready ? (
      <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[110, 420]}>
        <RealSea f={f} color="#139c93" />
        <Clouds f={f} />
        <Bridge />
        {CARS.map((c, i) => {
          const x = c.x0 + c.dir * c.v * f * 3;
          return <Model key={i} file={c.f} p={[x, DECK + 0.34, c.lane]} length={2.0} rotY={c.dir > 0 ? Math.PI / 2 : -Math.PI / 2} />;
        })}
        <Model file="watercraft/ship-cargo-a.glb" p={[0, bob, shipZ]} length={13} rotY={Math.PI} tilt={[0, 0, Math.sin(f * 0.07) * 0.012]} />
        <Model file="watercraft/boat-tug-a.glb" p={[3.6, bob * 1.4, shipZ + 6.5]} length={3.4} rotY={Math.PI} />
        <Model file="watercraft/boat-fishing-small.glb" p={[-9, bob * 2, 12 - f * 0.01]} length={2.6} rotY={0.8} />
        <Model file="watercraft/boat-fishing-small.glb" p={[13, bob * 2, -6]} length={2.6} rotY={-1.9} />
        {[-12, -6, 6, 12].map((x, i) => (
          <Model key={i} file={i % 2 ? 'watercraft/buoy-flag.glb' : 'watercraft/buoy.glb'} p={[x, Math.sin(f * 0.1 + i) * 0.04, 6 + i * 1.5]} length={0.9} />
        ))}
      </Stage>
      ) : null}
      <Callout cam={cam} at={[0, DECK - 0.25, -0.5]} label="35 m" dx={-190} dy={-120} from={10} />
      <Callout cam={cam} at={[0, 2.3, shipZ]} label="kapal lewat" tone="blue" dx={190} dy={-150} from={40} />
    </SceneFrame>
  );
};
