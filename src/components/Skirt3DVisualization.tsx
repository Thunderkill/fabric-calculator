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

  // Create custom BufferGeometry for the trapezoidal panel
  const vertices = new Float32Array([
    // Top face (waist)
    waistRadius * Math.cos(startAngle), height / 2, waistRadius * Math.sin(startAngle), // 0: Top-left
    waistRadius * Math.cos(endAngle), height / 2, waistRadius * Math.sin(endAngle),     // 1: Top-right
    // Bottom face (hem)
    hemRadius * Math.cos(endAngle), -height / 2, hemRadius * Math.sin(endAngle),       // 2: Bottom-right
    hemRadius * Math.cos(startAngle), -height / 2, hemRadius * Math.sin(startAngle),   // 3: Bottom-left
  ]);

  const indices = new Uint16Array([
    // Front face (connecting top-left to bottom-left, and top-right to bottom-right)
    0, 3, 2, // Triangle 1
    0, 2, 1, // Triangle 2

    // Back face (optional, if DoubleSide is not enough or for thickness)
    // For a single-sided panel, we only need the front.
    // If we want a thin 3D panel, we'd need more vertices and faces.
    // For now, let's assume it's a single-sided "fabric" panel.
  ]);

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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

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