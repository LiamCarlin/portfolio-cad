'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload } from 'lucide-react';
import { usePortfolioStore, Project, ContentBlock, Milestone } from '@/store/usePortfolioStore';

interface InlineEditorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InlineEditorModal({ isOpen, onClose, title, children }: InlineEditorProps) {
  const { theme } = usePortfolioStore();
  const lightMode = theme === 'light';
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`${lightMode ? 'bg-white' : 'bg-gray-900'} rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col`}>
        <div className={`flex items-center justify-between p-4 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'}`}>
          <h2 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${lightMode ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Project Details Editor
interface ProjectDetailsEditorProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsEditor({ project, isOpen, onClose }: ProjectDetailsEditorProps) {
  const { updateProject, theme } = usePortfolioStore();
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    role: project.role,
    challenge: project.challenge,
    solution: project.solution,
    impact: project.impact,
    year: project.year,
    category: project.category,
    duration: project.duration || '',
    teamSize: project.teamSize || '',
  });
  
  const lightMode = theme === 'light';
  
  const handleSave = () => {
    updateProject(project.id, {
      ...formData,
      teamSize: formData.teamSize ? parseInt(formData.teamSize as string) : undefined,
    });
    onClose();
  };
  
  const inputClass = `w-full ${lightMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'} border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none ${lightMode ? 'text-gray-900' : 'text-white'}`;
  const labelClass = `block text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'} mb-1`;
  
  return (
    <InlineEditorModal isOpen={isOpen} onClose={onClose} title="Edit Project Details">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Project['category'] })}
              className={inputClass}
            >
              <option value="robotics">Robotics</option>
              <option value="vehicles">Vehicles</option>
              <option value="software">Software</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 3 months"
              className={inputClass}
            />
          </div>
        </div>
        
        <div>
          <label className={labelClass}>Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className={labelClass}>Challenge</label>
          <textarea
            value={formData.challenge}
            onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className={labelClass}>Solution</label>
          <textarea
            value={formData.solution}
            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
        
        <div>
          <label className={labelClass}>Impact</label>
          <textarea
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${lightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </InlineEditorModal>
  );
}

// Content Block Editor
interface ContentBlockEditorProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ContentBlockEditor({ project, isOpen, onClose }: ContentBlockEditorProps) {
  const { updateProject, theme } = usePortfolioStore();
  const [blocks, setBlocks] = useState<ContentBlock[]>(project.contentBlocks || []);
  
  const lightMode = theme === 'light';
  const inputClass = `w-full ${lightMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'} border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none ${lightMode ? 'text-gray-900' : 'text-white'}`;
  
  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      ...(type === 'gallery' ? { images: [], imageFiles: [] } : {}),
      ...(type === 'list' ? { items: [] } : {}),
      ...(type === 'heading' ? { level: 2 } : {}),
    };
    setBlocks([...blocks, newBlock]);
  };
  
  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };
  
  const handleSave = () => {
    updateProject(project.id, { contentBlocks: blocks });
    onClose();
  };
  
  return (
    <InlineEditorModal isOpen={isOpen} onClose={onClose} title="Edit Content Blocks">
      <div className="space-y-4">
        {/* Add block buttons */}
        <div className="flex flex-wrap gap-2">
          {['heading', 'text', 'image', 'list', 'quote'].map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type as ContentBlock['type'])}
              className={`px-3 py-1.5 rounded-lg text-sm ${lightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors flex items-center gap-1`}
            >
              <Plus size={14} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Block list */}
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className={`${lightMode ? 'bg-gray-100' : 'bg-gray-800'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'} capitalize`}>
                  {block.type} Block
                </span>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {block.type === 'heading' && (
                <div className="flex gap-2">
                  <select
                    value={block.level || 2}
                    onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) as 1 | 2 | 3 })}
                    className={`${inputClass} w-24`}
                  >
                    <option value={1}>H1</option>
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                  </select>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Heading text..."
                    className={inputClass}
                  />
                </div>
              )}
              
              {block.type === 'text' && (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Enter text content..."
                  rows={3}
                  className={inputClass}
                />
              )}
              
              {block.type === 'image' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Image URL..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={block.caption || ''}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className={inputClass}
                  />
                  <div className={`border border-dashed ${lightMode ? 'border-gray-300' : 'border-gray-600'} rounded-lg p-4 text-center`}>
                    <label className="cursor-pointer">
                      <Upload size={20} className={`mx-auto mb-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>Click to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateBlock(block.id, { file: ev.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {(block.file || block.content) && (
                    <img src={block.file || block.content} alt="Preview" className="max-w-xs rounded" />
                  )}
                </div>
              )}
              
              {block.type === 'quote' && (
                <div className="space-y-2">
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Quote text..."
                    rows={2}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={block.author || ''}
                    onChange={(e) => updateBlock(block.id, { author: e.target.value })}
                    placeholder="Author (optional)"
                    className={inputClass}
                  />
                </div>
              )}
              
              {block.type === 'list' && (
                <div className="space-y-2">
                  {(block.items || []).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[i] = e.target.value;
                          updateBlock(block.id, { items: newItems });
                        }}
                        className={inputClass}
                      />
                      <button
                        onClick={() => {
                          const newItems = (block.items || []).filter((_, idx) => idx !== i);
                          updateBlock(block.id, { items: newItems });
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newItems = [...(block.items || []), ''];
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {blocks.length === 0 && (
          <div className={`text-center py-8 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No content blocks yet. Add one above!
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${lightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </InlineEditorModal>
  );
}

// Milestone Editor
interface MilestoneEditorProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function MilestoneEditor({ project, isOpen, onClose }: MilestoneEditorProps) {
  const { updateProject, theme } = usePortfolioStore();
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones || []);
  
  const lightMode = theme === 'light';
  const inputClass = `w-full ${lightMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'} border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none ${lightMode ? 'text-gray-900' : 'text-white'}`;
  
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      name: 'New Milestone',
      date: new Date().toISOString().split('T')[0],
      description: '',
      completed: false,
    };
    setMilestones([...milestones, newMilestone]);
  };
  
  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, ...updates } : m));
  };
  
  const deleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };
  
  const handleSave = () => {
    updateProject(project.id, { milestones });
    onClose();
  };
  
  return (
    <InlineEditorModal isOpen={isOpen} onClose={onClose} title="Edit Milestones">
      <div className="space-y-4">
        <button
          onClick={addMilestone}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Milestone
        </button>
        
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className={`${lightMode ? 'bg-gray-100' : 'bg-gray-800'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={milestone.name}
                  onChange={(e) => updateMilestone(milestone.id, { name: e.target.value })}
                  className={`${inputClass} font-medium`}
                  placeholder="Milestone name"
                />
                <button
                  onClick={() => deleteMilestone(milestone.id)}
                  className="p-1 text-red-500 hover:text-red-400 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>Date</label>
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(milestone.id, { date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={(e) => updateMilestone(milestone.id, { completed: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>Completed</label>
                </div>
              </div>
              
              <textarea
                value={milestone.description}
                onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                placeholder="Description..."
                rows={2}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        
        {milestones.length === 0 && (
          <div className={`text-center py-8 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No milestones yet. Add one above!
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${lightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </InlineEditorModal>
  );
}
