import React, {useLayoutEffect, useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as PP from 'postprocessing';
import * as THREE from 'three';
import {Water} from 'three/examples/jsm/objects/Water.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {rnd} from './kit';

// ---------- tekstur prosedural (dibuat sekali, tanpa download) ----------
const cache: Record<string, THREE.CanvasTexture> = {};
type Kind = 'concrete' | 'asphalt' | 'grass' | 'mud' | 'steel' | 'deck' | 'sand';

const paint = (kind: Kind, g: CanvasRenderingContext2D, S: number) => {
  const noise = (base: [number, number, number], amp: number, n: number, sz: [number, number]) => {
    g.fillStyle = `rgb(${base.join(',')})`;
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < n; i++) {
      const v = (rnd(i * 3.1 + kind.length) - 0.5) * amp;
      g.fillStyle = `rgba(${v > 0 ? '255,255,255' : '0,0,0'},${Math.abs(v) / 255})`;
      const w = sz[0] + rnd(i + 7) * sz[1];
      g.fillRect(rnd(i + 1.3) * S, rnd(i + 2.7) * S, w, w * (0.4 + rnd(i + 9) * 0.8));
    }
  };
  if (kind === 'concrete') {
    noise([206, 202, 192], 46, 5000, [1, 3]);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(90,85,75,${0.03 + rnd(i) * 0.05})`;
      g.beginPath();
      g.ellipse(rnd(i + 4) * S, rnd(i + 8) * S, 20 + rnd(i) * 60, 10 + rnd(i + 1) * 30, 0, 0, 7);
      g.fill();
    }
    g.strokeStyle = 'rgba(70,65,60,0.25)';
    for (let y = 0; y < S; y += S / 4) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(S, y);
      g.stroke();
    }
  } else if (kind === 'asphalt') {
    noise([58, 61, 66], 50, 9000, [1, 2]);
  } else if (kind === 'steel' || kind === 'deck') {
    noise(kind === 'steel' ? [128, 134, 142] : [118, 124, 132], 26, 3000, [1, 4]);
    g.strokeStyle = 'rgba(40,45,50,0.45)';
    g.lineWidth = 2;
    for (let x = 0; x <= S; x += S / 4) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, S);
      g.stroke();
    }
    g.fillStyle = 'rgba(30,30,30,0.35)';
    for (let x = S / 8; x < S; x += S / 4) for (let y = 8; y < S; y += 24) g.fillRect(x - 2, y, 4, 4);
  } else if (kind === 'grass') {
    noise([96, 160, 64], 60, 12000, [1, 3]);
    for (let i = 0; i < 2500; i++) {
      g.strokeStyle = `rgba(${40 + rnd(i) * 60},${110 + rnd(i + 1) * 80},${30 + rnd(i + 2) * 30},0.7)`;
      const x = rnd(i + 3) * S;
      const y = rnd(i + 4) * S;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (rnd(i + 5) - 0.5) * 6, y - 6 - rnd(i + 6) * 8);
      g.stroke();
    }
  } else if (kind === 'mud') {
    noise([78, 54, 38], 40, 8000, [1, 3]);
    for (let i = 0; i < 300; i++) {
      g.fillStyle = `rgba(30,18,10,${0.2 + rnd(i) * 0.3})`;
      g.fillRect(rnd(i + 1) * S, rnd(i + 2) * S, 6 + rnd(i + 3) * 20, 2 + rnd(i + 4) * 3);
    }
  } else if (kind === 'sand') {
    noise([226, 204, 170], 30, 9000, [1, 2]);
  }
};

export const tex = (kind: Kind, rx = 1, ry = 1) => {
  if (!cache[kind]) {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    paint(kind, c.getContext('2d')!, S);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    cache[kind] = t;
  }
  const t = cache[kind].clone();
  t.repeat.set(rx, ry);
  return t;
};

// ---------- normal map air (tileable, dari gelombang sinus) ----------
let waterNormals: THREE.CanvasTexture | null = null;
const getWaterNormals = () => {
  if (waterNormals) return waterNormals;
  const S = 256;
  const H = new Float32Array(S * S);
  const waves = Array.from({length: 14}, (_, i) => ({
    kx: Math.round((rnd(i) - 0.5) * 16),
    ky: Math.round((rnd(i + 20) - 0.5) * 16),
    a: 0.4 + rnd(i + 40),
    ph: rnd(i + 60) * 6.28,
  }));
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let h = 0;
      for (const w of waves) h += w.a * Math.sin(((w.kx * x + w.ky * y) / S) * 6.283 + w.ph);
      H[y * S + x] = h;
    }
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = H[y * S + ((x + 1) % S)] - H[y * S + ((x - 1 + S) % S)];
      const dy = H[((y + 1) % S) * S + x] - H[((y - 1 + S) % S) * S + x];
      const n = new THREE.Vector3(-dx * 0.6, -dy * 0.6, 1).normalize();
      const i = (y * S + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  waterNormals = new THREE.CanvasTexture(c);
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  return waterNormals;
};

// air laut yang memantulkan langit, jembatan, dan lampu
export const RealSea: React.FC<{f: number; color?: string; night?: boolean; y?: number; distortion?: number}> = ({
  f,
  color = '#2a8f8a',
  night = false,
  y = 0,
  distortion = 0.9,
}) => {
  const water = useMemo(() => {
    const geo = new THREE.PlaneGeometry(3000, 3000);
    const w = new Water(geo, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: getWaterNormals(),
      sunDirection: new THREE.Vector3(0.45, 0.7, 0.35).normalize(),
      sunColor: night ? 0x8899ff : 0xfff1d6,
      waterColor: new THREE.Color(color).getHex(),
      distortionScale: distortion,
      fog: true,
      alpha: 1,
    });
    w.rotation.x = -Math.PI / 2;
    return w;
  }, [color, night, distortion]);
  (water.material as THREE.ShaderMaterial).uniforms.time.value = (f / 30) * 0.22;
  (water.material as THREE.ShaderMaterial).uniforms.size.value = night ? 2 : 2.4;
  return <primitive object={water} position={[0, y, 0]} />;
};

// pencahayaan lingkungan untuk pantulan material (tanpa file HDR)
export const Env: React.FC<{intensity?: number}> = ({intensity = 0.5}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
};

// efek post (bloom, tone mapping, vignette) dirender manual tiap frame Remotion
export const Post: React.FC<{night?: boolean; bloom?: number}> = ({night = false, bloom}) => {
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const camera = useThree((st) => st.camera);
  const size = useThree((st) => st.size);
  const composer = useMemo(() => {
    const c = new PP.EffectComposer(gl, {frameBufferType: THREE.HalfFloatType, multisampling: 4});
    c.addPass(new PP.RenderPass(scene, camera));
    const bl = new PP.BloomEffect({
      intensity: bloom ?? (night ? 0.9 : 0.35),
      luminanceThreshold: night ? 0.78 : 0.92,
      luminanceSmoothing: 0.3,
      mipmapBlur: true,
      radius: 0.78,
    });
    const hs = new PP.HueSaturationEffect({saturation: night ? 0.05 : 0.12});
    const bc = new PP.BrightnessContrastEffect({contrast: 0.06});
    const tm = new PP.ToneMappingEffect({mode: PP.ToneMappingMode.ACES_FILMIC});
    const vg = new PP.VignetteEffect({offset: 0.3, darkness: night ? 0.55 : 0.35});
    c.addPass(new PP.EffectPass(camera, bl, hs, bc, tm, vg));
    return c;
  }, [gl, scene, camera, night, bloom]);
  useLayoutEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);
  // priority 1 = menggantikan render bawaan; dipanggil oleh advance() Remotion
  useFrame(() => {
    gl.toneMapping = THREE.NoToneMapping;
    composer.render();
  }, 1);
  return null;
};
