import * as React from "react";
import { Canvas } from "@react-three/fiber";
import Controls from "./Controls";
import InstancedPoints from "./InstancedPoints";
import * as THREE from "three";

const ThreePointVis = ({ data, layout, selectedPoint, onSelectPoint, targetDate }) => {
  return (
    <Canvas
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      camera={{ position: [0, -50, 30], far: 5000 }}
      linear
    >
      <color attach="background" args={["lightgray"]} />
      <Controls />
      <ambientLight color="#ffffff" intensity={0.3} />
      <hemisphereLight color="#ffffff" skyColor="#e8bc82" groundColor="#080820" intensity={.7} />
      <InstancedPoints
        data={data}
        layout={layout}
        selectedPoint={selectedPoint}
        onSelectPoint={onSelectPoint}
        targetDate={targetDate}
      />
    </Canvas>
  );
};

export default ThreePointVis;
