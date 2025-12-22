import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

// Types for the portfolio data model
export interface Artifact {
  id: string;
  name: string;
  type: 'cad' | 'photo' | 'video' | 'code' | 'document';
  url?: string;
  file?: string; // Base64 or blob URL for uploaded files
  description?: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  description: string;
  completed: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'gallery' | 'list' | 'quote' | 'link' | 'video';
  content: string;
  // For heading
  level?: 1 | 2 | 3;
  // For image
  caption?: string;
  file?: string; // Base64 for uploaded images
  // For gallery
  images?: string[];
  imageFiles?: string[]; // Base64 for uploaded images
  // For list
  items?: string[];
  // For quote
  author?: string;
  // For link
  url?: string;
  title?: string;
}

// Tagged part in a 3D model - clicked and annotated by user
export interface TaggedPart {
  id: string;
  name: string;
  description: string;
  role: string;
  tools: string[];
  outcomes: string[];
  // 3D position where user clicked
  position: [number, number, number];
  // Normal direction for label placement
  normal?: [number, number, number];
  // Color for highlighting
  color: string;
  // Optional mesh name from GLTF
  meshName?: string;
}

// Uploaded 3D model
export interface CADModel {
  id: string;
  name: string;
  // File data - base64 encoded GLB/GLTF (legacy, inline storage)
  fileData?: string;
  // Or reference to IndexedDB stored file
  fileId?: string;
  // Or external URL
  url?: string;
  // File type
  type: 'glb' | 'gltf' | 'step' | 'obj';
  // Tagged parts within this model
  taggedParts: TaggedPart[];
}

// Uploaded image
export interface UploadedImage {
  id: string;
  name: string;
  data: string; // Base64
  caption?: string;
}

export interface Subsystem {
  id: string;
  name: string;
  description: string;
  role: string;
  tools: string[];
  outcomes: string[];
  artifacts: Artifact[];
  position: [number, number, number];
  explodeVector: [number, number, number];
  color: string;
  children?: Subsystem[];
}

export interface Project {
  id: string;
  name: string;
  year: number;
  category: 'robotics' | 'vehicles' | 'software' | 'research' | 'other';
  description: string;
  challenge: string;
  solution: string;
  impact: string;
  role: string;
  tools: string[];
  links: {
    github?: string;
    video?: string;
    writeup?: string;
    onshape?: string;
  };
  // Legacy subsystems (manual positioning)
  subsystems: Subsystem[];
  // New: Uploaded 3D model with tagged parts
  cadModel?: CADModel;
  // Uploaded images
  images?: UploadedImage[];
  milestones: Milestone[];
  configurations: Configuration[];
  currentConfiguration: string;
  thumbnail?: string;
  thumbnailFile?: string; // Base64 for uploaded thumbnail
  contentBlocks?: ContentBlock[];
  // Extended project details
  teamSize?: number;
  duration?: string;
  budget?: string;
  skills?: string[];
  lessonsLearned?: string;
  futureWork?: string;
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
}

export type ViewMode = 'assembly' | 'drawing' | 'timeline' | 'results' | 'media';
export type ToolMode = 'select' | 'measure' | 'explode' | 'tutorial';
export type ThemeMode = 'dark' | 'light';

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

interface TutorialStep {
  id: string;
  instruction: string;
  condition: {
    type: 'select' | 'explode' | 'tab' | 'configuration';
    value: string;
  };
  cameraPosition?: [number, number, number];
  completed: boolean;
}

interface PortfolioState {
  // Data
  projects: Project[];
  
  // Selection
  selectedProjectId: string | null;
  selectedSubsystemIds: string[];
  selectedTaggedPartId: string | null;
  hoveredSubsystemId: string | null;
  hoveredTaggedPartId: string | null;
  
  // View state
  viewMode: ViewMode;
  toolMode: ToolMode;
  explodeAmount: number;
  showLabels: boolean;
  
  // Theme
  theme: ThemeMode;
  
  // Admin/Edit mode
  isAuthenticated: boolean;
  editMode: boolean;
  
  // Camera
  cameraState: CameraState;
  
  // Search & filter
  searchQuery: string;
  categoryFilter: string | null;
  
  // Tutorial
  tutorialActive: boolean;
  tutorialSteps: TutorialStep[];
  currentTutorialStep: number;
  
  // UI state - increased defaults for more content
  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  bottomPanelCollapsed: boolean;
  // Min/max for resizing
  leftPanelMinWidth: number;
  leftPanelMaxWidth: number;
  rightPanelMinWidth: number;
  rightPanelMaxWidth: number;
  bottomPanelMinHeight: number;
  bottomPanelMaxHeight: number;
  
  // Command palette
  commandPaletteOpen: boolean;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  selectProject: (projectId: string | null) => void;
  selectSubsystem: (subsystemId: string, multiSelect?: boolean) => void;
  selectTaggedPart: (partId: string | null) => void;
  clearSelection: () => void;
  setHoveredSubsystem: (subsystemId: string | null) => void;
  setHoveredTaggedPart: (partId: string | null) => void;
  
  setViewMode: (mode: ViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setExplodeAmount: (amount: number) => void;
  toggleLabels: () => void;
  
  setCameraState: (state: Partial<CameraState>) => void;
  focusOnSelection: () => void;
  
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
  completeTutorialStep: (stepId: string) => void;
  
  setPanelWidth: (panel: 'left' | 'right', width: number) => void;
  setPanelHeight: (panel: 'bottom', height: number) => void;
  togglePanel: (panel: 'left' | 'right' | 'bottom') => void;
  expandRightPanel: () => void;
  
  toggleCommandPalette: () => void;
  
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  
  // Admin/Edit mode actions
  setAuthenticated: (authenticated: boolean) => void;
  toggleEditMode: () => void;
  logout: () => void;
  
  setConfiguration: (projectId: string, configId: string) => void;
  
  // Project update actions
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addTaggedPart: (projectId: string, part: TaggedPart) => void;
  updateTaggedPart: (projectId: string, partId: string, updates: Partial<TaggedPart>) => void;
  removeTaggedPart: (projectId: string, partId: string) => void;
}

// Helper to find subsystem in nested structure
const findSubsystemById = (subsystems: Subsystem[], id: string): Subsystem | null => {
  for (const subsystem of subsystems) {
    if (subsystem.id === id) return subsystem;
    if (subsystem.children) {
      const found = findSubsystemById(subsystem.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const usePortfolioStore = create<PortfolioState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    projects: [],
    
    selectedProjectId: null,
    selectedSubsystemIds: [],
    selectedTaggedPartId: null,
    hoveredSubsystemId: null,
    hoveredTaggedPartId: null,
    
    viewMode: 'assembly',
    toolMode: 'select',
    explodeAmount: 0,
    showLabels: true,
    
    theme: 'dark',
    
    // Admin/Edit mode
    isAuthenticated: false,
    editMode: false,
    
    cameraState: {
      position: [5, 5, 5],
      target: [0, 0, 0],
    },
    
    searchQuery: '',
    categoryFilter: null,
    
    tutorialActive: false,
    tutorialSteps: [],
    currentTutorialStep: 0,
    
    // Panel sizes - larger defaults for more content
    leftPanelWidth: 300,
    rightPanelWidth: 400,
    bottomPanelHeight: 180,
    leftPanelCollapsed: false,
    rightPanelCollapsed: false,
    bottomPanelCollapsed: false,
    // Min/max bounds for resizing
    leftPanelMinWidth: 200,
    leftPanelMaxWidth: 500,
    rightPanelMinWidth: 300,
    rightPanelMaxWidth: 700,
    bottomPanelMinHeight: 100,
    bottomPanelMaxHeight: 400,
    
    commandPaletteOpen: false,
    
    // Actions
    setProjects: (projects) => set({ projects }),
    
    selectProject: (projectId) => {
      const { rightPanelCollapsed, rightPanelWidth, rightPanelMinWidth } = get();
      // Auto-expand right panel when selecting a project
      set({
        selectedProjectId: projectId,
        selectedSubsystemIds: [],
        selectedTaggedPartId: null,
        explodeAmount: 0,
        // Expand right panel if collapsed, or ensure minimum width
        rightPanelCollapsed: false,
        rightPanelWidth: projectId ? Math.max(rightPanelWidth, 400) : rightPanelWidth,
      });
    },
    
    selectSubsystem: (subsystemId, multiSelect = false) => {
      const { selectedSubsystemIds } = get();
      
      if (multiSelect) {
        const isSelected = selectedSubsystemIds.includes(subsystemId);
        set({
          selectedSubsystemIds: isSelected
            ? selectedSubsystemIds.filter(id => id !== subsystemId)
            : [...selectedSubsystemIds, subsystemId],
        });
      } else {
        set({ selectedSubsystemIds: [subsystemId] });
      }
    },
    
    selectTaggedPart: (partId) => {
      set({ selectedTaggedPartId: partId, selectedSubsystemIds: [] });
    },
    
    clearSelection: () => set({ selectedSubsystemIds: [], selectedTaggedPartId: null }),
    
    setHoveredSubsystem: (subsystemId) => set({ hoveredSubsystemId: subsystemId }),
    
    setHoveredTaggedPart: (partId) => set({ hoveredTaggedPartId: partId }),
    
    setViewMode: (mode) => set({ viewMode: mode }),
    
    setToolMode: (mode) => set({ toolMode: mode }),
    
    setExplodeAmount: (amount) => set({ explodeAmount: Math.max(0, Math.min(1, amount)) }),
    
    toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
    
    setCameraState: (state) => set((prev) => ({
      cameraState: { ...prev.cameraState, ...state },
    })),
    
    focusOnSelection: () => {
      const { selectedSubsystemIds, selectedTaggedPartId, selectedProjectId, projects } = get();
      if (!selectedProjectId) return;
      
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) return;
      
      // Focus on tagged part
      if (selectedTaggedPartId && project.cadModel) {
        const part = project.cadModel.taggedParts.find(p => p.id === selectedTaggedPartId);
        if (part) {
          const [x, y, z] = part.position;
          set({
            cameraState: {
              position: [x + 2, y + 2, z + 2],
              target: [x, y, z],
            },
          });
          return;
        }
      }
      
      if (selectedSubsystemIds.length === 1) {
        const subsystem = findSubsystemById(project.subsystems, selectedSubsystemIds[0]);
        if (subsystem) {
          const [x, y, z] = subsystem.position;
          set({
            cameraState: {
              position: [x + 3, y + 3, z + 3],
              target: [x, y, z],
            },
          });
        }
      }
    },
    
    setSearchQuery: (query) => set({ searchQuery: query }),
    
    setCategoryFilter: (category) => set({ categoryFilter: category }),
    
    startTutorial: () => {
      const { selectedProjectId, projects } = get();
      if (!selectedProjectId) return;
      
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) return;
      
      // Generate tutorial steps based on project
      const steps: TutorialStep[] = [
        {
          id: 'intro',
          instruction: `Welcome to the ${project.name} assembly. Let's explore!`,
          condition: { type: 'select', value: '' },
          completed: false,
        },
        ...project.subsystems.slice(0, 3).map((sub, i) => ({
          id: `select-${sub.id}`,
          instruction: `Select the ${sub.name} subsystem`,
          condition: { type: 'select' as const, value: sub.id },
          cameraPosition: [
            sub.position[0] + 4,
            sub.position[1] + 3,
            sub.position[2] + 4,
          ] as [number, number, number],
          completed: false,
        })),
        {
          id: 'explode',
          instruction: 'Use the explode slider to see all components',
          condition: { type: 'explode', value: '0.5' },
          completed: false,
        },
        {
          id: 'drawing',
          instruction: 'Switch to the Drawing tab',
          condition: { type: 'tab', value: 'drawing' },
          completed: false,
        },
      ];
      
      set({
        tutorialActive: true,
        tutorialSteps: steps,
        currentTutorialStep: 0,
      });
    },
    
    nextTutorialStep: () => {
      const { currentTutorialStep, tutorialSteps } = get();
      if (currentTutorialStep < tutorialSteps.length - 1) {
        set({ currentTutorialStep: currentTutorialStep + 1 });
      } else {
        set({ tutorialActive: false, currentTutorialStep: 0 });
      }
    },
    
    endTutorial: () => set({ tutorialActive: false, currentTutorialStep: 0 }),
    
    completeTutorialStep: (stepId) => {
      const { tutorialSteps } = get();
      set({
        tutorialSteps: tutorialSteps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        ),
      });
    },
    
    setPanelWidth: (panel, width) => {
      const state = get();
      if (panel === 'left') {
        set({ leftPanelWidth: Math.max(state.leftPanelMinWidth, Math.min(state.leftPanelMaxWidth, width)) });
      }
      if (panel === 'right') {
        set({ rightPanelWidth: Math.max(state.rightPanelMinWidth, Math.min(state.rightPanelMaxWidth, width)) });
      }
    },
    
    setPanelHeight: (panel, height) => {
      if (panel === 'bottom') set({ bottomPanelHeight: Math.max(100, Math.min(300, height)) });
    },
    
    togglePanel: (panel) => {
      if (panel === 'left') set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed }));
      if (panel === 'right') set((s) => ({ rightPanelCollapsed: !s.rightPanelCollapsed }));
      if (panel === 'bottom') set((s) => ({ bottomPanelCollapsed: !s.bottomPanelCollapsed }));
    },
    
    expandRightPanel: () => {
      const state = get();
      set({ 
        rightPanelCollapsed: false, 
        rightPanelWidth: Math.max(state.rightPanelWidth, 400)
      });
    },
    
    updateProject: (projectId, updates) => {
      const { projects } = get();
      set({
        projects: projects.map(p =>
          p.id === projectId ? { ...p, ...updates } : p
        ),
      });
    },
    
    addTaggedPart: (projectId, part) => {
      const { projects } = get();
      set({
        projects: projects.map(p => {
          if (p.id === projectId && p.cadModel) {
            return {
              ...p,
              cadModel: {
                ...p.cadModel,
                taggedParts: [...(p.cadModel.taggedParts || []), part],
              },
            };
          }
          return p;
        }),
      });
    },
    
    updateTaggedPart: (projectId, partId, updates) => {
      const { projects } = get();
      set({
        projects: projects.map(p => {
          if (p.id === projectId && p.cadModel) {
            return {
              ...p,
              cadModel: {
                ...p.cadModel,
                taggedParts: p.cadModel.taggedParts.map(part =>
                  part.id === partId ? { ...part, ...updates } : part
                ),
              },
            };
          }
          return p;
        }),
      });
    },
    
    removeTaggedPart: (projectId, partId) => {
      const { projects } = get();
      set({
        projects: projects.map(p => {
          if (p.id === projectId && p.cadModel) {
            return {
              ...p,
              cadModel: {
                ...p.cadModel,
                taggedParts: p.cadModel.taggedParts.filter(part => part.id !== partId),
              },
            };
          }
          return p;
        }),
      });
    },
    
    toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
    
    toggleTheme: () => {
      const { theme } = get();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      set({ theme: newTheme });
      // Update document class for CSS
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
        localStorage.setItem('portfoliocad-theme', newTheme);
      }
    },
    
    setTheme: (theme) => {
      set({ theme });
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
        localStorage.setItem('portfoliocad-theme', theme);
      }
    },
    
    setConfiguration: (projectId, configId) => {
      const { projects } = get();
      set({
        projects: projects.map(p =>
          p.id === projectId ? { ...p, currentConfiguration: configId } : p
        ),
      });
    },
    
    // Admin/Edit mode actions
    setAuthenticated: (authenticated) => {
      set({ isAuthenticated: authenticated });
      if (authenticated && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('admin-auth', 'true');
      }
    },
    
    toggleEditMode: () => {
      const { isAuthenticated, editMode } = get();
      if (isAuthenticated) {
        set({ editMode: !editMode });
      }
    },
    
    logout: () => {
      set({ isAuthenticated: false, editMode: false });
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('admin-auth');
      }
    },
  }))
);

// Keyboard shortcuts handler
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    const store = usePortfolioStore.getState();
    
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    
    // F - Focus on selection
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      store.focusOnSelection();
    }
    
    // E - Toggle explode mode
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      store.setToolMode(store.toolMode === 'explode' ? 'select' : 'explode');
    }
    
    // M - Measure mode
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      store.setToolMode(store.toolMode === 'measure' ? 'select' : 'measure');
    }
    
    // L - Toggle labels
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      store.toggleLabels();
    }
    
    // Escape - Clear selection or close panels
    if (e.key === 'Escape') {
      if (store.commandPaletteOpen) {
        store.toggleCommandPalette();
      } else if (store.tutorialActive) {
        store.endTutorial();
      } else {
        store.clearSelection();
      }
    }
    
    // Ctrl/Cmd + P - Command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      store.toggleCommandPalette();
    }
    
    // Number keys 1-5 for view modes
    const viewModes: ViewMode[] = ['assembly', 'drawing', 'timeline', 'results', 'media'];
    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      store.setViewMode(viewModes[parseInt(e.key) - 1]);
    }
  });
}
