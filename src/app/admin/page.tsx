'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Box,
  Edit2,
  Copy,
  ArrowLeft,
  Check,
  X,
  Folder,
  FileJson,
  AlertCircle,
  Lock,
  Image,
  Type,
  Save,
  List,
  Link2,
  Quote,
  GripVertical,
  Boxes,
  Tag,
  FileText,
} from 'lucide-react';
import { Project, Milestone, ContentBlock, TaggedPart, Subsystem, UploadedImage, usePortfolioStore } from '@/store/usePortfolioStore';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FileUpload, MultiImageUpload, ImagePreview } from '@/components/admin/FileUpload';
import { sampleProjects } from '@/data/sampleProjects';
import { getImageDataUrl } from '@/lib/imageStorage';

// Dynamically import CAD viewer to avoid SSR issues
const CADModelViewer = dynamic(
  () => import('@/components/admin/CADModelViewer').then(mod => mod.CADModelViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading 3D viewer...</div>
      </div>
    )
  }
);

// Dynamically import Subsystem CAD Annotator
const SubsystemCADAnnotator = dynamic(
  () => import('@/components/admin/SubsystemCADAnnotator'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading annotation tool...</div>
      </div>
    )
  }
);

// Dynamically import WelcomePageEditor
const WelcomePageEditorDynamic = dynamic(
  () => import('@/components/admin/WelcomePageEditor').then(mod => mod.WelcomePageEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading welcome page editor...</div>
      </div>
    )
  }
);

// Wrapper component for WelcomePageEditor to use as a tab
function WelcomePageEditorTab() {
  return <WelcomePageEditorDynamic />;
}

// Admin password - in production, use environment variables and proper auth
const ADMIN_PASSWORD = 'admin123'; // Change this!

// Content block types
const CONTENT_BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'heading', label: 'Heading', icon: FileText },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'gallery', label: 'Gallery', icon: Image },
  { type: 'list', label: 'List', icon: List },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'link', label: 'Link Card', icon: Link2 },
] as const;

const createEmptyContentBlock = (type: ContentBlock['type']): ContentBlock => ({
  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  content: '',
  ...(type === 'gallery' ? { images: [] } : {}),
  ...(type === 'list' ? { items: [] } : {}),
  ...(type === 'link' ? { url: '', title: '' } : {}),
  ...(type === 'heading' ? { level: 2 } : {}),
});

// Default empty project template
const createEmptyProject = (): Project => ({
  id: `project-${Date.now()}`,
  name: 'New Project',
  year: new Date().getFullYear(),
  category: 'other',
  description: '',
  challenge: '',
  solution: '',
  impact: '',
  role: '',
  tools: [],
  links: {},
  subsystems: [],
  milestones: [],
  configurations: [{ id: 'default', name: 'Default', description: 'Default configuration' }],
  currentConfiguration: 'default',
  contentBlocks: [],
  thumbnail: '',
  // New fields
  cadModel: undefined,
  images: [],
  teamSize: undefined,
  duration: undefined,
  skills: [],
});

const createEmptySubsystem = (): Subsystem => ({
  id: `subsystem-${Date.now()}`,
  name: 'New Component',
  description: '',
  role: '',
  tools: [],
  outcomes: [],
  artifacts: [],
  position: [0, 0, 0],
  explodeVector: [0, 0.5, 0],
  color: '#4a5568',
});

const createEmptyMilestone = (): Milestone => ({
  id: `milestone-${Date.now()}`,
  name: 'New Milestone',
  date: new Date().toISOString().split('T')[0],
  description: '',
  completed: false,
});

// Password Gate Component
function PasswordGate({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      // Store auth in session
      sessionStorage.setItem('admin-auth', 'true');
      onAuthenticate();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-2">Enter password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Access Admin Panel
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'cad' | 'images' | 'subsystems' | 'milestones' | 'export'>('details');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'welcome' | 'projects'>('projects');
  const { theme, welcomePageData } = usePortfolioStore();
  const lightMode = theme === 'light';

  // Get updateWelcomePageData from store for reloading after save
  const updateWelcomePageData = usePortfolioStore((state) => state.updateWelcomePageData);

  // Check for existing auth on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load projects and welcome data: prefer saved siteData.json, then localStorage, then samples
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      let allProjects: Project[] = [...sampleProjects];
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      let loadedFromFile = false;

      // 1) Try to load from generated siteData.json (latest saved/exported data)
      try {
        const res = await fetch(`${basePath}/data/siteData.json`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.projects) && json.projects.length > 0) {
            allProjects = json.projects;
            loadedFromFile = true;
          }
          if (json.welcomePageData) {
            updateWelcomePageData(json.welcomePageData);
          }
        }
      } catch (e) {
        console.warn('Could not load site data file in admin:', e);
      }

      // 2) If no file data, fall back to any local edits from localStorage (draft mode)
      if (!loadedFromFile) {
        const saved = localStorage.getItem('portfoliocad-projects');
        if (saved) {
          try {
            const savedProjects: Project[] = JSON.parse(saved);
            if (Array.isArray(savedProjects) && savedProjects.length > 0) {
              const savedIds = new Set(savedProjects.map(p => p.id));
              const newSampleProjects = sampleProjects.filter(sp => !savedIds.has(sp.id));
              allProjects = [...savedProjects, ...newSampleProjects];
            }
          } catch (e) {
            console.error('Failed to load projects from localStorage:', e);
          }
        }
      }

      if (cancelled) return;
      setProjects(allProjects);
      if (allProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(allProjects[0].id);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, updateWelcomePageData]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    if (projects.length > 0) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        try {
          const jsonData = JSON.stringify(projects);
          // Check if data is too large (localStorage typically has 5-10MB limit)
          const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
          if (sizeInMB > 4.5) {
            console.warn(`Data size: ${sizeInMB.toFixed(2)}MB - may exceed localStorage limits`);
            showNotification('error', `Warning: Data size (${sizeInMB.toFixed(1)}MB) is large. Some browsers may not save.`);
          }
          localStorage.setItem('portfoliocad-projects', jsonData);
          setSaveStatus('saved');
        } catch (e: any) {
          console.error('Failed to save projects:', e);
          setSaveStatus('unsaved');
          if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
            showNotification('error', 'Storage full! Try removing some images or CAD files.');
          } else {
            showNotification('error', 'Failed to save changes.');
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projects, isAuthenticated]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Show password gate if not authenticated
  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const addProject = () => {
    const newProject = createEmptyProject();
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject.id);
    setSaveStatus('unsaved');
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
      setSaveStatus('unsaved');
    }
  };

  const saveToFiles = async () => {
    setSaveStatus('saving');
    try {
      let bannerImageData: string | undefined;
      if (welcomePageData.bannerImageId) {
        try {
          const dataUrl = await getImageDataUrl(welcomePageData.bannerImageId);
          bannerImageData = dataUrl || undefined;
        } catch (e) {
          console.warn('Could not load banner image from storage', e);
        }
      }

      let profileImageData: string | undefined;
      if (welcomePageData.profileImageId) {
        try {
          const dataUrl = await getImageDataUrl(welcomePageData.profileImageId);
          profileImageData = dataUrl || undefined;
        } catch (e) {
          console.warn('Could not load profile image from storage', e);
        }
      }

      const res = await fetch('/api/save-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects, welcomePageData, bannerImageData, profileImageData }),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      showNotification('success', 'Saved to data files. Commit & push to publish.');

      // Reload data from the server to reflect saved changes immediately
      setTimeout(async () => {
        try {
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
          const dataRes = await fetch(`${basePath}/data/siteData.json`, { cache: 'no-store' });
          if (dataRes.ok) {
            const json = await dataRes.json();
            if (json.projects && Array.isArray(json.projects)) {
              setProjects(json.projects);
            }
            if (json.welcomePageData) {
              updateWelcomePageData(json.welcomePageData);
            }
          }
        } catch (e) {
          console.warn('Could not reload data after save:', e);
        }
      }, 100);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed', err);
      showNotification('error', 'Save to files failed');
      setSaveStatus('unsaved');
    }
  };

  const duplicateProject = (project: Project) => {
    const newProject = {
      ...JSON.parse(JSON.stringify(project)),
      id: `project-${Date.now()}`,
      name: `${project.name} (Copy)`,
    };
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject.id);
    setSaveStatus('unsaved');
  };

  const updateProject = (updates: Partial<Project>) => {
    if (!selectedProjectId) return;
    setProjects(projects.map(p => 
      p.id === selectedProjectId ? { ...p, ...updates } : p
    ));
    setSaveStatus('unsaved');
  };

  const exportProjects = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfoliocad-projects.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Projects exported successfully!');
  };

  const exportAsCode = () => {
    const code = `import { Project } from '@/store/usePortfolioStore';

export const sampleProjects: Project[] = ${JSON.stringify(projects, null, 2)};
`;
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sampleProjects.ts';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Code exported! Replace src/data/sampleProjects.ts with this file.');
  };

  const importProjects = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setProjects(imported);
          showNotification('success', `Imported ${imported.length} projects!`);
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        showNotification('error', 'Failed to import: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`min-h-screen ${lightMode ? 'bg-white text-gray-900' : 'bg-gray-950 text-white'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className={`${lightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-gray-700'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className={`flex items-center gap-2 ${lightMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} transition-colors`}
            >
              <ArrowLeft size={20} />
              Back to Portfolio
            </Link>
            <div className={`h-6 w-px ${lightMode ? 'bg-gray-200' : 'bg-gray-700'}`} />
            <h1 className="text-xl font-bold">PortfolioCAD Admin</h1>
            <span className={`text-xs px-2 py-1 rounded ${
              saveStatus === 'saved' ? 'bg-green-600/20 text-green-400' :
              saveStatus === 'saving' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-orange-600/20 text-orange-400'
            }`}>
              {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : '● Unsaved'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-2 px-4 py-2 ${lightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white'} rounded-lg cursor-pointer transition-colors`}>
              <Upload size={18} />
              Import
              <input type="file" accept=".json" onChange={importProjects} className="hidden" />
            </label>
            <button
              onClick={exportProjects}
              className={`flex items-center gap-2 px-4 py-2 ${lightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700'} rounded-lg transition-colors`}
            >
              <Download size={18} />
              Export JSON
            </button>
            <button
              onClick={exportAsCode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <FileJson size={18} />
              Export as Code
            </button>
            <button
              onClick={saveToFiles}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-white"
            >
              <Save size={18} />
              Save to Files
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Navigation and Project list */}
        <aside className={`w-80 ${lightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-gray-700'} border-r flex flex-col`}>
          <div className={`p-4 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'} space-y-2`}>
            {/* Welcome Page Button */}
            <button
              onClick={() => setViewMode('welcome')}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                viewMode === 'welcome'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : lightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              <Edit2 size={18} />
              Welcome Page
            </button>
            
            {/* Projects Section Button */}
            <button
              onClick={() => setViewMode('projects')}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                viewMode === 'projects'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : lightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              <Plus size={18} />
              Projects
            </button>
          </div>
          
          {/* Projects List - Only show when in projects view */}
          {viewMode === 'projects' && (
            <>
              <div className={`p-4 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'}`}>
                <button
                  onClick={addProject}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white"
                >
                  <Plus size={18} />
                  New Project
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {projects.length === 0 ? (
                  <div className={`text-center ${lightMode ? 'text-gray-400' : 'text-gray-500'} py-8`}>
                    <Folder size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No projects yet</p>
                    <p className="text-sm">Click "New Project" to start</p>
                  </div>
                ) : (
                  projects.map(project => (
                    <div
                      key={project.id}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                        selectedProjectId === project.id
                          ? 'bg-blue-600 text-white'
                          : lightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Box size={18} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{project.name}</div>
                          <div className={`text-xs ${selectedProjectId === project.id ? 'text-gray-300' : lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{project.year} • {project.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateProject(project); }}
                          className={`p-1 rounded transition-colors ${selectedProjectId === project.id ? 'hover:bg-blue-700' : lightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                          className={`p-1 rounded transition-colors ${selectedProjectId === project.id ? 'hover:bg-red-700' : 'hover:bg-red-600'}`}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Welcome Page Editor - Only show when in welcome view */}
            {viewMode === 'welcome' && (
              <div className="mb-12">
                <div className="mb-4">
                  <h2 className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'} mb-2`}>Welcome Page Settings</h2>
                  <p className={lightMode ? 'text-gray-600' : 'text-gray-400'}>Edit your portfolio banner, social links, and personal information</p>
                </div>
                <div className={`rounded-lg border p-6 ${lightMode ? 'border-gray-300 bg-gray-100' : 'border-gray-700 bg-gray-900/50'}`}>
                  <WelcomePageEditorTab />
                </div>
              </div>
            )}

            {/* Projects Section - Only show when in projects view */}
            {viewMode === 'projects' && (
            <div>
              <div className="mb-4">
                <h2 className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'} mb-2`}>Project Management</h2>
                <p className={lightMode ? 'text-gray-600' : 'text-gray-400'}>Manage and edit your portfolio projects</p>
              </div>

              {/* Tabs */}
              <div className={`flex items-center gap-1 mb-6 border-b ${lightMode ? 'border-gray-300' : 'border-gray-700'} overflow-x-auto`}>
                {(['details', 'content', 'cad', 'images', 'subsystems', 'milestones', 'export'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab as any);
                      if (selectedProject === null) {
                        setSelectedProjectId(projects[0]?.id || null);
                      }
                    }}
                    className={`px-4 py-2 capitalize transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab
                        ? `text-blue-500 border-b-2 border-blue-500 ${lightMode ? 'text-blue-600' : ''}`
                        : lightMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'cad' && <Boxes size={16} />}
                    {tab === 'images' && <Image size={16} />}
                    {tab === 'cad' ? '3D Model' : tab}
                  </button>
                ))}
              </div>

              {selectedProject && (
                <>
                  {activeTab === 'details' && (
                    <ProjectDetailsForm project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'content' && (
                    <ContentBlocksEditor project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'cad' && (
                    <CADModelEditor project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'images' && (
                    <ImagesEditor project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'subsystems' && (
                    <SubsystemsEditor project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'milestones' && (
                    <MilestonesEditor project={selectedProject} onUpdate={updateProject} lightMode={lightMode} />
                  )}
                  {activeTab === 'export' && (
                    <ExportPreview project={selectedProject} lightMode={lightMode} />
                  )}
                </>
              )}
              {!selectedProject && (
                <div className={`flex items-center justify-center h-96 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <Box size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Select a project to edit</p>
                    <p className="text-sm">or create a new one</p>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Project Details Form
function ProjectDetailsForm({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const [toolInput, setToolInput] = useState('');
  
  // Theme-aware styling
  const labelClass = lightMode ? 'text-gray-700' : 'text-gray-400';
  const inputClass = lightMode 
    ? 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500' 
    : 'bg-gray-800 border border-gray-700 text-white focus:border-blue-500';
  const tagBgClass = lightMode ? 'bg-gray-200' : 'bg-gray-800';
  const buttonSecondaryClass = lightMode 
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' 
    : 'bg-gray-700 hover:bg-gray-600 text-white';

  const addTool = () => {
    if (toolInput.trim()) {
      onUpdate({ tools: [...project.tools, toolInput.trim()] });
      setToolInput('');
    }
  };

  const removeTool = (index: number) => {
    onUpdate({ tools: project.tools.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm ${labelClass} mb-1`}>Project Name *</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className={`w-full rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${labelClass} mb-1`}>Year</label>
            <input
              type="number"
              value={project.year}
              onChange={(e) => onUpdate({ year: parseInt(e.target.value) })}
              className={`w-full rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-sm ${labelClass} mb-1`}>Category</label>
            <select
              value={project.category}
              onChange={(e) => onUpdate({ category: e.target.value as Project['category'] })}
              className={`w-full rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
            >
              <option value="robotics">Robotics</option>
              <option value="vehicles">Vehicles</option>
              <option value="software">Software</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className={`block text-sm ${labelClass} mb-1`}>Your Role</label>
        <input
          type="text"
          value={project.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          placeholder="e.g., Lead Engineer, Software Developer"
          className={`w-full rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
        />
      </div>

      <div>
        <label className={`block text-sm ${labelClass} mb-1`}>Description</label>
        <textarea
          value={project.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          placeholder="Brief overview of the project..."
          className={`w-full rounded-lg px-3 py-2 focus:outline-none resize-none ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={`block text-sm ${labelClass} mb-1`}>Challenge</label>
          <textarea
            value={project.challenge}
            onChange={(e) => onUpdate({ challenge: e.target.value })}
            rows={2}
            placeholder="What problem did you solve?"
            className={`w-full rounded-lg px-3 py-2 focus:outline-none resize-none ${inputClass}`}
          />
        </div>
        <div>
          <label className={`block text-sm ${labelClass} mb-1`}>Solution</label>
          <textarea
            value={project.solution}
            onChange={(e) => onUpdate({ solution: e.target.value })}
            rows={2}
            placeholder="How did you solve it?"
            className={`w-full rounded-lg px-3 py-2 focus:outline-none resize-none ${inputClass}`}
          />
        </div>
        <div>
          <label className={`block text-sm ${labelClass} mb-1`}>Impact</label>
          <textarea
            value={project.impact}
            onChange={(e) => onUpdate({ impact: e.target.value })}
            rows={2}
            placeholder="What were the results?"
            className={`w-full rounded-lg px-3 py-2 focus:outline-none resize-none ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm ${labelClass} mb-1`}>Tools & Technologies</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tools.map((tool, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${tagBgClass}`}
            >
              {tool}
              <button onClick={() => removeTool(i)} className={`${lightMode ? 'text-gray-600 hover:text-red-600' : 'text-gray-500 hover:text-red-400'}`}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTool()}
            placeholder="Add a tool..."
            className={`flex-1 rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
          />
          <button
            onClick={addTool}
            className={`px-4 py-2 rounded-lg transition-colors ${buttonSecondaryClass}`}
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className={`block text-sm ${labelClass} mb-2`}>Links</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs ${lightMode ? 'text-gray-600' : 'text-gray-500'} mb-1`}>GitHub</label>
            <input
              type="url"
              value={project.links.github || ''}
              onChange={(e) => onUpdate({ links: { ...project.links, github: e.target.value || undefined } })}
              placeholder="https://github.com/..."
              className={`w-full rounded-lg px-3 py-2 focus:outline-none text-sm ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-xs ${lightMode ? 'text-gray-600' : 'text-gray-500'} mb-1`}>Video</label>
            <input
              type="url"
              value={project.links.video || ''}
              onChange={(e) => onUpdate({ links: { ...project.links, video: e.target.value || undefined } })}
              placeholder="https://youtube.com/..."
              className={`w-full rounded-lg px-3 py-2 focus:outline-none text-sm ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-xs ${lightMode ? 'text-gray-600' : 'text-gray-500'} mb-1`}>CAD Document (Onshape)</label>
            <input
              type="url"
              value={project.links.onshape || ''}
              onChange={(e) => onUpdate({ links: { ...project.links, onshape: e.target.value || undefined } })}
              placeholder="https://onshape.com/..."
              className={`w-full rounded-lg px-3 py-2 focus:outline-none text-sm ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-xs ${lightMode ? 'text-gray-600' : 'text-gray-500'} mb-1`}>Writeup / Documentation</label>
            <input
              type="url"
              value={project.links.writeup || ''}
              onChange={(e) => onUpdate({ links: { ...project.links, writeup: e.target.value || undefined } })}
              placeholder="https://..."
              className={`w-full rounded-lg px-3 py-2 focus:outline-none text-sm ${inputClass}`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={`block text-sm ${labelClass} mb-1`}>Thumbnail Image URL</label>
        <input
          type="url"
          value={project.thumbnail || ''}
          onChange={(e) => onUpdate({ thumbnail: e.target.value || undefined })}
          placeholder="https://example.com/image.jpg"
          className={`w-full rounded-lg px-3 py-2 focus:outline-none ${inputClass}`}
        />
        {project.thumbnail && (
          <div className="mt-2">
            <img 
              src={project.thumbnail} 
              alt="Thumbnail preview" 
              className={`w-32 h-24 object-cover rounded border ${lightMode ? 'border-gray-300' : 'border-gray-700'}`}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Content Blocks Editor - Flexible content sections
function ContentBlocksEditor({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const blocks = project.contentBlocks || [];

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock = createEmptyContentBlock(type);
    onUpdate({ contentBlocks: [...blocks, newBlock] });
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onUpdate({
      contentBlocks: blocks.map(b => b.id === id ? { ...b, ...updates } : b),
    });
  };

  const deleteBlock = (id: string) => {
    onUpdate({ contentBlocks: blocks.filter(b => b.id !== id) });
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    onUpdate({ contentBlocks: newBlocks });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Custom Content Blocks</h3>
          <p className="text-gray-400 text-sm">Add flexible content sections to your project</p>
        </div>
      </div>

      {/* Add block buttons */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => addBlock(type as ContentBlock['type'])}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content blocks */}
      {blocks.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg border border-dashed border-gray-700">
          <FileText size={48} className="mx-auto mb-2 opacity-30" />
          <p>No content blocks yet</p>
          <p className="text-sm">Add blocks above to create custom content sections</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <ContentBlockItem
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
              onMove={(dir) => moveBlock(block.id, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentBlockItem({
  block,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const [listInput, setListInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  const addListItem = () => {
    if (listInput.trim() && block.items) {
      onUpdate({ items: [...block.items, listInput.trim()] });
      setListInput('');
    }
  };

  const addGalleryImage = () => {
    if (imageInput.trim() && block.images) {
      onUpdate({ images: [...block.images, imageInput.trim()] });
      setImageInput('');
    }
  };

  const BlockIcon = CONTENT_BLOCK_TYPES.find(t => t.type === block.type)?.icon || Type;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-gray-500" />
          <BlockIcon size={16} className="text-blue-400" />
          <span className="font-medium capitalize">{block.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronDown size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-600 rounded ml-2"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Heading block */}
        {block.type === 'heading' && (
          <>
            <div className="flex gap-3">
              <select
                value={block.level || 2}
                onChange={(e) => onUpdate({ level: parseInt(e.target.value) as 1 | 2 | 3 })}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              >
                <option value={1}>H1 - Large</option>
                <option value={2}>H2 - Medium</option>
                <option value={3}>H3 - Small</option>
              </select>
              <input
                type="text"
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Heading text..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Text block */}
        {block.type === 'text' && (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter your text content... Supports multiple paragraphs."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
          />
        )}

        {/* Quote block */}
        {block.type === 'quote' && (
          <div className="space-y-2">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter quote text..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
            />
            <input
              type="text"
              value={block.author || ''}
              onChange={(e) => onUpdate({ author: e.target.value })}
              placeholder="Author (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Image block */}
        {block.type === 'image' && (
          <div className="space-y-3">
            {/* Upload section */}
            <div className="border border-dashed border-gray-600 rounded-lg p-4">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload size={24} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-400 mb-1">Upload Image</span>
                <span className="text-xs text-gray-500">or drag and drop</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onUpdate({ content: '', file: ev.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center text-xs text-gray-500">- or -</div>
            <input
              type="url"
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value, file: undefined })}
              placeholder="Image URL..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Caption (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
            />
            {(block.file || block.content) && (
              <img 
                src={block.file || block.content} 
                alt="Preview" 
                className="max-w-xs rounded border border-gray-700"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>
        )}

        {/* Gallery block */}
        {block.type === 'gallery' && (
          <div className="space-y-3">
            {/* Upload multiple images */}
            <div className="border border-dashed border-gray-600 rounded-lg p-4">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload size={24} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-400 mb-1">Upload Images</span>
                <span className="text-xs text-gray-500">Select multiple or drag and drop</span>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          const currentImages = block.images || [];
                          const currentFiles = block.imageFiles || [];
                          onUpdate({ 
                            images: currentImages,
                            imageFiles: [...currentFiles, dataUrl]
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center text-xs text-gray-500">- or add URL -</div>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGalleryImage()}
                placeholder="Add image URL..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={addGalleryImage}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Add
              </button>
            </div>
            {/* Show all images (both URLs and uploaded files) */}
            {((block.images && block.images.length > 0) || (block.imageFiles && block.imageFiles.length > 0)) && (
              <div className="grid grid-cols-4 gap-2">
                {/* URL images */}
                {block.images?.map((img, i) => (
                  <div key={`url-${i}`} className="relative group">
                    <img 
                      src={img} 
                      alt={`Gallery ${i + 1}`} 
                      className="w-full h-20 object-cover rounded border border-gray-700"
                      onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em">Error</text></svg>')}
                    />
                    <button
                      onClick={() => onUpdate({ images: block.images?.filter((_, idx) => idx !== i) })}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {/* Uploaded file images */}
                {block.imageFiles?.map((img, i) => (
                  <div key={`file-${i}`} className="relative group">
                    <img 
                      src={img} 
                      alt={`Uploaded ${i + 1}`} 
                      className="w-full h-20 object-cover rounded border border-blue-700"
                    />
                    <button
                      onClick={() => onUpdate({ imageFiles: block.imageFiles?.filter((_, idx) => idx !== i) })}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List block */}
        {block.type === 'list' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addListItem()}
                placeholder="Add list item..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={addListItem}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Add
              </button>
            </div>
            {block.items && block.items.length > 0 && (
              <ul className="space-y-1">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="flex-1 bg-gray-800 px-2 py-1 rounded">{item}</span>
                    <button
                      onClick={() => onUpdate({ items: block.items?.filter((_, idx) => idx !== i) })}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Link block */}
        {block.type === 'link' && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Link title..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="url"
              value={block.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none resize-none text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Subsystems Editor
function SubsystemsEditor({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const addSubsystem = () => {
    const newSub = createEmptySubsystem();
    onUpdate({ subsystems: [...project.subsystems, newSub] });
    setEditingId(newSub.id);
  };

  const updateSubsystem = (id: string, updates: Partial<Subsystem>) => {
    onUpdate({
      subsystems: project.subsystems.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSubsystem = (id: string) => {
    if (confirm('Delete this subsystem?')) {
      onUpdate({ subsystems: project.subsystems.filter(s => s.id !== id) });
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">Add components/subsystems to your project assembly</p>
        <button
          onClick={addSubsystem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Subsystem
        </button>
      </div>

      {project.subsystems.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg">
          <Box size={48} className="mx-auto mb-2 opacity-30" />
          <p>No subsystems yet</p>
          <p className="text-sm">Add components to build your assembly</p>
        </div>
      ) : (
        <div className="space-y-2">
          {project.subsystems.map((sub, index) => (
            <SubsystemItem
              key={sub.id}
              project={project}
              subsystem={sub}
              isExpanded={expandedIds.has(sub.id)}
              isEditing={editingId === sub.id}
              onToggleExpand={() => toggleExpand(sub.id)}
              onEdit={() => setEditingId(editingId === sub.id ? null : sub.id)}
              onUpdate={(updates) => updateSubsystem(sub.id, updates)}
              onDelete={() => deleteSubsystem(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubsystemItem({
  project,
  subsystem,
  isExpanded,
  isEditing,
  onToggleExpand,
  onEdit,
  onUpdate,
  onDelete,
}: {
  project: Project;
  subsystem: Subsystem;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onUpdate: (updates: Partial<Subsystem>) => void;
  onDelete: () => void;
}) {
  const [outcomeInput, setOutcomeInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      onUpdate({ outcomes: [...subsystem.outcomes, outcomeInput.trim()] });
      setOutcomeInput('');
    }
  };

  const addTool = () => {
    if (toolInput.trim()) {
      onUpdate({ tools: [...subsystem.tools, toolInput.trim()] });
      setToolInput('');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: subsystem.color }}
          />
          <span className="font-medium">{subsystem.name}</span>
          <span className="text-sm text-gray-500">{subsystem.role || 'No role specified'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className={`p-1 rounded ${isEditing ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-600 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && isEditing && (
        <div className="p-4 border-t border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={subsystem.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color</label>
              <input
                type="color"
                value={subsystem.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Role</label>
            <input
              type="text"
              value={subsystem.role}
              onChange={(e) => onUpdate({ role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={subsystem.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Position X</label>
              <input
                type="number"
                step="0.1"
                value={subsystem.position[0]}
                onChange={(e) => onUpdate({ position: [parseFloat(e.target.value), subsystem.position[1], subsystem.position[2]] })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Position Y</label>
              <input
                type="number"
                step="0.1"
                value={subsystem.position[1]}
                onChange={(e) => onUpdate({ position: [subsystem.position[0], parseFloat(e.target.value), subsystem.position[2]] })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Position Z</label>
              <input
                type="number"
                step="0.1"
                value={subsystem.position[2]}
                onChange={(e) => onUpdate({ position: [subsystem.position[0], subsystem.position[1], parseFloat(e.target.value)] })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tools Used</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {subsystem.tools.map((tool: string, i: number) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-sm">
                  {tool}
                  <button onClick={() => onUpdate({ tools: subsystem.tools.filter((_: string, idx: number) => idx !== i) })} className="text-gray-500 hover:text-red-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTool()}
                placeholder="Add tool..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
              />
              <button onClick={addTool} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Key Outcomes</label>
            <div className="space-y-1 mb-2">
              {subsystem.outcomes.map((outcome: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 bg-gray-800 px-2 py-1 rounded">{outcome}</span>
                  <button onClick={() => onUpdate({ outcomes: subsystem.outcomes.filter((_: string, idx: number) => idx !== i) })} className="text-gray-500 hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOutcome()}
                placeholder="Add outcome..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
              />
              <button onClick={addOutcome} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Add</button>
            </div>
          </div>

          {/* CAD Annotation Section */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Box size={18} className="text-blue-400" />
              <label className="text-sm font-medium text-white">Mark on CAD Model</label>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Draw on the 3D model to highlight which parts belong to this subsystem. 
              Use the brush, line, rectangle, or circle tools to annotate.
            </p>
            <SubsystemCADAnnotator
              project={project}
              subsystem={subsystem}
              onUpdateAnnotations={(annotations) => onUpdate({ cadAnnotations: annotations })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Milestones Editor
function MilestonesEditor({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const addMilestone = () => {
    onUpdate({ milestones: [...project.milestones, createEmptyMilestone()] });
  };

  const updateMilestone = (index: number, updates: Partial<Milestone>) => {
    onUpdate({
      milestones: project.milestones.map((m, i) =>
        i === index ? { ...m, ...updates } : m
      ),
    });
  };

  const deleteMilestone = (index: number) => {
    onUpdate({ milestones: project.milestones.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">Track your project timeline with milestones</p>
        <button
          onClick={addMilestone}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Milestone
        </button>
      </div>

      {project.milestones.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg">
          <p>No milestones yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4 items-start">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, { name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(index, { date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, { description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={(e) => updateMilestone(index, { completed: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-600"
                    />
                    <span className="text-sm">Completed</span>
                  </label>
                  <button
                    onClick={() => deleteMilestone(index)}
                    className="p-2 hover:bg-red-600 rounded ml-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// CAD Model Editor - Upload GLB/GLTF and tag parts
function CADModelEditor({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<TaggedPart | null>(null);
  const [modelDataUrl, setModelDataUrl] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  
  const cadModel = project.cadModel;
  const taggedParts = cadModel?.taggedParts || [];

  // Load model from IndexedDB if we have a fileId
  useEffect(() => {
    const loadModel = async () => {
      if (cadModel?.fileId) {
        setLoadingModel(true);
        try {
          const { getFile } = await import('@/lib/fileStorage');
          const storedFile = await getFile(cadModel.fileId);
          if (storedFile) {
            setModelDataUrl(storedFile.data);
          }
        } catch (e) {
          console.error('Failed to load model from storage:', e);
        }
        setLoadingModel(false);
      } else if (cadModel?.fileData) {
        // Legacy: inline base64 data
        setModelDataUrl(cadModel.fileData);
      } else if (cadModel?.url) {
        setModelDataUrl(cadModel.url);
      } else {
        setModelDataUrl(null);
      }
    };
    loadModel();
  }, [cadModel?.fileId, cadModel?.fileData, cadModel?.url]);

  // Get model URL (either from loaded data or external URL)
  const modelUrl = modelDataUrl;

  const handleModelUpload = useCallback(async (file: File, dataUrl: string) => {
    const fileType = file.name.toLowerCase().endsWith('.gltf') ? 'gltf' : 'glb';
    const fileId = `cad-${project.id}-${Date.now()}`;
    
    try {
      // Save to IndexedDB for large files
      const { saveFile, isIndexedDBAvailable } = await import('@/lib/fileStorage');
      
      if (isIndexedDBAvailable()) {
        await saveFile({
          id: fileId,
          name: file.name,
          type: fileType,
          data: dataUrl,
          projectId: project.id,
          createdAt: Date.now(),
        });
        
        // Store just the reference in project (not the data)
        onUpdate({
          cadModel: {
            id: fileId,
            name: file.name,
            fileId: fileId, // Reference to IndexedDB
            type: fileType,
            taggedParts: cadModel?.taggedParts || [],
          },
        });
        
        // Update local state to show the model
        setModelDataUrl(dataUrl);
      } else {
        // Fallback to inline storage (will hit localStorage limits for large files)
        onUpdate({
          cadModel: {
            id: fileId,
            name: file.name,
            fileData: dataUrl,
            type: fileType,
            taggedParts: cadModel?.taggedParts || [],
          },
        });
      }
    } catch (e) {
      console.error('Failed to save CAD model:', e);
      alert('Failed to save CAD model. The file may be too large.');
    }
  }, [cadModel, onUpdate, project.id]);

  const handlePartClick = useCallback((
    position: [number, number, number],
    normal: [number, number, number],
    meshName?: string
  ) => {
    if (!isTaggingMode) return;
    
    // Create new tagged part
    const newPart: TaggedPart = {
      id: `part-${Date.now()}`,
      name: 'New Part',
      description: '',
      role: '',
      tools: [],
      outcomes: [],
      position,
      normal,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      meshName,
    };
    
    // Add to model
    if (cadModel) {
      onUpdate({
        cadModel: {
          ...cadModel,
          taggedParts: [...taggedParts, newPart],
        },
      });
    }
    
    // Open editor for the new part
    setEditingPart(newPart);
    setIsTaggingMode(false);
  }, [isTaggingMode, cadModel, taggedParts, onUpdate]);

  const updateTaggedPart = useCallback((partId: string, updates: Partial<TaggedPart>) => {
    if (!cadModel) return;
    
    onUpdate({
      cadModel: {
        ...cadModel,
        taggedParts: taggedParts.map(p => 
          p.id === partId ? { ...p, ...updates } : p
        ),
      },
    });
    
    // Update editing state if needed
    if (editingPart?.id === partId) {
      setEditingPart(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [cadModel, taggedParts, onUpdate, editingPart]);

  const deleteTaggedPart = useCallback((partId: string) => {
    if (!cadModel) return;
    
    onUpdate({
      cadModel: {
        ...cadModel,
        taggedParts: taggedParts.filter(p => p.id !== partId),
      },
    });
    
    if (editingPart?.id === partId) {
      setEditingPart(null);
    }
  }, [cadModel, taggedParts, onUpdate, editingPart]);

  const removeModel = useCallback(() => {
    if (confirm('Are you sure you want to remove this CAD model and all tags?')) {
      onUpdate({ cadModel: undefined });
      setEditingPart(null);
    }
  }, [onUpdate]);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
          <Boxes size={18} />
          3D CAD Model Setup
        </h3>
        <p className="text-sm text-gray-400">
          Upload a GLB or GLTF file exported from Onshape (or other CAD software). 
          Then click on parts of the model to tag them with descriptions.
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <strong>How to export from Onshape:</strong> Right-click on Part Studio or Assembly → Export → GLTF
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3D Viewer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">3D Preview</h4>
            <div className="flex items-center gap-2">
              {modelUrl && (
                <>
                  <button
                    onClick={() => setIsTaggingMode(!isTaggingMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isTaggingMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Tag size={14} />
                    {isTaggingMode ? 'Click to Tag' : 'Tag Parts'}
                  </button>
                  <button
                    onClick={removeModel}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="aspect-square bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {modelUrl ? (
              <CADModelViewer
                modelUrl={modelUrl}
                taggedParts={taggedParts}
                onPartClick={handlePartClick}
                selectedPartId={selectedPartId}
                onHoverPart={(id) => setSelectedPartId(id)}
                isTaggingMode={isTaggingMode}
                showLabels={true}
              />
            ) : (
              <FileUpload
                accept=".glb,.gltf"
                label="Upload CAD Model (GLB/GLTF)"
                onFileSelect={handleModelUpload}
                maxSizeMB={100}
              />
            )}
          </div>

          {cadModel && (
            <div className="text-sm text-gray-400">
              <p><strong>File:</strong> {cadModel.name}</p>
              <p><strong>Tags:</strong> {taggedParts.length} parts tagged</p>
            </div>
          )}
        </div>

        {/* Right: Tagged Parts List & Editor */}
        <div className="space-y-4">
          <h4 className="font-medium">Tagged Parts</h4>
          
          {editingPart ? (
            <TaggedPartEditor
              part={editingPart}
              onUpdate={(updates) => updateTaggedPart(editingPart.id, updates)}
              onDelete={() => deleteTaggedPart(editingPart.id)}
              onClose={() => setEditingPart(null)}
            />
          ) : (
            <div className="space-y-2">
              {taggedParts.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg">
                  <Tag size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No parts tagged yet</p>
                  <p className="text-sm">Upload a model and click "Tag Parts" to start</p>
                </div>
              ) : (
                taggedParts.map(part => (
                  <div
                    key={part.id}
                    className={`flex items-center gap-3 p-3 bg-gray-900 border rounded-lg cursor-pointer transition-colors ${
                      selectedPartId === part.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setEditingPart(part)}
                    onMouseEnter={() => setSelectedPartId(part.id)}
                    onMouseLeave={() => setSelectedPartId(null)}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: part.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{part.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {part.description || 'No description'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTaggedPart(part.id);
                      }}
                      className="p-1 hover:bg-red-600 rounded opacity-50 hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tagged Part Editor
function TaggedPartEditor({
  part,
  onUpdate,
  onDelete,
  onClose,
}: {
  part: TaggedPart;
  onUpdate: (updates: Partial<TaggedPart>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [toolInput, setToolInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  const addTool = () => {
    if (toolInput.trim()) {
      onUpdate({ tools: [...part.tools, toolInput.trim()] });
      setToolInput('');
    }
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      onUpdate({ outcomes: [...part.outcomes, outcomeInput.trim()] });
      setOutcomeInput('');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: part.color }}
          />
          Edit Part Tag
        </h5>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-600 rounded text-red-400"
            title="Delete tag"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Part Name</label>
          <input
            type="text"
            value={part.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea
            value={part.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="What does this part do?"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Role</label>
          <input
            type="text"
            value={part.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="What did you do here?"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Color</label>
          <input
            type="color"
            value={part.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-16 h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Tools Used</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {part.tools.map((tool, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded text-xs"
              >
                {tool}
                <button
                  onClick={() => onUpdate({ tools: part.tools.filter((_, j) => j !== i) })}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTool()}
              placeholder="Add tool..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button onClick={addTool} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Outcomes</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {part.outcomes.map((outcome, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded text-xs"
              >
                {outcome}
                <button
                  onClick={() => onUpdate({ outcomes: part.outcomes.filter((_, j) => j !== i) })}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={outcomeInput}
              onChange={(e) => setOutcomeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOutcome()}
              placeholder="Add outcome..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button onClick={addOutcome} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              Add
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// Images Editor - Upload project images
function ImagesEditor({ project, onUpdate, lightMode }: { project: Project; onUpdate: (updates: Partial<Project>) => void; lightMode: boolean }) {
  const images = project.images || [];

  const handleImageAdd = useCallback((file: File, dataUrl: string) => {
    const newImage: UploadedImage = {
      id: `img-${Date.now()}`,
      name: file.name,
      data: dataUrl,
    };
    onUpdate({ images: [...images, newImage] });
  }, [images, onUpdate]);

  const handleImageRemove = useCallback((id: string) => {
    onUpdate({ images: images.filter(img => img.id !== id) });
  }, [images, onUpdate]);

  const handleCaptionUpdate = useCallback((id: string, caption: string) => {
    onUpdate({
      images: images.map(img =>
        img.id === id ? { ...img, caption } : img
      ),
    });
  }, [images, onUpdate]);

  const handleThumbnailUpload = useCallback((file: File, dataUrl: string) => {
    onUpdate({ thumbnailFile: dataUrl, thumbnail: undefined });
  }, [onUpdate]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Thumbnail */}
      <div>
        <h4 className="font-medium mb-3">Project Thumbnail</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FileUpload
              accept="image/*"
              label="Upload Thumbnail"
              onFileSelect={handleThumbnailUpload}
              currentFile={project.thumbnailFile}
              maxSizeMB={5}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Or use URL</label>
            <input
              type="url"
              value={project.thumbnail || ''}
              onChange={(e) => onUpdate({ thumbnail: e.target.value, thumbnailFile: undefined })}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        {(project.thumbnailFile || project.thumbnail) && (
          <div className="mt-3">
            <img
              src={project.thumbnailFile || project.thumbnail}
              alt="Thumbnail preview"
              className="w-40 h-30 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Project Images Gallery */}
      <div>
        <h4 className="font-medium mb-3">Project Gallery ({images.length} images)</h4>
        
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {images.map(img => (
              <div key={img.id} className="space-y-2">
                <div className="relative group">
                  <img
                    src={img.data}
                    alt={img.caption || img.name}
                    className="w-full h-32 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    onClick={() => handleImageRemove(img.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
                <input
                  type="text"
                  value={img.caption || ''}
                  onChange={(e) => handleCaptionUpdate(img.id, e.target.value)}
                  placeholder="Caption..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <FileUpload
          accept="image/*"
          label="Add Project Image"
          onFileSelect={handleImageAdd}
          maxSizeMB={10}
        />
      </div>
    </div>
  );
}

// Export Preview
function ExportPreview({ project, lightMode }: { project: Project; lightMode: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400">Preview of the JSON data for this project</p>
      <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-auto max-h-[60vh] text-sm text-gray-300">
        {JSON.stringify(project, null, 2)}
      </pre>
    </div>
  );
}
