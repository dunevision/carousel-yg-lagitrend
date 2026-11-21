import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

export const CW = 1080;
export const CH = 1600;
export const CTOP = 320;
export const DECK = 3.5; // 35 m (1 unit = 10 m)
export const TH = 14; // 140 m
export type V3 = [number, number, number];
export type Cam = {pos: V3; look: V3; fov?: number};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const ease = (t: number) => {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Rig: React.FC<{cam: Cam}> = ({cam}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.fov = cam.fov ?? 45;
    camera.lookAt(...cam.look);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  });
  return null;
};

export const Stage: React.FC<{
  cam: Cam;
  bg: string;
  fog?: [number, number];
  night?: boolean;
  children: React.ReactNode;
}> = ({cam, bg, fog, night, children}) => (
  <ThreeCanvas width={CW} height={CH} camera={{position: cam.pos, fov: cam.fov ?? 45, near: 0.1, far: 1500}}>
    <color attach="background" args={[bg]} />
    {fog ? <fog attach="fog" args={[bg, fog[0], fog[1]]} /> : null}
    <Rig cam={cam} />
    {night ? (
      <>
        <hemisphereLight args={['#9aa8f0', '#2a3260', 2.4]} />
        <directionalLight position={[-20, 40, 30]} intensity={1.8} color="#b9c6ff" />
      </>
    ) : (
      <>
        <hemisphereLight args={['#ffffff', '#a9c4c4', 1.6]} />
        <directionalLight position={[30, 50, 25]} intensity={2.4} color="#fff3dc" />
      </>
    )}
    {children}
  </ThreeCanvas>
);

export const project = (p: V3, cam: Cam): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 45, CW / CH, 0.1, 1500);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [((v.x + 1) / 2) * CW, ((1 - v.y) / 2) * CH];
};

export const Box: React.FC<{
  p: V3;
  s: V3;
  c: string;
  rot?: V3;
  emissive?: string;
  ei?: number;
  opacity?: number;
  rough?: number;
}> = ({p, s, c, rot, emissive, ei = 0.6, opacity, rough = 0.85}) => (
  <mesh position={p} rotation={rot}>
    <boxGeometry args={s} />
    <meshStandardMaterial
      color={c}
      flatShading
      roughness={rough}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? ei : 0}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  </mesh>
);

export const Cyl: React.FC<{a: V3; b: V3; r: number; c: string; emissive?: string; seg?: number}> = ({a, b, r, c, emissive, seg = 6}) => {
  const {mid, len, q} = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return {mid: va.clone().add(vb).multiplyScalar(0.5), len, q};
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, seg]} />
      <meshStandardMaterial color={c} flatShading emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.6 : 0} />
    </mesh>
  );
};

export const Sea: React.FC<{
  f: number;
  color: string;
  y?: number;
  size?: number;
  amp?: number;
  seg?: number;
  opacity?: number;
}> = ({f, color, y = 0, size = 500, amp = 0.1, seg = 120, opacity}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, Math.sin(x * 0.45 + f * 0.07) * amp + Math.cos(z * 0.38 + f * 0.055) * amp);
    }
    g.computeVertexNormals();
    return g;
  }, [f, size, seg, amp]);
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial
        color={color}
        flatShading
        roughness={0.45}
        metalness={0.1}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
};

export const Person: React.FC<{
  p: V3;
  f: number;
  walk?: boolean;
  shirt?: string;
  pants?: string;
  hat?: boolean;
  sc?: number;
  rotY?: number;
  armsFwd?: number;
}> = ({p, f, walk, shirt = '#f1f1ee', pants = '#2b2f36', hat = true, sc = 1, rotY = 0, armsFwd = 0}) => {
  const sw = walk ? Math.sin(f * 0.28) * 0.6 : 0;
  return (
    <group position={p} scale={sc} rotation={[0, rotY, 0]}>
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.18, 0.9, 0]} rotation={[sw * k, 0, 0]}>
          <Box p={[0, -0.45, 0]} s={[0.22, 0.9, 0.24]} c={pants} />
        </group>
      ))}
      <Box p={[0, 1.3, 0]} s={[0.66, 0.85, 0.38]} c={shirt} />
      <mesh position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.23, 12, 10]} />
        <meshStandardMaterial color="#d99a6c" flatShading />
      </mesh>
      {hat ? (
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.62, 0.3, 14]} />
          <meshStandardMaterial color="#e6c46a" flatShading />
        </mesh>
      ) : null}
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.42, 1.68, 0]} rotation={[armsFwd - sw * k * 0.8, 0, k * 0.05]}>
          <Box p={[0, -0.36, 0]} s={[0.15, 0.74, 0.16]} c={shirt} />
        </group>
      ))}
    </group>
  );
};

export const Burst: React.FC<{c: V3; t: number; color: string; n?: number; r?: number; life?: number}> = ({c, t, color, n = 90, r = 9, life = 2.2}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const k = clamp01(t / life);
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const d = easeOut(k) * r * (0.75 + 0.25 * rnd(i));
      pos[i * 3] = c[0] + Math.cos(th) * rad * d;
      pos[i * 3 + 1] = c[1] + y * d - k * k * 3.2;
      pos[i * 3 + 2] = c[2] + Math.sin(th) * rad * d;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [t, c[0], c[1], c[2], n, r, life]);
  if (t < 0 || t > life) return null;
  const k = clamp01(t / life);
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={1.1} sizeAttenuation transparent opacity={1 - k * k} depthWrite={false} />
    </points>
  );
};
