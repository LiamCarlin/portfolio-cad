'use client';

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Trash2, 
  Plus, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  MousePointer,
  Circle,
  Square,
  Triangle,
  Cylinder,
  ArrowUp,
  Move,
  RotateCw,
} from 'lucide-react';
import { CADAnnotation, Subsystem, Project, CADModel, AnnotationShape, AnnotationDimensions } from '@/store/usePortfolioStore';

// Helper to get model URL from CADModel
async function resolveModelUrl(cadModel: CADModel): Promise<string | null> {
  if (cadModel.fileId) {
    try {
      const { getFile } = await import('@/lib/fileStorage');
      const stored = await getFile(cadModel.fileId);
      if (stored) return stored.data;
    } catch (e) {
      console.error('Failed to load from fileStorage:', e);
    }
  }
  if (cadModel.fileData) return cadModel.fileData;
  if (cadModel.url) return cadModel.url;
  return null;
}

interface SubsystemCADAnnotatorProps {
  project: Project;
  subsystem: Subsystem;
  onUpdateAnnotations: (annotations: CADAnnotation[]) => void;
}

// Shape icons mapping
const shapeIcons: Record<AnnotationShape, React.ReactNode> = {
  sphere: <Circle size={16} />,
  cube: <Square size={16} />,
  cylinder: <Cylinder size={16} />,
  cone: <Triangle size={16} />,
  ring: <Circle size={16} className="opacity-50" />,
  arrow: <ArrowUp size={16} />,
};

// Default dimensions for each shape
function getDefaultDimensions(shape: AnnotationShape, baseSize: number = 0.02): AnnotationDimensions {
  switch (shape) {
    case 'sphere':
      return { radius: baseSize };
    case 'cube':
      return { width: baseSize * 2, height: baseSize * 2, depth: baseSize * 2 };
    case 'cylinder':
      return { radius: baseSize, height: baseSize * 3 };
    case 'cone':
      return { radiusBottom: baseSize, height: baseSize * 3 };
    case 'ring':
      return { ringRadius: baseSize * 1.5, tubeRadius: baseSize * 0.4 };
    case 'arrow':
      return { radiusBottom: baseSize, height: baseSize * 4 };
    default:
      return { radius: baseSize };
  }
}

// Shape geometry component with dimensions
function ShapeGeometry({ shape, dimensions, fallbackSize }: { 
  shape: AnnotationShape; 
  dimensions?: AnnotationDimensions;
  fallbackSize: number;
}) {
  const d = dimensions || getDefaultDimensions(shape, fallbackSize);
  
  switch (shape) {
    case 'sphere':
      return <sphereGeometry args={[d.radius || fallbackSize, 16, 16]} />;
    case 'cube':
      return <boxGeometry args={[d.width || fallbackSize * 2, d.height || fallbackSize * 2, d.depth || fallbackSize * 2]} />;
    case 'cylinder':
      return <cylinderGeometry args={[d.radius || d.radiusTop || fallbackSize, d.radius || d.radiusBottom || fallbackSize, d.height || fallbackSize * 2, 16]} />;
    case 'cone':
      return <coneGeometry args={[d.radiusBottom || fallbackSize, d.height || fallbackSize * 2, 16]} />;
    case 'ring':
      return <torusGeometry args={[d.ringRadius || fallbackSize, d.tubeRadius || fallbackSize * 0.3, 8, 24]} />;
    case 'arrow':
      return <coneGeometry args={[d.radiusBottom || fallbackSize * 0.8, d.height || fallbackSize * 2.5, 8]} />;
    default:
      return <sphereGeometry args={[d.radius || fallbackSize, 16, 16]} />;
  }
}

// Dimension input component
function DimensionInput({ 
  label, 
  value, 
  onChange, 
  step = 0.001,
  min = 0.001,
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-16">{label}:</span>
      <input
        type="number"
        value={value.toFixed(3)}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && v >= min) onChange(v);
        }}
        step={step}
        min={min}
        className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono"
      />
    </div>
  );
}

// Dimension editor for different shapes
function DimensionEditor({ 
  shape, 
  dimensions, 
  onChange 
}: { 
  shape: AnnotationShape;
  dimensions: AnnotationDimensions;
  onChange: (dims: AnnotationDimensions) => void;
}) {
  const updateDim = (key: keyof AnnotationDimensions, value: number) => {
    onChange({ ...dimensions, [key]: value });
  };

  switch (shape) {
    case 'sphere':
      return (
        <div className="space-y-1">
          <DimensionInput label="Radius" value={dimensions.radius || 0.02} onChange={(v) => updateDim('radius', v)} />
        </div>
      );
    
    case 'cube':
      return (
        <div className="space-y-1">
          <DimensionInput label="Width (X)" value={dimensions.width || 0.04} onChange={(v) => updateDim('width', v)} />
          <DimensionInput label="Height (Y)" value={dimensions.height || 0.04} onChange={(v) => updateDim('height', v)} />
          <DimensionInput label="Depth (Z)" value={dimensions.depth || 0.04} onChange={(v) => updateDim('depth', v)} />
        </div>
      );
    
    case 'cylinder':
      return (
        <div className="space-y-1">
          <DimensionInput label="Radius" value={dimensions.radius || 0.02} onChange={(v) => updateDim('radius', v)} />
          <DimensionInput label="Height" value={dimensions.height || 0.06} onChange={(v) => updateDim('height', v)} />
        </div>
      );
    
    case 'cone':
      return (
        <div className="space-y-1">
          <DimensionInput label="Base Radius" value={dimensions.radiusBottom || 0.02} onChange={(v) => updateDim('radiusBottom', v)} />
          <DimensionInput label="Height" value={dimensions.height || 0.06} onChange={(v) => updateDim('height', v)} />
        </div>
      );
    
    case 'ring':
      return (
        <div className="space-y-1">
          <DimensionInput label="Ring Radius" value={dimensions.ringRadius || 0.03} onChange={(v) => updateDim('ringRadius', v)} />
          <DimensionInput label="Tube Radius" value={dimensions.tubeRadius || 0.008} onChange={(v) => updateDim('tubeRadius', v)} />
        </div>
      );
    
    case 'arrow':
      return (
        <div className="space-y-1">
          <DimensionInput label="Base Radius" value={dimensions.radiusBottom || 0.016} onChange={(v) => updateDim('radiusBottom', v)} />
          <DimensionInput label="Height" value={dimensions.height || 0.08} onChange={(v) => updateDim('height', v)} />
        </div>
      );
    
    default:
      return null;
  }
}

// 3D Marker component with different shapes
function Marker3D({ 
  annotation, 
  isSelected, 
  onClick,
  onDelete,
  onTransformChange,
  transformMode,
  orbitControlsRef,
}: { 
  annotation: CADAnnotation;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onTransformChange: (position: [number, number, number], rotation: [number, number, number]) => void;
  transformMode: 'translate' | 'rotate';
  orbitControlsRef: React.RefObject<any>;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  
  // Store local position/rotation while dragging to prevent prop updates from interfering
  const [localPosition, setLocalPosition] = useState<[number, number, number]>(annotation.position);
  const [localRotation, setLocalRotation] = useState<[number, number, number]>(annotation.rotation || [0, 0, 0]);

  // Update local state only when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalPosition(annotation.position);
      setLocalRotation(annotation.rotation || [0, 0, 0]);
    }
  }, [annotation.position, annotation.rotation]);

  // Handle transform changes with debouncing
  useEffect(() => {
    if (transformRef.current && isSelected) {
      const controls = transformRef.current;
      
      const handleDraggingChanged = (event: any) => {
        isDraggingRef.current = event.value;
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !event.value;
        }
        
        // Only update state when finished dragging
        if (!event.value && meshRef.current) {
          const pos = meshRef.current.position;
          const rot = meshRef.current.rotation;
          const newPos: [number, number, number] = [pos.x, pos.y, pos.z];
          const newRot: [number, number, number] = [rot.x, rot.y, rot.z];
          setLocalPosition(newPos);
          setLocalRotation(newRot);
          onTransformChange(newPos, newRot);
        }
      };

      controls.addEventListener('dragging-changed', handleDraggingChanged);

      return () => {
        controls.removeEventListener('dragging-changed', handleDraggingChanged);
      };
    }
  }, [isSelected, onTransformChange, orbitControlsRef]);
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={localPosition}
        rotation={localRotation}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <ShapeGeometry 
          shape={annotation.shape || 'sphere'} 
          dimensions={annotation.dimensions}
          fallbackSize={annotation.size} 
        />
        <meshStandardMaterial 
          color={annotation.color}
          emissive={annotation.color}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Transform controls when selected */}
      {isSelected && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode={transformMode}
          size={0.5}
        />
      )}
      
      {/* Label on hover or when selected */}
      {(hovered || isSelected) && annotation.label && (
        <Html
          position={[
            localPosition[0],
            localPosition[1] + (annotation.dimensions?.height || annotation.size * 2) + 0.02,
            localPosition[2]
          ]}
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="bg-gray-900/90 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-700">
            {annotation.label}
          </div>
        </Html>
      )}
      
      {/* Delete button when selected */}
      {isSelected && (
        <Html
          position={[
            localPosition[0] + (annotation.dimensions?.width || annotation.size) + 0.03,
            localPosition[1],
            localPosition[2]
          ]}
          center
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow-lg"
            title="Delete marker"
          >
            <Trash2 size={12} />
          </button>
        </Html>
      )}
    </group>
  );
}

// The 3D model with click-to-annotate functionality
function AnnotatableModel({ 
  url, 
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onDeleteAnnotation,
  onUpdateAnnotation,
  isAddMode,
  currentShape,
  currentDimensions,
  subsystemColor,
  subsystemName,
  onAddAnnotation,
  transformMode,
  orbitControlsRef,
}: {
  url: string;
  annotations: CADAnnotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onDeleteAnnotation: (id: string) => void;
  onUpdateAnnotation: (id: string, updates: Partial<CADAnnotation>) => void;
  isAddMode: boolean;
  currentShape: AnnotationShape;
  currentDimensions: AnnotationDimensions;
  subsystemColor: string;
  subsystemName: string;
  onAddAnnotation: (position: [number, number, number], normal: [number, number, number], meshName?: string) => void;
  transformMode: 'translate' | 'rotate';
  orbitControlsRef: React.RefObject<any>;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  // Clone the scene to avoid modifying the cached original
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.raycast = THREE.Mesh.prototype.raycast;
      }
    });
    return clone;
  }, [scene]);

  // Handle click on the model to add annotation
  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    if (!isAddMode) return;
    
    event.stopPropagation();
    
    const point = event.point;
    const face = event.face;
    const object = event.object;
    
    if (point && face) {
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
      const worldNormal = face.normal.clone().applyMatrix3(normalMatrix).normalize();
      
      onAddAnnotation(
        [point.x, point.y, point.z],
        [worldNormal.x, worldNormal.y, worldNormal.z],
        object.name || undefined
      );
    }
  }, [isAddMode, onAddAnnotation]);

  // Click on background to deselect
  const handleMiss = useCallback(() => {
    if (!isAddMode) {
      onSelectAnnotation(null);
    }
  }, [isAddMode, onSelectAnnotation]);

  // Handle transform change for a marker
  const handleTransformChange = useCallback((id: string, position: [number, number, number], rotation: [number, number, number]) => {
    onUpdateAnnotation(id, { position, rotation });
  }, [onUpdateAnnotation]);

  return (
    <>
      <primitive 
        ref={modelRef}
        object={clonedScene} 
        onClick={handleClick}
        onPointerMissed={handleMiss}
      />
      
      {/* Render all annotation markers */}
      {annotations.map((annotation) => (
        <Marker3D
          key={annotation.id}
          annotation={annotation}
          isSelected={selectedAnnotationId === annotation.id}
          onClick={() => onSelectAnnotation(annotation.id)}
          onDelete={() => onDeleteAnnotation(annotation.id)}
          onTransformChange={(pos, rot) => handleTransformChange(annotation.id, pos, rot)}
          transformMode={transformMode}
          orbitControlsRef={orbitControlsRef}
        />
      ))}
    </>
  );
}

// Loading placeholder
function ModelLoading() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#374151" wireframe />
    </mesh>
  );
}

// Main component
export default function SubsystemCADAnnotator({ project, subsystem, onUpdateAnnotations }: SubsystemCADAnnotatorProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<CADAnnotation[]>(subsystem.cadAnnotations || []);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentShape, setCurrentShape] = useState<AnnotationShape>('sphere');
  const [currentDimensions, setCurrentDimensions] = useState<AnnotationDimensions>(getDefaultDimensions('sphere'));
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const orbitControlsRef = useRef<any>(null);

  // Update default dimensions when shape changes
  useEffect(() => {
    setCurrentDimensions(getDefaultDimensions(currentShape));
  }, [currentShape]);

  // Load the CAD model
  useEffect(() => {
    async function loadModel() {
      setLoading(true);
      setError(null);

      if (!project.cadModel) {
        setError('No CAD model uploaded for this project');
        setLoading(false);
        return;
      }

      try {
        const url = await resolveModelUrl(project.cadModel);
        if (url) {
          setModelUrl(url);
        } else {
          setError('Failed to load CAD model');
        }
      } catch (e) {
        console.error('Error loading model:', e);
        setError('Error loading CAD model');
      }

      setLoading(false);
    }

    loadModel();
  }, [project.cadModel]);

  // Sync annotations from props
  useEffect(() => {
    setAnnotations(subsystem.cadAnnotations || []);
  }, [subsystem.cadAnnotations]);

  // Notify parent of changes
  useEffect(() => {
    onUpdateAnnotations(annotations);
  }, [annotations, onUpdateAnnotations]);

  // Add a new annotation at the clicked point
  const handleAddAnnotation = useCallback((
    position: [number, number, number], 
    normal: [number, number, number],
    meshName?: string
  ) => {
    const newAnnotation: CADAnnotation = {
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      rotation: [0, 0, 0],
      normal,
      meshName,
      shape: currentShape,
      color: subsystem.color || '#3B82F6',
      size: 0.02, // Legacy fallback
      dimensions: { ...currentDimensions },
      label: subsystem.name,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
  }, [subsystem.color, subsystem.name, currentShape, currentDimensions]);

  // Update an annotation
  const handleUpdateAnnotation = useCallback((id: string, updates: Partial<CADAnnotation>) => {
    setAnnotations(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  }, []);

  // Delete selected annotation
  const handleDeleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  }, [selectedAnnotationId]);

  // Clear all annotations
  const handleClearAll = useCallback(() => {
    if (window.confirm('Delete all markers for this subsystem?')) {
      setAnnotations([]);
      setSelectedAnnotationId(null);
    }
  }, []);

  // Available shapes
  const shapes: AnnotationShape[] = ['sphere', 'cube', 'cylinder', 'cone', 'ring', 'arrow'];

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading CAD model...</div>
      </div>
    );
  }

  if (error || !modelUrl) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-red-400">{error || 'No CAD model available'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar Row 1 - Mode controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Mode Toggle */}
        <button
          onClick={() => {
            setIsAddMode(!isAddMode);
            if (!isAddMode) setSelectedAnnotationId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isAddMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={isAddMode ? 'Click anywhere on model to place marker' : 'Enable add mode'}
        >
          {isAddMode ? <Plus size={16} /> : <MousePointer size={16} />}
          {isAddMode ? 'Click to Add' : 'Add Markers'}
        </button>

        {/* Transform Mode (only when not in add mode and has selection) */}
        {!isAddMode && selectedAnnotationId && (
          <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
            <button
              onClick={() => setTransformMode('translate')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                transformMode === 'translate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Move marker"
            >
              <Move size={14} />
              Move
            </button>
            <button
              onClick={() => setTransformMode('rotate')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                transformMode === 'rotate'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Rotate marker"
            >
              <RotateCw size={14} />
              Rotate
            </button>
          </div>
        )}

        {/* Toggle visibility */}
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
            showAnnotations 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-800 text-gray-500'
          }`}
          title={showAnnotations ? 'Hide markers' : 'Show markers'}
        >
          {showAnnotations ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        {/* Clear all */}
        <button
          onClick={handleClearAll}
          disabled={annotations.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Clear all markers"
        >
          <RotateCcw size={16} />
          Clear
        </button>
      </div>

      {/* Toolbar Row 2 - Shape selection (only in add mode) */}
      {isAddMode && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Shape:</span>
            <div className="flex items-center gap-1 bg-gray-900 rounded p-1">
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setCurrentShape(shape)}
                  className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
                    currentShape === shape
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={shape.charAt(0).toUpperCase() + shape.slice(1)}
                >
                  {shapeIcons[shape]}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {currentShape.charAt(0).toUpperCase() + currentShape.slice(1)}
            </span>
          </div>
          
          {/* Dimensions for new markers */}
          <div className="border-t border-gray-700 pt-2">
            <div className="text-xs text-gray-400 mb-2">Dimensions (units):</div>
            <DimensionEditor 
              shape={currentShape}
              dimensions={currentDimensions}
              onChange={setCurrentDimensions}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      {isAddMode && (
        <div className="bg-green-900/30 border border-green-700/50 rounded px-3 py-2 text-sm text-green-300">
          <strong>Add Mode:</strong> Click on the 3D model to place a <strong>{currentShape}</strong> marker with the specified dimensions.
        </div>
      )}

      {selectedAnnotationId && !isAddMode && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded px-3 py-2 text-sm text-blue-300">
          <strong>Edit Mode:</strong> Use the gizmo to {transformMode} the selected marker. Edit dimensions below.
        </div>
      )}

      {/* 3D Canvas */}
      <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <Canvas
          camera={{ position: [2, 2, 2], fov: 50 }}
          onPointerMissed={() => {
            if (!isAddMode) setSelectedAnnotationId(null);
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          <Suspense fallback={<ModelLoading />}>
            <AnnotatableModel
              url={modelUrl}
              annotations={showAnnotations ? annotations : []}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
              onDeleteAnnotation={handleDeleteAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              isAddMode={isAddMode}
              currentShape={currentShape}
              currentDimensions={currentDimensions}
              subsystemColor={subsystem.color || '#3B82F6'}
              subsystemName={subsystem.name}
              onAddAnnotation={handleAddAnnotation}
              transformMode={transformMode}
              orbitControlsRef={orbitControlsRef}
            />
          </Suspense>

          <OrbitControls 
            ref={orbitControlsRef}
            makeDefault 
            enableDamping={false}
          />
        </Canvas>

        {/* Mode indicator */}
        <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-gray-900/80 text-gray-300">
          {isAddMode ? `🎯 Click to add ${currentShape}` : selectedAnnotationId ? `✋ ${transformMode === 'translate' ? 'Move' : 'Rotate'} marker` : '🔄 Rotate to view'}
        </div>

        {/* Marker count */}
        <div className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-gray-900/80 text-gray-300">
          {annotations.length} marker{annotations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selected annotation details */}
      {selectedAnnotationId && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Selected Marker</span>
            <button
              onClick={() => handleDeleteAnnotation(selectedAnnotationId)}
              className="text-red-400 hover:text-red-300 p-1"
              title="Delete this marker"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {(() => {
            const selected = annotations.find(a => a.id === selectedAnnotationId);
            if (!selected) return null;
            
            // Ensure dimensions exist
            const dims = selected.dimensions || getDefaultDimensions(selected.shape, selected.size);
            
            return (
              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  <div>Position: ({selected.position.map(p => p.toFixed(3)).join(', ')})</div>
                  {selected.meshName && <div>Mesh: {selected.meshName}</div>}
                </div>
                
                {/* Label input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16">Label:</span>
                  <input
                    type="text"
                    value={selected.label || ''}
                    onChange={(e) => handleUpdateAnnotation(selected.id, { label: e.target.value })}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                    placeholder="Add a label..."
                  />
                </div>

                {/* Shape selector for existing marker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16">Shape:</span>
                  <div className="flex items-center gap-1">
                    {shapes.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => {
                          const newDims = getDefaultDimensions(shape, selected.size);
                          handleUpdateAnnotation(selected.id, { shape, dimensions: newDims });
                        }}
                        className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                          selected.shape === shape
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title={shape}
                      >
                        {shapeIcons[shape]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimension inputs for selected marker */}
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-xs text-gray-400 mb-2">Dimensions:</div>
                  <DimensionEditor 
                    shape={selected.shape}
                    dimensions={dims}
                    onChange={(newDims) => handleUpdateAnnotation(selected.id, { dimensions: newDims })}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-400">
        {annotations.length} marker{annotations.length !== 1 ? 's' : ''} placed for <strong className="text-white">{subsystem.name}</strong>
      </div>
    </div>
  );
}
