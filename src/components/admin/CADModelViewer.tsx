'use client';

import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Html, 
  Environment,
  PerspectiveCamera,
  Center,
  Bounds
} from '@react-three/drei';
import * as THREE from 'three';
import { TaggedPart } from '@/store/usePortfolioStore';

// Props for the model viewer
interface CADModelViewerProps {
  modelUrl: string | null;
  taggedParts: TaggedPart[];
  onPartClick?: (position: [number, number, number], normal: [number, number, number], meshName?: string) => void;
  selectedPartId?: string | null;
  hoveredPartId?: string | null;
  onHoverPart?: (partId: string | null) => void;
  isTaggingMode?: boolean;
  showLabels?: boolean;
}

// Loader fallback
function LoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading model...</span>
      </div>
    </Html>
  );
}

// Tag marker component
function TagMarker({ 
  part, 
  isSelected, 
  isHovered,
  onClick,
  onHover,
  showLabel
}: { 
  part: TaggedPart; 
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
  showLabel: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Pulse animation for selected
  useFrame((state) => {
    if (meshRef.current && (isSelected || isHovered)) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={part.position}>
      {/* Tag sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : part.color} 
          emissive={isSelected || isHovered ? part.color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : isHovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Connection line */}
      {part.normal && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                0, 0, 0,
                part.normal[0] * 0.2, part.normal[1] * 0.2, part.normal[2] * 0.2
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={part.color} opacity={0.5} transparent />
        </line>
      )}
      
      {/* Label */}
      {showLabel && (
        <Html
          position={part.normal ? [
            part.normal[0] * 0.25,
            part.normal[1] * 0.25,
            part.normal[2] * 0.25
          ] : [0, 0.1, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className={`
              px-2 py-1 rounded text-xs whitespace-nowrap
              ${isSelected 
                ? 'bg-blue-500 text-white' 
                : isHovered 
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/80 text-gray-300'
              }
            `}
          >
            {part.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// GLB/GLTF Model component
function Model({ 
  url, 
  onMeshClick,
  isTaggingMode
}: { 
  url: string;
  onMeshClick?: (position: [number, number, number], normal: [number, number, number], meshName?: string) => void;
  isTaggingMode?: boolean;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  // Clone the scene to avoid reuse issues
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  // Setup click handlers on meshes
  useEffect(() => {
    if (!isTaggingMode) return;
    
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.clickable = true;
      }
    });
  }, [clonedScene, isTaggingMode]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!isTaggingMode || !onMeshClick) return;
    
    e.stopPropagation();
    
    const point = e.point;
    const normal = e.face?.normal || new THREE.Vector3(0, 1, 0);
    const worldNormal = normal.clone();
    
    // Transform normal to world space if we have a mesh
    if (e.object instanceof THREE.Mesh && e.object.matrixWorld) {
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
      worldNormal.applyMatrix3(normalMatrix).normalize();
    }
    
    onMeshClick(
      [point.x, point.y, point.z],
      [worldNormal.x, worldNormal.y, worldNormal.z],
      e.object.name || undefined
    );
  }, [isTaggingMode, onMeshClick]);

  return (
    <primitive 
      ref={modelRef}
      object={clonedScene} 
      onClick={handleClick}
      onPointerEnter={() => {
        if (isTaggingMode) {
          document.body.style.cursor = 'crosshair';
        }
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

// Placeholder when no model
function PlaceholderModel() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4a5568" wireframe />
    </mesh>
  );
}

// Main viewer component
export function CADModelViewer({
  modelUrl,
  taggedParts,
  onPartClick,
  selectedPartId,
  hoveredPartId,
  onHoverPart,
  isTaggingMode = false,
  showLabels = true,
}: CADModelViewerProps) {
  const [localHoveredPart, setLocalHoveredPart] = useState<string | null>(null);
  const actualHoveredPart = hoveredPartId ?? localHoveredPart;

  const handlePartHover = useCallback((partId: string | null) => {
    if (onHoverPart) {
      onHoverPart(partId);
    } else {
      setLocalHoveredPart(partId);
    }
  }, [onHoverPart]);

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[3, 2, 3]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Model */}
        <Suspense fallback={<LoadingIndicator />}>
          <Bounds fit clip observe margin={1.2}>
            <Center>
              {modelUrl ? (
                <Model 
                  url={modelUrl} 
                  onMeshClick={onPartClick}
                  isTaggingMode={isTaggingMode}
                />
              ) : (
                <PlaceholderModel />
              )}
            </Center>
          </Bounds>
        </Suspense>
        
        {/* Tagged parts */}
        {taggedParts.map((part) => (
          <TagMarker
            key={part.id}
            part={part}
            isSelected={part.id === selectedPartId}
            isHovered={part.id === actualHoveredPart}
            onClick={() => {
              // In tagging mode, select the part for editing
              if (onHoverPart) {
                onHoverPart(null);
              }
            }}
            onHover={(hovering) => handlePartHover(hovering ? part.id : null)}
            showLabel={showLabels}
          />
        ))}
        
        {/* Controls */}
        <OrbitControls 
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
      
      {/* Tagging mode indicator */}
      {isTaggingMode && (
        <div className="absolute top-4 left-4 px-3 py-2 bg-blue-500/90 text-white rounded-lg text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Click on model to add tag
        </div>
      )}
      
      {/* No model message */}
      {!modelUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No CAD model uploaded</p>
            <p className="text-sm opacity-75">Upload a GLB/GLTF file to view</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Preview-only version for portfolio display
export function CADModelPreview({
  modelUrl,
  taggedParts,
  selectedPartId,
  hoveredPartId,
  onPartClick,
  onPartHover,
  showLabels = true,
}: {
  modelUrl: string | null;
  taggedParts: TaggedPart[];
  selectedPartId?: string | null;
  hoveredPartId?: string | null;
  onPartClick?: (partId: string) => void;
  onPartHover?: (partId: string | null) => void;
  showLabels?: boolean;
}) {
  return (
    <CADModelViewer
      modelUrl={modelUrl}
      taggedParts={taggedParts}
      selectedPartId={selectedPartId}
      hoveredPartId={hoveredPartId}
      onHoverPart={onPartHover}
      isTaggingMode={false}
      showLabels={showLabels}
    />
  );
}

// Cleanup GLTF cache
useGLTF.preload;
