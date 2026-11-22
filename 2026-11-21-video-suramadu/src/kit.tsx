import React, {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Env, Post, tex} from './fx';

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

// goyangan kamera halus supaya terasa sinematik (dipakai juga oleh label agar tetap menempel)
export const drift = (cam: Cam, f: number): Cam => {
  const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]) * 0.007;
  return {
    ...cam,
    pos: [cam.pos[0] + Math.sin(f * 0.021) * d, cam.pos[1] + Math.cos(f * 0.027) * d * 0.6, cam.pos[2]],
  };
};

let glowTex: THREE.CanvasTexture | null = null;
export const getGlow = () => {
  if (!glowTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  return glowTex;
};

// cahaya menyebar palsu (pengganti bloom)
export const Glow: React.FC<{p: V3; size?: number; color?: string; opacity?: number}> = ({p, size = 2.5, color = '#ffcf80', opacity = 0.9}) => (
  <sprite position={p} scale={[size, size, 1]}>
    <spriteMaterial map={getGlow()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
  </sprite>
);

export const Sky: React.FC<{top: string; horizon: string; stars?: boolean}> = ({top, horizon, stars}) => {
  const u = useMemo(() => ({top: {value: new THREE.Color(top)}, hor: {value: new THREE.Color(horizon)}}), [top, horizon]);
  const starGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rnd(i) * Math.PI * 2;
      const ph = 0.12 + rnd(i + 50) * 1.3;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 700;
      pos[i * 3 + 1] = Math.sin(ph) * 700;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 700;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <group>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[900, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={u}
          vertexShader={'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y,0.0,1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.55)),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}
        />
      </mesh>
      {stars ? (
        <points geometry={starGeo}>
          <pointsMaterial color="#ffffff" size={1.3} sizeAttenuation={false} fog={false} transparent opacity={0.55} depthWrite={false} />
        </points>
      ) : null}
    </group>
  );
};

export const Clouds: React.FC<{f: number; y?: number; z?: number; n?: number}> = ({f, y = 70, z = -160, n = 9}) => (
  <group>
    {Array.from({length: n}).map((_, i) => {
      const x = ((-260 + i * 62 + rnd(i) * 30 + f * 0.05 + 520) % 520) - 260;
      return (
        <group key={i} position={[x, y + rnd(i + 3) * 25, z - rnd(i + 8) * 120]} scale={[1, 0.45, 0.8]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[(k - 1.5) * 10, rnd(i + k) * 3, 0]}>
              <icosahedronGeometry args={[9 + rnd(i * 4 + k) * 5, 1]} />
              <meshStandardMaterial color="#ffffff" flatShading emissive="#dfeff2" emissiveIntensity={0.5} fog={false} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

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
  sky?: [string, string];
  stars?: boolean;
  shadow?: number;
  post?: boolean;
  bloom?: number;
  children: React.ReactNode;
}> = ({cam: cam0, bg, fog, night, sky, stars, shadow = 60, post = true, bloom, children}) => {
  const f = useCurrentFrame();
  const cam = drift(cam0, f);
  return (
    <ThreeCanvas width={CW} height={CH} shadows camera={{position: cam.pos, fov: cam.fov ?? 45, near: 0.1, far: 2000}}>
      <color attach="background" args={[bg]} />
      {fog ? <fog attach="fog" args={[bg, fog[0], fog[1]]} /> : null}
      {sky ? <Sky top={sky[0]} horizon={sky[1]} stars={stars} /> : null}
      <Rig cam={cam} />
      {night ? (
        <>
          <hemisphereLight args={['#9aa8f0', '#2a3260', 1.9]} />
          <directionalLight
            position={[-35, 55, 40]}
            intensity={2.2}
            color="#b9c6ff"
            castShadow={shadow > 0}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-shadow}
            shadow-camera-right={shadow}
            shadow-camera-top={shadow}
            shadow-camera-bottom={-shadow}
            shadow-camera-near={1}
            shadow-camera-far={220}
            shadow-bias={-0.0004}
            shadow-normalBias={0.04}
          />
        </>
      ) : (
        <>
          <hemisphereLight args={['#ffffff', '#a9c4c4', 1.25]} />
          <directionalLight
            position={[35, 55, 30]}
            intensity={2.9}
            color="#fff1d6"
            castShadow={shadow > 0}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-shadow}
            shadow-camera-right={shadow}
            shadow-camera-top={shadow}
            shadow-camera-bottom={-shadow}
            shadow-camera-near={1}
            shadow-camera-far={220}
            shadow-bias={-0.0004}
            shadow-normalBias={0.04}
          />
        </>
      )}
      <Env intensity={night ? 0.22 : 0.55} />
      {children}
      {post ? <Post night={night} bloom={bloom} /> : null}
    </ThreeCanvas>
  );
};

export const project = (p: V3, cam0: Cam, f = 0): [number, number] => {
  const cam = drift(cam0, f);
  const c = new THREE.PerspectiveCamera(cam.fov ?? 45, CW / CH, 0.1, 1500);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [((v.x + 1) / 2) * CW, ((1 - v.y) / 2) * CH];
};

export type TexKind = 'concrete' | 'asphalt' | 'grass' | 'mud' | 'steel' | 'deck' | 'sand';
export const Box: React.FC<{
  p: V3;
  s: V3;
  c: string;
  rot?: V3;
  emissive?: string;
  ei?: number;
  opacity?: number;
  rough?: number;
  t?: TexKind;
  ts?: number;
  metal?: number;
}> = ({p, s, c, rot, emissive, ei = 0.6, opacity, rough = 0.85, t, ts = 4, metal = 0}) => {
  const map = useMemo(
    () => (t ? tex(t, Math.max(0.25, Math.max(s[0], s[2]) / ts), Math.max(0.25, Math.max(s[1], Math.min(s[0], s[2])) / ts)) : null),
    [t, s[0], s[1], s[2], ts],
  );
  return (
    <mesh position={p} rotation={rot} castShadow={opacity === undefined} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        map={map}
        roughness={rough}
        metalness={metal}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? ei : 0}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
};

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
    <mesh position={mid} quaternion={q} castShadow>
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
    const col = new Float32Array(p.count * 3);
    const base = new THREE.Color(color);
    const light = base.clone().lerp(new THREE.Color('#ffffff'), 0.16);
    const deep = base.clone().multiplyScalar(0.85);
    const tmp = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const h = Math.sin(x * 0.45 + f * 0.07) * amp + Math.cos(z * 0.38 + f * 0.055) * amp + Math.sin((x + z) * 0.9 + f * 0.11) * amp * 0.4;
      p.setY(i, h);
      const k = clamp01(0.5 + h / (amp * 3.6) + (rnd(i) - 0.5) * 0.15);
      tmp.copy(deep).lerp(k > 0.5 ? light : base, Math.abs(k - 0.5) * 2 * 0.6 + 0.05);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [f, size, seg, amp, color]);
  return (
    <mesh geometry={geo} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.28}
        metalness={0.25}
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
  const bob = walk ? Math.abs(Math.sin(f * 0.28)) * 0.05 : 0;
  const skin = '#d99a6c';
  const Capsule: React.FC<{pos: V3; r: number; l: number; c: string}> = ({pos, r, l, c}) => (
    <mesh position={pos} castShadow receiveShadow>
      <capsuleGeometry args={[r, l, 4, 10]} />
      <meshStandardMaterial color={c} roughness={0.7} />
    </mesh>
  );
  return (
    <group position={[p[0], p[1] + bob, p[2]]} scale={sc} rotation={[0, rotY, 0]}>
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.17, 0.92, 0]} rotation={[sw * k, 0, 0]}>
          <Capsule pos={[0, -0.42, 0]} r={0.1} l={0.7} c={pants} />
          <Box p={[0, -0.88, 0.05]} s={[0.2, 0.12, 0.34]} c="#1a1a1a" />
        </group>
      ))}
      <Capsule pos={[0, 1.3, 0]} r={0.27} l={0.42} c={shirt} />
      <mesh position={[0, 1.88, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.14, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {hat ? (
        <mesh position={[0, 2.09, 0]} castShadow>
          <coneGeometry args={[0.6, 0.3, 24]} />
          <meshStandardMaterial color="#e6c46a" roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={[0, 2.0, 0]}>
          <sphereGeometry args={[0.205, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#22201e" />
        </mesh>
      )}
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.36, 1.56, 0]} rotation={[armsFwd - sw * k * 0.8, 0, k * 0.06]}>
          <Capsule pos={[0, -0.32, 0]} r={0.075} l={0.5} c={shirt} />
          <mesh position={[0, -0.68, 0]}>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
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
      <pointsMaterial color={color} map={getGlow()} size={2.6} sizeAttenuation transparent opacity={1 - k * k} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  );
};

// rumpun padi (instanced, statis)
export const RiceField: React.FC<{x0: number; x1: number; z0: number; z1: number; y?: number; n?: number}> = ({x0, x1, z0, z1, y = 0.6, n = 1400}) => {
  const mesh = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.035, 1, 3);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({color: '#5fae3c', roughness: 0.8});
    const m = new THREE.InstancedMesh(geo, mat, n);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const clump = Math.floor(i / 7);
      const cx = x0 + rnd(clump) * (x1 - x0);
      const cz = z0 + rnd(clump + 0.5) * (z1 - z0);
      o.position.set(cx + (rnd(i) - 0.5) * 0.25, y, cz + (rnd(i + 2) - 0.5) * 0.25);
      o.rotation.set((rnd(i + 3) - 0.5) * 0.7, rnd(i + 4) * 6, (rnd(i + 5) - 0.5) * 0.7);
      o.scale.set(1, 0.9 + rnd(i + 6) * 0.9, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set('#4f9e30').lerp(new THREE.Color('#a8d65a'), rnd(i + 7) * 0.6));
    }
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, [x0, x1, z0, z1, y, n]);
  return <primitive object={mesh} />;
};

export const Palm: React.FC<{p: V3; h?: number; lean?: number; seed?: number}> = ({p, h = 7, lean = 0.15, seed = 1}) => {
  const segs = 6;
  const pts: V3[] = Array.from({length: segs + 1}, (_, i) => {
    const t = i / segs;
    return [p[0] + Math.sin(t * 1.4) * lean * h * 0.5, p[1] + t * h, p[2]];
  });
  const top = pts[segs];
  return (
    <group>
      {pts.slice(0, -1).map((a, i) => (
        <Cyl key={i} a={a} b={pts[i + 1]} r={0.22 - i * 0.015} c={i % 2 ? '#8a6a48' : '#7a5a3a'} seg={8} />
      ))}
      {Array.from({length: 9}).map((_, i) => {
        const ang = (i / 9) * Math.PI * 2 + seed;
        return (
          <group key={i} position={top} rotation={[0, ang, 0]}>
            <group rotation={[0, 0, -0.35 - rnd(i + seed) * 0.5]}>
              <mesh position={[1.6, -0.25, 0]} rotation={[0.25, 0, -0.18]} castShadow>
                <boxGeometry args={[3.2, 0.04, 0.75]} />
                <meshStandardMaterial color={i % 2 ? '#3f8f3a' : '#4fa443'} roughness={0.8} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};
