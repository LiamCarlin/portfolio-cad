import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  imageWidth?: number; // Width in pixels or percentage
  imageHeight?: number; // Height in pixels
  imageSizeUnit?: 'px' | '%' | 'auto'; // Unit for image size
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

// Subsystem in a project assembly
export interface Subsystem {
  id: string;
  name: string;
  description: string;
  role: string;
  tools: string[];
  outcomes: string[];
  // 3D position in assembly
  position: [number, number, number];
  // Optional exploded view offset and color styling
  explodeVector?: [number, number, number];
  color?: string;
  // Optional artifacts associated with the subsystem
  artifacts?: Artifact[];
  // Optional annotations attached to subsystem
  cadAnnotations?: CADAnnotation[];
  // Child subsystems
  children?: Subsystem[];
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

// Shape types for 3D annotations
export type AnnotationShape = 'sphere' | 'cube' | 'cylinder' | 'cone' | 'ring' | 'arrow';

// Dimensions for different shapes
export interface AnnotationDimensions {
  // For cube/box: width (x), height (y), depth (z)
  width?: number;
  height?: number;
  depth?: number;
  // For sphere: radius
  radius?: number;
  // For cylinder/cone: radius and height
  radiusTop?: number;
  radiusBottom?: number;
  // For ring/torus: ring radius and tube radius
  ringRadius?: number;
  tubeRadius?: number;
}

// 3D Annotation marker - placed directly on model surface via raycasting
export interface CADAnnotation {
  id: string;
  // 3D world position on the model surface
  position: [number, number, number];
  // Rotation in radians [x, y, z]
  rotation: [number, number, number];
  // Surface normal at this point (for orienting labels/markers)
  normal: [number, number, number];
  // Optional: name of the mesh that was hit
  meshName?: string;
  // Shape of the marker
  shape: AnnotationShape;
  // Optional dimensions or size for rendering
  dimensions?: AnnotationDimensions;
  size?: number;
  color?: string;
  label?: string;
  cadAnnotations?: CADAnnotation[];
  // Mesh selections captured from volume-based marking
  selectedMeshNames?: string[];
  selectedMeshIndices?: number[];
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
  iconKey?: string;
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
    type: 'select' | 'explode' | 'configuration';
    value: string;
  };
  cameraPosition?: [number, number, number];
  completed: boolean;
}

export interface SocialLink {
  id: string;
  platform: 'github' | 'linkedin' | 'email' | 'twitter' | 'discord' | 'instagram' | 'youtube' | 'website' | 'phone';
  url: string;
  label?: string;
  icon?: string; // Base64 or blob URL for custom icon image
}

export interface WelcomePageData {
  // Personal info
  name: string;
  title: string;
  school: string;
  bio: string;
  
  // Social links
  socialLinks: SocialLink[];
  
  // Banner
  bannerImageId?: string; // ID reference to image stored in IndexedDB (not base64 to avoid localStorage quota)
  bannerImageUrl?: string; // Public URL for exported static site
  bannerDarkness: number; // 0-100, percentage of darkness overlay on banner image
  
  // Profile picture
  profileImageId?: string; // ID reference to profile image in IndexedDB
  profileImageUrl?: string; // Public URL for exported static site
  
  // About section
  aboutTitle: string;
  aboutContent: string;
}

// Professional experience entries (internships, jobs, roles)
export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  startDate?: string; // ISO or human-readable
  endDate?: string;   // undefined means present
  location?: string;
  description?: string;
  link?: string;
  // Company/organization logo
  logoFile?: string; // Base64 data URL (admin/local editing)
  logoUrl?: string;  // Public URL for exported site (under public/uploads)
}

interface PortfolioState {
  // Data
  projects: Project[];
  welcomePageData: WelcomePageData;
  experienceEntries: ExperienceEntry[];
  
  // Selection
  selectedProjectId: string | null;
  selectedSubsystemIds: string[];
  selectedTaggedPartId: string | null;
  hoveredSubsystemId: string | null;
  hoveredTaggedPartId: string | null;
  showProjectOverview: boolean; // Show project overview/content in inspector
  
  // View state
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
  // Hydration flag for persisted store
  hasHydrated: boolean;
  // Min/max for resizing
  leftPanelMinWidth: number;
  leftPanelMaxWidth: number;
  rightPanelMinWidth: number;
  rightPanelMaxWidth: number;
  bottomPanelMinHeight: number;
  bottomPanelMaxHeight: number;
  
  // Command palette
  commandPaletteOpen: boolean;
  
  // Home page
  showHome: boolean;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  selectProject: (projectId: string | null) => void;
  selectSubsystem: (subsystemId: string, multiSelect?: boolean) => void;
  selectTaggedPart: (partId: string | null) => void;
  clearSelection: () => void;
  setHoveredSubsystem: (subsystemId: string | null) => void;
  setHoveredTaggedPart: (partId: string | null) => void;
  setShowProjectOverview: (show: boolean) => void;
  
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

  // Hydration
  setHasHydrated: (hydrated: boolean) => void;
  
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  
  // Home page
  setShowHome: (show: boolean) => void;
  
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
  
  // Welcome page actions
  updateWelcomePageData: (updates: Partial<WelcomePageData>) => void;
  setBannerImageId: (imageId: string | undefined) => void;
  setProfileImageId: (imageId: string | undefined) => void;
  // Experience actions
  setExperienceEntries: (items: ExperienceEntry[]) => void;
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
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      experienceEntries: [],
      
      selectedProjectId: null,
      selectedSubsystemIds: [],
      selectedTaggedPartId: null,
      hoveredSubsystemId: null,
      hoveredTaggedPartId: null,
      showProjectOverview: false, // Default to CAD view (3D Model tab)
      
      toolMode: 'select',
      explodeAmount: 0,
      showLabels: true,
      
      // Initialize theme from localStorage if available (prevents hydration mismatch)
      theme: (typeof window !== 'undefined' && localStorage?.getItem?.('portfoliocad-store')
        ? (() => {
            try {
              const stored = JSON.parse(localStorage.getItem('portfoliocad-store') || '{}');
              const state = stored.state || {};
              return state.theme || 'dark';
            } catch {
              return 'dark';
            }
          })()
        : 'dark'),
      
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
      // Min/max bounds for resizing - expanded for better content viewing
      leftPanelMinWidth: 200,
      leftPanelMaxWidth: 1200,
      rightPanelMinWidth: 300,
      rightPanelMaxWidth: 1400,
      bottomPanelMinHeight: 100,
      bottomPanelMaxHeight: 800,
      hasHydrated: false,
      
      commandPaletteOpen: false,
      
      // Welcome page data
      welcomePageData: {
        name: 'Liam Carlin',
        title: 'Mechanical Engineering Student',
        school: 'Olin College of Engineering',
        bio: 'Passionate about robotics, mechanical design, and building things that move. I love tackling complex engineering challenges and turning ideas into reality through CAD, prototyping, and iteration.',
        socialLinks: [
          { id: '1', platform: 'email', url: 'lcarlin@olin.edu', label: 'Email' },
          { id: '2', platform: 'linkedin', url: 'https://linkedin.com/in/liamzcarlin', label: 'LinkedIn' },
          { id: '3', platform: 'github', url: 'https://github.com/liamcarlin', label: 'GitHub' },
        ],
        bannerImageUrl: undefined,
        profileImageId: undefined,
        profileImageUrl: undefined,
        bannerDarkness: 30, // Default 30% darkness for better text readability
        aboutTitle: 'About This Portfolio',
        aboutContent: 'I built this interactive portfolio to showcase my engineering work in a way that goes beyond traditional resumes and static images. Each project features fully interactive 3D CAD models that you can explore, rotate, and examine in detail—just like reviewing actual designs in a professional CAD environment.',
      },
      
      // Home page - show home by default
      showHome: true,
      
      // Actions
      setProjects: (projects) => set({ projects }),
      setExperienceEntries: (items) => set({ experienceEntries: items }),
      
      selectProject: (projectId) => {
        const { rightPanelWidth } = get();
        // Auto-expand right panel when selecting a project
        set({
          selectedProjectId: projectId,
          selectedSubsystemIds: [],
          selectedTaggedPartId: null,
          showProjectOverview: false, // Default to CAD view (3D Model tab)
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
            showProjectOverview: false, // Hide overview when selecting subsystem
          });
        } else {
          set({ selectedSubsystemIds: [subsystemId], showProjectOverview: false });
        }
      },
      
      selectTaggedPart: (partId) => {
        set({ selectedTaggedPartId: partId, selectedSubsystemIds: [] });
      },
      
      clearSelection: () => set({ selectedSubsystemIds: [], selectedTaggedPartId: null }),
      
      setHoveredSubsystem: (subsystemId) => set({ hoveredSubsystemId: subsystemId }),
      
      setHoveredTaggedPart: (partId) => set({ hoveredTaggedPartId: partId }),
      
      setShowProjectOverview: (show) => set({ showProjectOverview: show, selectedSubsystemIds: show ? [] : get().selectedSubsystemIds }),
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
        const state = get();
        if (panel === 'bottom') {
          set({ bottomPanelHeight: Math.max(state.bottomPanelMinHeight, Math.min(state.bottomPanelMaxHeight, height)) });
        }
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
      
      updateWelcomePageData: (updates) => {
        set((state) => ({
          welcomePageData: {
            ...state.welcomePageData,
            ...updates,
          },
        }));
      },
      
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      
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
      
      setShowHome: (show) => set({ showHome: show }),
      
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
      
      setBannerImageId: (imageId: string | undefined) => {
        set((state) => ({
          welcomePageData: {
            ...state.welcomePageData,
            bannerImageId: imageId,
          },
        }));
      },

      setProfileImageId: (imageId: string | undefined) => {
        set((state) => ({
          welcomePageData: {
            ...state.welcomePageData,
            profileImageId: imageId,
          },
        }));
      },
    }),
    {
      name: 'portfoliocad-store',
      version: 4,
      partialize: (state) => ({
        // Only persist theme - welcomePageData and projects come from files
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PortfolioState> | undefined;
        const current = currentState as PortfolioState;
        if (!persisted) return current;
        return {
          ...current,
          theme: persisted.theme ?? current.theme,
        } as PortfolioState;
      },
      migrate: (persisted: unknown, version: number): any => {
        // Version 4: Stop persisting welcomePageData - comes from files only
        if (version < 4) {
          const state = persisted as any;
          return {
            // Default to dark mode for legacy persisted data
            theme: state?.theme ?? 'dark',
          };
        }
        return persisted;
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          usePortfolioStore.getState().setHasHydrated(true);
        }
      },
    }
  )
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
    
  });
}
