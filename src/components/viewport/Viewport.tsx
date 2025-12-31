'use client';

import React, { useRef, useState, useMemo, useEffect, useCallback, Suspense } from 'react';
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
import { usePortfolioStore, Subsystem, TaggedPart } from '@/store/usePortfolioStore';
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
    const explodeVector = subsystem.explodeVector ?? [0, 0, 0];
    return [
      subsystem.position[0] + explodeVector[0] * explodeAmount,
      subsystem.position[1] + explodeVector[1] * explodeAmount,
      subsystem.position[2] + explodeVector[2] * explodeAmount,
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

interface SubsystemSelection {
  subsystem: Subsystem;
  meshNames: Set<string>;
  meshIndices: Set<number>;
}

interface ViewportMeshInfo {
  mesh: THREE.Mesh;
  index: number;
  name: string;
}

function createHighlightMaterial(color: string, opacity: number, emissiveIntensity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    emissive: new THREE.Color(color),
    emissiveIntensity,
  });
}

function SubsystemHighlightModel({
  url,
  scale = 10,
  selections,
}: {
  url: string;
  scale?: number;
  selections: SubsystemSelection[];
}) {
  const { scene } = useGLTF(url);
  const {
    selectedSubsystemIds,
    hoveredSubsystemId,
    setHoveredSubsystem,
    selectSubsystem,
    setShowProjectOverview,
  } = usePortfolioStore();

  const { modelScene, meshInfos } = useMemo(() => {
    const clone = scene.clone(true);
    clone.scale.setScalar(scale);
    const infos: ViewportMeshInfo[] = [];
    let index = 0;
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name || `mesh-${index}`;
        child.userData.baseMaterial = child.material;
        child.userData.meshIndex = index;
        child.userData.meshName = name;
        infos.push({ mesh: child, index, name });
        index += 1;
      }
    });
    clone.updateMatrixWorld(true);
    return { modelScene: clone, meshInfos: infos };
  }, [scene, scale]);

  const selectionMaps = useMemo(() => {
    const byName = new Map<string, Set<string>>();
    const byIndex = new Map<number, Set<string>>();
    for (const selection of selections) {
      selection.meshNames.forEach((name) => {
        if (!byName.has(name)) byName.set(name, new Set());
        byName.get(name)!.add(selection.subsystem.id);
      });
      selection.meshIndices.forEach((index) => {
        if (!byIndex.has(index)) byIndex.set(index, new Set());
        byIndex.get(index)!.add(selection.subsystem.id);
      });
    }
    return { byName, byIndex };
  }, [selections]);

  useEffect(() => {
    meshInfos.forEach((info) => {
      const ids = new Set<string>();
      const nameMatches = selectionMaps.byName.get(info.name);
      if (nameMatches) {
        nameMatches.forEach((id) => ids.add(id));
      }
      const indexMatches = selectionMaps.byIndex.get(info.index);
      if (indexMatches) {
        indexMatches.forEach((id) => ids.add(id));
      }
      info.mesh.userData.subsystemIds = Array.from(ids);
    });
  }, [meshInfos, selectionMaps]);

  const hoveredColor = useMemo(() => {
    if (!hoveredSubsystemId) return null;
    const match = selections.find((s) => s.subsystem.id === hoveredSubsystemId);
    return match?.subsystem.color || '#60a5fa';
  }, [hoveredSubsystemId, selections]);

  const selectedMaterial = useMemo(
    () => createHighlightMaterial('#fbbf24', 0.9, 0.6),
    []
  );
  const hoveredMaterial = useMemo(
    () => (hoveredColor ? createHighlightMaterial(hoveredColor, 0.8, 0.5) : null),
    [hoveredColor]
  );

  useEffect(() => {
    return () => {
      selectedMaterial.dispose();
    };
  }, [selectedMaterial]);

  useEffect(() => {
    if (!hoveredMaterial) return;
    return () => {
      hoveredMaterial.dispose();
    };
  }, [hoveredMaterial]);

  useEffect(() => {
    meshInfos.forEach((info) => {
      const ids: string[] = info.mesh.userData.subsystemIds || [];
      const isSelected = ids.some((id) => selectedSubsystemIds.includes(id));
      const isHovered = hoveredSubsystemId ? ids.includes(hoveredSubsystemId) : false;

      if (isSelected) {
        info.mesh.material = selectedMaterial;
      } else if (isHovered && hoveredMaterial) {
        info.mesh.material = hoveredMaterial;
      } else {
        info.mesh.material = info.mesh.userData.baseMaterial || info.mesh.material;
      }
    });
  }, [meshInfos, selectedSubsystemIds, hoveredSubsystemId, selectedMaterial, hoveredMaterial]);

  const pickSubsystemId = useCallback((object: THREE.Object3D) => {
    if (!(object instanceof THREE.Mesh)) return null;
    const ids: string[] = object.userData.subsystemIds || [];
    if (ids.length === 0) return null;
    const selectedMatch = ids.find((id) => selectedSubsystemIds.includes(id));
    if (selectedMatch) return selectedMatch;
    return ids[0];
  }, [selectedSubsystemIds]);

  const hasSelections = selections.length > 0;

  const handlePointerMove = useCallback((event: any) => {
    if (!hasSelections) return;
    event.stopPropagation();
    const subsystemId = pickSubsystemId(event.object);
    if (subsystemId) {
      setHoveredSubsystem(subsystemId);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredSubsystem(null);
      document.body.style.cursor = 'auto';
    }
  }, [hasSelections, pickSubsystemId, setHoveredSubsystem]);

  const handlePointerOut = useCallback(() => {
    if (!hasSelections) return;
    setHoveredSubsystem(null);
    document.body.style.cursor = 'auto';
  }, [hasSelections, setHoveredSubsystem]);

  const handleClick = useCallback((event: any) => {
    if (!hasSelections) return;
    event.stopPropagation();
    const subsystemId = pickSubsystemId(event.object);
    if (subsystemId) {
      setShowProjectOverview(false);
      selectSubsystem(subsystemId, event.shiftKey);
    }
  }, [hasSelections, pickSubsystemId, selectSubsystem, setShowProjectOverview]);

  return (
    <primitive
      object={modelScene}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
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

  const subsystemSelections = useMemo(() => {
    if (!selectedProject) return [];
    const selections: SubsystemSelection[] = [];
    const collect = (subs: Subsystem[]) => {
      for (const sub of subs) {
        const meshNames = new Set<string>();
        const meshIndices = new Set<number>();
        for (const annotation of sub.cadAnnotations || []) {
          annotation.selectedMeshNames?.forEach((name) => meshNames.add(name));
          annotation.selectedMeshIndices?.forEach((index) => meshIndices.add(index));
          if (annotation.meshName) meshNames.add(annotation.meshName);
        }
        if (meshNames.size > 0 || meshIndices.size > 0) {
          selections.push({ subsystem: sub, meshNames, meshIndices });
        }
        if (sub.children) {
          collect(sub.children);
        }
      }
    };
    collect(selectedProject.subsystems);
    return selections;
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
  
  // Experience view removed from main viewport; shown on welcome page instead
  
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
                    <SubsystemHighlightModel url={cadModelUrl} scale={10} selections={subsystemSelections} />
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
