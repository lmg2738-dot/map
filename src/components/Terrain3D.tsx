"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { generateDemHeights } from "@/lib/mock-analysis";

interface TerrainMeshProps {
  seed: number;
  slopeGrade: string;
}

function TerrainMesh({ seed, slopeGrade }: TerrainMeshProps) {
  const geometry = useMemo(() => {
    const size = 64;
    const heights = generateDemHeights(size, seed);
    const geo = new THREE.PlaneGeometry(10, 10, size - 1, size - 1);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, heights[i] * 2.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, [seed]);

  const color =
    slopeGrade === "steep"
      ? "#ef4444"
      : slopeGrade === "moderate"
        ? "#f59e0b"
        : slopeGrade === "gentle"
          ? "#22c55e"
          : "#059669";

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <meshStandardMaterial
        color={color}
        wireframe={false}
        flatShading={false}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

function ParcelBoundary() {
  const points = useMemo(
    () => [
      [-2, 0.05, -2] as [number, number, number],
      [2, 0.05, -2],
      [2, 0.05, 2],
      [-2, 0.05, 2],
      [-2, 0.05, -2],
    ],
    []
  );
  return <Line points={points} color="#0ea5e9" lineWidth={2} />;
}

function SceneContent({ seed, slopeGrade }: TerrainMeshProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 8, -3]} intensity={0.3} />
      <TerrainMesh seed={seed} slopeGrade={slopeGrade} />
      <ParcelBoundary />
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#94a3b8"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#64748b"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <Text
        position={[0, 3, 0]}
        fontSize={0.35}
        color="#64748b"
        anchorX="center"
      >
        DEM 기반 3D 지형 (시뮬레이션)
      </Text>
      <OrbitControls
        enablePan
        enableZoom
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

interface Terrain3DProps {
  address: string;
  slopeGrade: string;
}

export default function Terrain3D({ address, slopeGrade }: Terrain3DProps) {
  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < address.length; i++) {
      h = (h << 5) - h + address.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) / 1000;
  }, [address]);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-slate-200">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-muted">
            3D 지형 로딩 중...
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [8, 8, 8], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
        >
          <SceneContent seed={seed} slopeGrade={slopeGrade} />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-3 left-3 rounded-lg bg-surface/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <span className="font-medium text-primary">VWorld + DEM</span>
        <span className="text-muted"> · 정사영상 오버레이 준비</span>
      </div>
    </div>
  );
}
