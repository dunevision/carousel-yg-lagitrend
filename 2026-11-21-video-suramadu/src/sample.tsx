import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Box, Cam, Clouds, DECK, Stage, clamp01, ease, lerp, lerp3} from './kit';
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

// ================= Sampel kedua: sisi Surabaya (kota dari paket City Builder Bits + CUTES) =================
const mkTimed = (id: string, kicker: string, title: string, phrases: string[], dur: number): Timed => {
  let t = 0.5;
  const phr = phrases.map((text) => {
    const words = text.split(' ').map((w) => {
      const s = t;
      t += 0.062 * w.replace(/[^\p{L}\p{N}]/gu, '').length + 0.07;
      return {t: w, s, e: t};
    });
    t += 0.3;
    return {text, words, s: words[0].s, e: words[words.length - 1].e};
  });
  return {id, kicker, title, phrases, phr, dur, from: 0, speechEnd: t};
};
export const KOTA_DUR = 8 * FPS;
export const KOTA: Timed = mkTimed('kota', 'SISI SURABAYA', 'Dari *Surabaya* ke Madura', ['Dari sisi Surabaya,', 'jembatan ini menyambung sampai ke Madura.'], KOTA_DUR);

const BLD = ['building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H'].map((n) => `city/${n}.fbx`);
const PEOPLE = ['Citizen01', 'Citizen02', 'Citizen03', 'GenericMale', 'GenericFemale', 'RetailWorker', 'FoodWorker', 'PoliceOfficer'].map((n) => `cutes/${n}.fbx`);
const KCARS = ['city/Taxi.fbx', 'city/Stationwagon.fbx', 'city/Police_car.fbx', 'city/Car_Hatchback.fbx', 'car/van.glb', 'car/suv.glb', 'car/delivery.glb'];
const KOTA_FILES = [...BLD, ...PEOPLE, ...KCARS, 'city/streetlight.fbx', 'city/bush.fbx', 'city/watertower.fbx', 'city/bench.fbx', 'city/dumpster.fbx', 'watercraft/boat-fishing-small.glb'];
const GROUND_Y = 1.4;
const rr = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

export const SampelKota: React.FC = () => {
  const f = useCurrentFrame();
  const ready = usePreload(KOTA_FILES);
  const p = clamp01(f / KOTA_DUR);
  const cam: Cam = {pos: lerp3([-176, 17, 52], [-206, 12, 40], ease(p)), look: [-262, 4, lerp(2, -4, p)], fov: 52};
  const bob = Math.sin(f * 0.05) * 0.03;
  // deretan gedung di dua sisi jalan raya (jalan = lanjutan lantai jembatan, sepanjang sumbu x)
  const buildings: React.ReactNode[] = [];
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 9; i++) {
      const side = row === 0 ? 1 : -1;
      const x = -244 - i * 11 - rr(i + row * 10) * 3;
      const z = side * (14 + rr(i * 3 + row) * 5);
      buildings.push(<Model key={`b${row}${i}`} file={BLD[(i * 3 + row * 5) % BLD.length]} p={[x, GROUND_Y, z]} length={8 + rr(i + row) * 4} rotY={side > 0 ? Math.PI : 0} />);
    }
  for (let i = 0; i < 8; i++)
    buildings.push(<Model key={`bb${i}`} file={BLD[(i * 5 + 1) % BLD.length]} p={[-250 - i * 12, GROUND_Y, 31 + rr(i + 40) * 6]} length={9 + rr(i + 7) * 4} rotY={Math.PI} />);
  for (let i = 0; i < 6; i++)
    buildings.push(<Model key={`bc${i}`} file={BLD[(i * 7 + 2) % BLD.length]} p={[-252 - i * 14, GROUND_Y, -31 - rr(i + 70) * 6]} length={9 + rr(i + 9) * 4} />);
  buildings.push(<Model key="wt" file="city/watertower.fbx" p={[-262, GROUND_Y, 34]} length={7} />);
  return (
    <SceneFrame s={KOTA}>
      {ready ? (
        <Stage cam={cam} bg={DAY_BG} sky={DAY_SKY} fog={[260, 900]}>
          <RealSea f={f} color="#139c93" />
          <Clouds f={f} />
          <Bridge shore={false} />
          {/* daratan + jalan */}
          <Box p={[-345, 0.2, 0]} s={[230, 2.4, 420]} c="#9fb98a" t="grass" ts={8} />
          <Box p={[-345, GROUND_Y + 0.03, 0]} s={[230, 0.06, 6]} c="#8a8d93" t="asphalt" ts={4} />
          <Box p={[-345, GROUND_Y + 0.07, 0]} s={[230, 0.02, 0.1]} c="#f4d03f" />
          {[-1, 1].map((k) => (
            <Box key={k} p={[-345, GROUND_Y + 0.05, k * 4.2]} s={[230, 0.1, 2]} c="#d8d4c8" t="concrete" ts={4} />
          ))}
          {buildings}
          {Array.from({length: 14}).map((_, i) => (
            <Model key={`sl${i}`} file="city/streetlight.fbx" p={[-236 - i * 8, GROUND_Y, i % 2 ? 3.6 : -3.6]} length={2.4} />
          ))}
          {Array.from({length: 12}).map((_, i) => (
            <Model key={`bu${i}`} file="city/bush.fbx" p={[-240 - i * 9.5, GROUND_Y, (i % 2 ? 1 : -1) * (7 + rr(i + 3) * 2)]} length={1.6 + rr(i) * 0.8} />
          ))}
          {/* kendaraan di jalan raya */}
          {KCARS.map((c, i) => {
            const dir = i % 2 ? 1 : -1;
            const span = 150;
            const x = -235 - ((((i * 37 + f * (0.55 + (i % 3) * 0.12) * (dir > 0 ? -1 : 1)) % span) + span) % span);
            return <Model key={`kc${i}`} file={c} p={[x, GROUND_Y + 0.08, dir > 0 ? 1.3 : -1.3]} length={c.startsWith('car/') ? 2.0 : 2.3} rotY={dir > 0 ? Math.PI / 2 : -Math.PI / 2} />;
          })}
          {/* warga di trotoar */}
          {PEOPLE.map((c, i) => {
            const side = i % 2 ? 1 : -1;
            const x = -246 - i * 14 - ((f * 0.06) % 1.2);
            return <Model key={`pp${i}`} file={c} p={[x, GROUND_Y + 0.1 + Math.abs(Math.sin(f * 0.3 + i)) * 0.03, side * 4.2]} length={0.45} rotY={side > 0 ? Math.PI : 0} />;
          })}
          <Model file="watercraft/boat-fishing-small.glb" p={[-215, bob, 22]} length={3} rotY={0.6} />
        </Stage>
      ) : null}
      <Callout cam={cam} at={[-236, GROUND_Y + 0.5, 0]} label="sisi Surabaya" tone="blue" dx={170} dy={-190} from={20} />
    </SceneFrame>
  );
};
