'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Html,
  Grid,
  Environment,
  ContactShadows,
  Edges,
  useGLTF,
  Center,
  Bounds,
} from '@react-three/drei';
import { usePortfolioStore, Subsystem, TaggedPart, CADAnnotation } from '@/store/usePortfolioStore';
import * as THREE from 'three';
import ProjectContentViewer from './ProjectContentViewer';

// Individual part component
interface PartMeshProps {
  subsystem: Subsystem;
  explodeAmount: number;
  depth?: number;
}

function PartMesh({ subsystem, explodeAmount, depth = 0 }: PartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const {
    selectedSubsystemIds,
    selectSubsystem,
    setHoveredSubsystem,
    showLabels,
    toolMode,
  } = usePortfolioStore();
  
  const isSelected = selectedSubsystemIds.includes(subsystem.id);
  
  // Calculate exploded position
  const explodedPosition = useMemo(() => {
    return [
      subsystem.position[0] + subsystem.explodeVector[0] * explodeAmount,
      subsystem.position[1] + subsystem.explodeVector[1] * explodeAmount,
      subsystem.position[2] + subsystem.explodeVector[2] * explodeAmount,
    ] as [number, number, number];
  }, [subsystem.position, subsystem.explodeVector, explodeAmount]);
  
  // Smooth animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(
        new THREE.Vector3(...explodedPosition),
        0.1
      );
    }
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectSubsystem(subsystem.id, e.shiftKey);
  };
  
  // Size based on depth (children are smaller)
  const size = Math.max(0.3, 0.6 - depth * 0.15);
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={subsystem.position}
        onClick={handleClick}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredSubsystem(subsystem.id);
          document.body.style.cursor = toolMode === 'select' ? 'pointer' : 'crosshair';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          setHoveredSubsystem(null);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={subsystem.color}
          transparent
          opacity={hovered ? 0.9 : 0.8}
          roughness={0.4}
          metalness={0.6}
        />
        {(isSelected || hovered) && (
          <Edges
            linewidth={isSelected ? 3 : 2}
            threshold={15}
            color={isSelected ? '#fbbf24' : '#60a5fa'}
          />
        )}
      </mesh>
      
      {/* Label */}
      {showLabels && (hovered || isSelected) && (
        <Html
          position={[
            explodedPosition[0],
            explodedPosition[1] + size / 2 + 0.2,
            explodedPosition[2],
          ]}
          center
          distanceFactor={8}
        >
          <div className={`
            px-2 py-1 rounded text-xs whitespace-nowrap
            ${isSelected ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 text-white'}
            shadow-lg border border-gray-700
          `}>
            {subsystem.name}
          </div>
        </Html>
      )}
      
      {/* Render children */}
      {subsystem.children?.map((child) => (
        <PartMesh
          key={child.id}
          subsystem={child}
          explodeAmount={explodeAmount}
          depth={depth + 1}
        />
      ))}
    </group>
  );
}

// Camera controller component
function CameraController() {
  const { cameraState } = usePortfolioStore();
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(...cameraState.position);
    camera.lookAt(...cameraState.target);
  }, [cameraState, camera]);
  
  return null;
}

// Loading indicator for 3D model
function ModelLoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading model...</span>
      </div>
    </Html>
  );
}

// GLB/GLTF Model component - wrapped to handle loading
function GLTFModel({ url, scale = 10 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Scale up the model (most CAD exports are in meters, need to convert)
    clone.scale.setScalar(scale);
    return clone;
  }, [scene, scale]);
  
  return <primitive object={clonedScene} />;
}

// Wrapper component that only renders when URL is valid
function SafeGLTFModel({ url, scale }: { url: string | null; scale?: number }) {
  if (!url) return null;
  return <GLTFModel url={url} scale={scale} />;
}

// Tagged Part Marker
function TaggedPartMarker({ 
  part, 
  isSelected, 
  isHovered,
  showLabel,
}: { 
  part: TaggedPart; 
  isSelected: boolean;
  isHovered: boolean;
  showLabel: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectTaggedPart, setHoveredTaggedPart } = usePortfolioStore();
  
  // Pulse animation
  useFrame((state) => {
    if (meshRef.current && (isSelected || isHovered)) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={part.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          selectTaggedPart(part.id);
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHoveredTaggedPart(part.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHoveredTaggedPart(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? '#fbbf24' : isHovered ? '#60a5fa' : part.color} 
          emissive={isSelected || isHovered ? part.color : '#000000'}
          emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0}
        />
      </mesh>
      
      {/* Label */}
      {showLabel && (isSelected || isHovered) && (
        <Html
          position={part.normal ? [
            part.normal[0] * 0.15,
            part.normal[1] * 0.15 + 0.1,
            part.normal[2] * 0.15
          ] : [0, 0.15, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className={`
              px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg
              ${isSelected 
                ? 'bg-yellow-500 text-black font-bold' 
                : 'bg-gray-800 text-white border border-gray-700'
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

// Shape geometry component for viewport markers - supports dimensions
function ViewportShapeGeometry({ shape, size, dimensions }: { 
  shape: string; 
  size: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    radiusTop?: number;
    radiusBottom?: number;
    ringRadius?: number;
    tubeRadius?: number;
  };
}) {
  const d = dimensions || {};
  
  switch (shape) {
    case 'sphere':
      return <sphereGeometry args={[d.radius || size, 16, 16]} />;
    case 'cube':
      return <boxGeometry args={[d.width || size * 1.6, d.height || size * 1.6, d.depth || size * 1.6]} />;
    case 'cylinder':
      return <cylinderGeometry args={[d.radius || d.radiusTop || size, d.radius || d.radiusBottom || size, d.height || size * 2, 16]} />;
    case 'cone':
      return <coneGeometry args={[d.radiusBottom || size, d.height || size * 2, 16]} />;
    case 'ring':
      return <torusGeometry args={[d.ringRadius || size, d.tubeRadius || size * 0.3, 8, 24]} />;
    case 'arrow':
      return <coneGeometry args={[d.radiusBottom || size * 0.8, d.height || size * 2.5, 8]} />;
    default:
      return <sphereGeometry args={[d.radius || size, 16, 16]} />;
  }
}

// Subsystem 3D Annotation Marker - renders different shapes in 3D space
function SubsystemAnnotationMarker3D({ 
  annotation,
  subsystem,
  isSelected,
}: { 
  annotation: CADAnnotation;
  subsystem: Subsystem;
  isSelected: boolean;
}) {
  const { selectSubsystem, setShowProjectOverview } = usePortfolioStore();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    setShowProjectOverview(false);
    selectSubsystem(subsystem.id, false);
  };

  // Pulse animation when selected
  useFrame((state) => {
    if (meshRef.current && (isSelected || hovered)) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const markerColor = isSelected ? '#fbbf24' : (annotation.color || subsystem.color);
  const markerSize = annotation.size || 0.02;
  const markerShape = annotation.shape || 'sphere';
  const markerRotation = annotation.rotation || [0, 0, 0];
  
  return (
    <group position={annotation.position} rotation={markerRotation as [number, number, number]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <ViewportShapeGeometry shape={markerShape} size={markerSize} dimensions={annotation.dimensions} />
        <meshStandardMaterial 
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Outer ring for selected state */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[markerSize * 1.5, markerSize * 0.1, 8, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Label on hover or when selected */}
      {(hovered || isSelected) && (
        <Html
          position={[0, markerSize * 3, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className={`
            px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg
            ${isSelected 
              ? 'bg-yellow-500 text-black font-bold' 
              : 'bg-gray-800 text-white border border-gray-700'
            }
          `}>
            {annotation.label || subsystem.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Container for all subsystem 3D annotations (rendered inside Canvas)
function SubsystemAnnotations3D({ 
  subsystems,
  selectedSubsystemIds,
}: { 
  subsystems: Subsystem[];
  selectedSubsystemIds: string[];
}) {
  if (subsystems.length === 0) return null;

  return (
    <group>
      {subsystems.map(subsystem => {
        const isSelected = selectedSubsystemIds.includes(subsystem.id);
        return (
          <group key={subsystem.id}>
            {(subsystem.cadAnnotations || []).map(annotation => (
              <SubsystemAnnotationMarker3D
                key={annotation.id}
                annotation={annotation}
                subsystem={subsystem}
                isSelected={isSelected}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}

// Main viewport component
interface ViewportProps {
  className?: string;
}

export default function Viewport({ className }: ViewportProps) {
  const { 
    projects, 
    selectedProjectId, 
    explodeAmount, 
    viewMode,
    showLabels,
    selectedTaggedPartId,
    hoveredTaggedPartId,
    showProjectOverview,
    selectedSubsystemIds,
  } = usePortfolioStore();
  
  const [cadModelUrl, setCadModelUrl] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Get all subsystems with annotations for overlay
  const subsystemsWithAnnotations = useMemo(() => {
    if (!selectedProject) return [];
    const findAllSubsystems = (subs: Subsystem[]): Subsystem[] => {
      let result: Subsystem[] = [];
      for (const sub of subs) {
        if (sub.cadAnnotations && sub.cadAnnotations.length > 0) {
          result.push(sub);
        }
        if (sub.children) {
          result = result.concat(findAllSubsystems(sub.children));
        }
      }
      return result;
    };
    return findAllSubsystems(selectedProject.subsystems);
  }, [selectedProject]);

  // Load CAD model URL - either from IndexedDB, inline data, or external URL
  useEffect(() => {
    const loadModel = async () => {
      if (!selectedProject?.cadModel) {
        setCadModelUrl(null);
        return;
      }
      
      const cadModel = selectedProject.cadModel;
      
      if (cadModel.fileId) {
        // Load from IndexedDB
        setLoadingModel(true);
        try {
          const { getFile } = await import('@/lib/fileStorage');
          const storedFile = await getFile(cadModel.fileId);
          if (storedFile) {
            setCadModelUrl(storedFile.data);
          } else {
            setCadModelUrl(null);
          }
        } catch (e) {
          console.error('Failed to load model from storage:', e);
          setCadModelUrl(null);
        }
        setLoadingModel(false);
      } else if (cadModel.fileData) {
        // Legacy: inline base64 data
        setCadModelUrl(cadModel.fileData);
      } else if (cadModel.url) {
        setCadModelUrl(cadModel.url);
      } else {
        setCadModelUrl(null);
      }
    };
    
    loadModel();
  }, [selectedProject?.cadModel?.fileId, selectedProject?.cadModel?.fileData, selectedProject?.cadModel?.url, selectedProject?.cadModel]);

  const taggedParts = useMemo(() => {
    return selectedProject?.cadModel?.taggedParts || [];
  }, [selectedProject]);

  const hasCADModel = !!cadModelUrl || loadingModel;
  const hasSubsystems = selectedProject?.subsystems && selectedProject.subsystems.length > 0;
  
  // Import content view components
  const { 
    ProjectContentView, 
    DrawingView, 
    TimelineView, 
    ResultsView, 
    MediaView 
  } = require('./ContentViews');
  
  const lightMode = usePortfolioStore.getState().theme === 'light';

  // Show Project Content when showProjectOverview is true and no subsystem is selected
  if (viewMode === 'assembly' && selectedProject && showProjectOverview && selectedSubsystemIds.length === 0) {
    return (
      <div className={`${className} ${lightMode ? 'bg-gray-100' : 'bg-gray-900'}`}>
        <ProjectContentViewer project={selectedProject} lightMode={lightMode} />
      </div>
    );
  }
  
  // Render different views based on viewMode
  if (viewMode !== 'assembly' && selectedProject) {
    switch (viewMode) {
      case 'drawing':
        return (
          <div className={className}>
            <DrawingView project={selectedProject} lightMode={lightMode} />
          </div>
        );
      case 'timeline':
        return (
          <div className={className}>
            <TimelineView project={selectedProject} lightMode={lightMode} />
          </div>
        );
      case 'results':
        return (
          <div className={className}>
            <ResultsView project={selectedProject} lightMode={lightMode} />
          </div>
        );
      case 'media':
        return (
          <div className={className}>
            <MediaView project={selectedProject} lightMode={lightMode} />
          </div>
        );
    }
  }
  
  // No project selected for non-assembly views
  if (viewMode !== 'assembly') {
    return (
      <div className={`${className} flex items-center justify-center ${lightMode ? 'bg-gray-100' : 'bg-gray-900'}`}>
        <div className={`text-center ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg mb-2">Select a project to view content</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className} bg-gradient-to-b from-gray-900 to-gray-950`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <CameraController />
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={0.1}
          maxDistance={100}
          target={[0, 0, 0]}
          zoomSpeed={1.2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Ground */}
        <Grid
          position={[0, -2, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={20}
          fadeStrength={1}
          followCamera={false}
        />
        <ContactShadows
          position={[0, -1.99, 0]}
          opacity={0.5}
          scale={20}
          blur={2}
          far={10}
        />
        
        {selectedProject ? (
          <>
            {/* CAD Model (if uploaded) */}
            {cadModelUrl && (
              <Suspense fallback={<ModelLoadingIndicator />}>
                <Bounds fit clip observe margin={1.5}>
                  <Center>
                    <SafeGLTFModel url={cadModelUrl} scale={10} />
                  </Center>
                </Bounds>
              </Suspense>
            )}
            
            {/* Tagged Parts Markers */}
            {taggedParts.map((part) => (
              <TaggedPartMarker
                key={part.id}
                part={part}
                isSelected={part.id === selectedTaggedPartId}
                isHovered={part.id === hoveredTaggedPartId}
                showLabel={showLabels}
              />
            ))}
            
            {/* Subsystem 3D Annotations - markers placed on the model */}
            <SubsystemAnnotations3D 
              subsystems={subsystemsWithAnnotations}
              selectedSubsystemIds={selectedSubsystemIds}
            />
            {/* Legacy Subsystems (if no CAD model) */}
            {!hasCADModel && hasSubsystems && selectedProject.subsystems.map((subsystem) => (
              <PartMesh
                key={subsystem.id}
                subsystem={subsystem}
                explodeAmount={explodeAmount}
              />
            ))}
            
            {/* No content message */}
            {!hasCADModel && !hasSubsystems && (
              <Html center>
                <div className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm text-center">
                  <p className="mb-1">No 3D model uploaded</p>
                  <p className="text-xs text-gray-400">Add a CAD model in the admin panel</p>
                </div>
              </Html>
            )}
          </>
        ) : (
          // Default placeholder when no project selected
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4a5568" transparent opacity={0.5} />
            </mesh>
            <Html center>
              <div className="px-4 py-2 bg-gray-800 rounded-lg text-white text-sm whitespace-nowrap">
                Select a project to view assembly
              </div>
            </Html>
          </group>
        )}
        
        {/* Axes helper removed for cleaner view */}
      </Canvas>
      
      {/* Viewport overlay controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400">
        <div className="px-2 py-1 bg-gray-800/80 rounded">
          Orbit: LMB | Pan: RMB | Zoom: Scroll
        </div>
        <div className="px-2 py-1 bg-gray-800/80 rounded">
          <kbd className="font-mono">F</kbd> Focus | <kbd className="font-mono">E</kbd> Explode | <kbd className="font-mono">L</kbd> Labels
        </div>
      </div>
      
      {/* Model info overlay */}
      {selectedProject && hasCADModel && (
        <div className="absolute top-4 right-4 px-3 py-2 bg-gray-800/80 rounded text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            3D Model: {selectedProject.cadModel?.name}
          </div>
          {taggedParts.length > 0 && (
            <div className="mt-1 text-gray-500">
              {taggedParts.length} tagged part{taggedParts.length !== 1 ? 's' : ''} - click to inspect
            </div>
          )}
        </div>
      )}
    </div>
  );
}
