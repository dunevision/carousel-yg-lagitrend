import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {V3} from './kit';

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const resolved = new Map<string, THREE.Object3D>();
const pending = new Map<string, Promise<THREE.Object3D>>();

const load = (file: string) => {
  if (!pending.has(file)) {
    const url = staticFile(`models/${file}`);
    const p: Promise<THREE.Object3D> = file.endsWith('.fbx')
      ? fbxLoader.loadAsync(url)
      : loader.loadAsync(url).then((g) => g.scene);
    pending.set(
      file,
      p.then((o) => {
        resolved.set(file, o);
        return o;
      }),
    );
  }
  return pending.get(file)!;
};

// muat semua model SEBELUM kanvas 3D dibuat (render Remotion menunggu sampai siap)
export const usePreload = (files: string[]) => {
  const [ready, setReady] = useState(files.every((f) => resolved.has(f)));
  const [handle] = useState(() => (ready ? null : delayRender('muat model 3D')));
  useEffect(() => {
    if (ready) return;
    Promise.all(files.map(load)).then(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

// Model glTF/GLB: ukuran dinormalkan ke `length` (satuan dunia, 1 = 10 m), alas di y=0, tengah di (0,0)
export const Model: React.FC<{file: string; p: V3; length: number; rotY?: number; tilt?: V3}> = ({file, p, length, rotY = 0, tilt = [0, 0, 0]}) => {
  const obj = resolved.get(file) ?? null;
  const prepared = useMemo(() => {
    if (!obj) return null;
    const clone = obj.clone(true);
    clone.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        // FBX sering membawa material transparan -> tampak tembus pandang; paksa solid
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mt) => {
          const x = mt as THREE.MeshPhongMaterial;
          x.transparent = false;
          x.opacity = 1;
          x.depthWrite = true;
          x.alphaTest = 0;
          x.side = THREE.FrontSide;
        });
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    const s = length / Math.max(size.x, size.z);
    const holder = new THREE.Group();
    clone.position.set(-ctr.x, -box.min.y, -ctr.z);
    holder.add(clone);
    holder.scale.setScalar(s);
    return holder;
  }, [obj, length]);
  if (!prepared) return null;
  return (
    <group position={p} rotation={[tilt[0], rotY, tilt[2]]}>
      <primitive object={prepared} />
    </group>
  );
};
