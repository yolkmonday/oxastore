"use client";

import { Suspense, useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader, Mesh, Texture } from "three";

interface Book3DViewerProps {
  frontImage: string;
  backImage?: string | null;
  spineImage?: string | null;
  width?: number;
  height?: number;
  depth?: number;
}

function BookMesh({
  frontImage,
  backImage,
  spineImage,
  width = 2.8,
  height = 4,
  depth = 0.3,
}: Book3DViewerProps) {
  const meshRef = useRef<Mesh>(null);
  const isHovering = useRef(false);

  const urls = useMemo(() => {
    const list = [frontImage];
    if (backImage) list.push(backImage);
    if (spineImage) list.push(spineImage);
    return list;
  }, [frontImage, backImage, spineImage]);

  const textures = useLoader(TextureLoader, urls);

  const frontTex = textures[0] as Texture;
  const backTex = (backImage ? textures[1] : null) as Texture | null;
  const spineTex = (spineImage
    ? textures[backImage ? 2 : 1]
    : null) as Texture | null;

  useFrame((_state, delta) => {
    if (meshRef.current && !isHovering.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => (isHovering.current = true)}
      onPointerOut={() => (isHovering.current = false)}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial attach="material-0" color="#f5f5f4" />
      <meshStandardMaterial attach="material-1" map={spineTex} color={spineTex ? undefined : "#e7e5e4"} />
      <meshStandardMaterial attach="material-2" color="#f5f5f4" />
      <meshStandardMaterial attach="material-3" color="#f5f5f4" />
      <meshStandardMaterial attach="material-4" map={frontTex} />
      <meshStandardMaterial attach="material-5" map={backTex} color={backTex ? undefined : "#e7e5e4"} />
    </mesh>
  );
}

function FallbackPlaceholder() {
  return (
    <div className="w-full h-[400px] p-6 flex items-center justify-center bg-gray-50 rounded-xl text-sm text-gray-400">
      Memuat preview 3D...
    </div>
  );
}

export default function Book3DViewer(props: Book3DViewerProps) {
  const [contextLost, setContextLost] = useState(false);

  const handleCreated = useCallback((state: { gl: { domElement: HTMLCanvasElement } }) => {
    const canvas = state.gl.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      setContextLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      setContextLost(false);
    });
  }, []);

  if (contextLost) {
    return (
      <div className="w-full h-[400px] p-6 flex flex-col items-center justify-center bg-gray-50 rounded-xl gap-3">
        <p className="text-sm text-gray-400">Preview 3D tidak tersedia</p>
        <button
          onClick={() => setContextLost(false)}
          className="text-xs text-brand-500 hover:text-brand-600 font-medium"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<FallbackPlaceholder />}>
      <div className="w-full h-[400px] p-6">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 40 }}
          onCreated={handleCreated}
          gl={{ powerPreference: "low-power", antialias: true }}
          frameloop="demand"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <BookMesh {...props} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={(Math.PI * 2) / 3}
          />
          <Invalidate />
        </Canvas>
      </div>
    </Suspense>
  );
}

function Invalidate() {
  useFrame(({ invalidate }) => {
    invalidate();
  });
  return null;
}
