import * as React from "react";
import * as THREE from "three";
import { useAnimatedLayout } from "./layouts";
import { DateTime } from "luxon";

const tempObject3D = new THREE.Object3D();
const tempColor = new THREE.Color();

function updateInstancedMeshMatrices({ mesh, data }) {
  if (!mesh) return;

  for (let i = 0; i < data.length; ++i) {
    const { x, y, z } = data[i];

    tempObject3D.position.set(x, y, z);
    tempObject3D.rotation.set(0.5 * Math.PI, 0, 0);
    tempObject3D.visible = false;
    tempObject3D.updateMatrix();
    mesh.setMatrixAt(i, tempObject3D.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
}
const SELECTED_COLOR = "#6f6";
const DEFAULT_COLOR = "#F7B5CD";
const HIDE_COLOR = "#bcbcbc";

const usePointDisplay = ({ data, selectedPoint, targetDate }) => {
  const numPoints = data.length;
  const displayAttrib = React.useRef();

  const displayArray = React.useMemo(
    () =>
      Float32Array.from(
        new Array(numPoints)
          .fill()
          .flatMap((_, i) => tempColor.set((data[i].visible = true)).toArray([3, 3, 3]))
      ),
    [data, numPoints]
  );

  React.useEffect(() => {
    for (let i = 0; i < data.length; ++i) {
      const dataFromTimestamp = DateTime.fromSQL(
        data[i].transferfromtimestamp?.toString()
      ).toSeconds();
      const dataToTimestamp = DateTime.fromSQL(data[i].transfertotimestamp?.toString()).toSeconds();
      tempColor.set(
        dataFromTimestamp > targetDate * 86400 && dataToTimestamp <= targetDate * 86400
          ? DEFAULT_COLOR
          : HIDE_COLOR
      );
      tempColor.toArray(displayArray, i * 3);
    }
    displayAttrib.current.needsUpdate = true;
  }, [data, selectedPoint, targetDate, displayArray]);

  return { displayAttrib, displayArray };
};

const usePointColors = ({ data, selectedPoint }) => {
  const numPoints = data.length;
  const colorAttrib = React.useRef();

  const colorArray = React.useMemo(
    () =>
      Float32Array.from(
        new Array(numPoints)
          .fill()
          .flatMap((_, i) => tempColor.set(data[i].color).toArray([3, 3, 3]))
      ),
    [data, numPoints]
  );

  React.useEffect(() => {
    for (let i = 0; i < data.length; ++i) {
      tempColor.set(data[i] === selectedPoint ? SELECTED_COLOR : DEFAULT_COLOR);

      tempColor.toArray(colorArray, i * 3);
    }
    colorAttrib.current.needsUpdate = true;
  }, [data, selectedPoint, colorArray]);

  return { colorAttrib, colorArray };
};

const useMousePointInteraction = ({ data, onSelectPoint }) => {
  // track mousedown position to skip click handlers on drags
  const mouseDownRef = React.useRef([0, 0]);
  const handlePointerDown = (e) => {
    mouseDownRef.current[0] = e.clientX;
    mouseDownRef.current[1] = e.clientY;
  };

  const handleClick = (event) => {
    const { instanceId, clientX, clientY } = event;
    const downDistance = Math.sqrt(
      Math.pow(mouseDownRef.current[0] - clientX, 2) +
        Math.pow(mouseDownRef.current[1] - clientY, 2)
    );

    if (downDistance > 5) {
      event.stopPropagation();
      return;
    }

    const index = instanceId;
    const point = data[index];

    onSelectPoint(point);
  };

  return { handlePointerDown, handleClick };
};

const InstancedPoints = ({ data, layout, selectedPoint, onSelectPoint, targetDate }) => {
  const meshRef = React.useRef();
  const numPoints = data.length;

  useAnimatedLayout({
    data,
    layout,
    onFrame: () => {
      updateInstancedMeshMatrices({ mesh: meshRef.current, data });
    },
  });

  React.useEffect(() => {
    updateInstancedMeshMatrices({ mesh: meshRef.current, data });
  }, [data, layout]);

  const { handleClick, handlePointerDown } = useMousePointInteraction({
    data,
    selectedPoint,
    onSelectPoint,
  });

  const { colorAttrib, colorArray } = usePointColors({ data, selectedPoint });
  const { displayAttrib, displayArray } = usePointDisplay({ data, selectedPoint, targetDate });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[null, null, numPoints]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        visible={true}
      >
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]}>
          <instancedBufferAttribute
            ref={colorAttrib}
            attach="attributes-height"
            args={[colorArray, 3]}
          />
          <instancedBufferAttribute
            ref={displayAttrib}
            attach="attributes-color"
            args={[displayArray, 3]}
          />
        </cylinderGeometry>
        <meshStandardMaterial attach="material" vertexColors />
      </instancedMesh>

      {selectedPoint && (
        <group position={[selectedPoint.x, selectedPoint.y, selectedPoint.z]}>
          <pointLight distance={9} position={[0, 0, 0.3]} intensity={2.2} decay={30} color="#3f3" />
          <pointLight position={[0, 0, 0]} decay={1} distance={5} intensity={1.5} color="#2f0" />
        </group>
      )}
    </>
  );
};

export default InstancedPoints;
