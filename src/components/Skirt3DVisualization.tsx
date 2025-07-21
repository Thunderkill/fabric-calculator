import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface PanelDimensions {
  id: number;
  waistWidth: number;
  hemWidth: number;
  height: number;
  waistWidthWithSeam: number;
  hemWidthWithSeam: number;
  heightWithSeam: number;
}

interface Skirt3DVisualizationProps {
  panels: PanelDimensions[];
  skirtLength: number;
  waistCircumference: number;
}

const Panel: React.FC<{
  color: string;
  startAngle: number;
  endAngle: number;
  waistRadius: number;
  hemRadius: number;
  height: number;
}> = ({ color, startAngle, endAngle, waistRadius, hemRadius, height }) => {
  const ref = useRef<THREE.Mesh>(null);

  // Create custom BufferGeometry for the curved panel
  const segments = 16; // Number of segments to approximate the curve
  const panelVertices: number[] = [];
  const panelIndices: number[] = [];

  // Calculate angular width of the panel
  const angleRange = endAngle - startAngle;

  for (let i = 0; i <= segments; i++) {
    const u = i / segments; // Normalized position along the segment (0 to 1)
    const currentSegmentAngle = startAngle + u * angleRange;

    // Vertices for the top edge (waist)
    panelVertices.push(
      waistRadius * Math.cos(currentSegmentAngle),
      height / 2,
      waistRadius * Math.sin(currentSegmentAngle)
    );

    // Vertices for the bottom edge (hem)
    panelVertices.push(
      hemRadius * Math.cos(currentSegmentAngle),
      -height / 2,
      hemRadius * Math.sin(currentSegmentAngle)
    );
  }

  // Create faces (two triangles per segment)
  for (let i = 0; i < segments; i++) {
    const i0 = i * 2;     // Current top vertex
    const i1 = i * 2 + 1; // Current bottom vertex
    const i2 = (i + 1) * 2;     // Next top vertex
    const i3 = (i + 1) * 2 + 1; // Next bottom vertex

    // Triangle 1: current top, next top, current bottom
    panelIndices.push(i0, i2, i1);
    // Triangle 2: next top, next bottom, current bottom
    panelIndices.push(i2, i3, i1);
  }

  const vertices = new Float32Array(panelVertices);
  const indices = new Uint16Array(panelIndices);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals(); // Important for lighting

  return (
    <mesh ref={ref}>
      <primitive object={geometry} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Skirt3DVisualization: React.FC<Skirt3DVisualizationProps> = ({
  panels,
  skirtLength,
  waistCircumference,
}) => {
  if (!panels || panels.length === 0) {
    return null;
  }

  const colors = [
    '#FF6347', // Tomato
    '#4682B4', // SteelBlue
    '#32CD32', // LimeGreen
    '#FFD700', // Gold
    '#8A2BE2', // BlueViolet
    '#FF69B4', // HotPink
    '#00CED1', // DarkTurquoise
    '#FFA500', // Orange
  ];

  const waistRadius = waistCircumference / (2 * Math.PI);
  // Calculate hem circumference based on panel dimensions to get accurate hem radius
  const totalHemCircumference = panels.reduce((sum, panel) => sum + panel.hemWidth, 0);
  const hemRadius = totalHemCircumference / (2 * Math.PI);

  // Calculate the total angle covered by all panels at the waist

  let currentAngle = 0;

  return (
    <div style={{ width: '100%', height: '500px', background: '#f0f0f0' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, skirtLength / 2, waistRadius * 3]} fov={50} />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 10, 7.5]} intensity={1.5} />

        {panels.map((panel, index) => {
          const panelWaistAngle = (panel.waistWidth / waistCircumference) * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + panelWaistAngle;
          currentAngle = endAngle; // Update for the next panel

          return (
            <Panel
              key={panel.id}
              color={colors[index % colors.length]}
              startAngle={startAngle}
              endAngle={endAngle}
              waistRadius={waistRadius}
              hemRadius={hemRadius}
              height={panel.height}
            />
          );
        })}
      </Canvas>
    </div>
  );
};


export default Skirt3DVisualization;