'use client';

import React from 'react';
import { resolvePublicUrl } from '@/lib/resolvePublicUrl';
import {
  FileText,
  Image as ImageIcon,
  User,
  Wrench,
  Target,
  Link as LinkIcon,
  Github,
  Video,
  Play,
  Box,
  ExternalLink,
  Users,
  Calendar,
  Lightbulb,
  Award,
} from 'lucide-react';
import { Project, ContentBlock } from '@/store/usePortfolioStore';

interface ProjectContentViewerProps {
  project: Project;
  lightMode?: boolean;
}

// Content Block Renderer
function ContentBlockRenderer({ block, lightMode }: { block: ContentBlock; lightMode: boolean }) {
  switch (block.type) {
    case 'heading':
      const headingSize = block.level === 1 ? 'text-3xl' : block.level === 3 ? 'text-xl' : 'text-2xl';
      const headingClass = `${headingSize} font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`;
      if (block.level === 1) return <h1 className={headingClass}>{block.content}</h1>;
      if (block.level === 3) return <h3 className={headingClass}>{block.content}</h3>;
      return <h2 className={headingClass}>{block.content}</h2>;
    
    case 'text':
      return (
        <p className={`text-base leading-relaxed whitespace-pre-wrap mb-4 ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
          {block.content}
        </p>
      );
    
    case 'list':
      return (
        <ul className={`text-base space-y-2 list-disc list-inside mb-4 ml-4 ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
          {(block.items || []).map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    
    case 'quote':
      return (
        <blockquote className={`border-l-4 pl-6 py-4 my-6 ${lightMode ? 'border-blue-400 bg-blue-50' : 'border-blue-500 bg-blue-500/10'} rounded-r-lg`}>
          <p className={`text-lg italic ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
            "{block.content}"
          </p>
          {block.author && (
            <cite className={`text-sm mt-2 block ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
              — {block.author}
            </cite>
          )}
        </blockquote>
      );
    
    case 'image':
      return block.file ? (
        <div className="my-6">
          <img 
            src={block.file} 
            alt={block.caption || 'Project image'} 
            className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
          />
          {block.caption && (
            <p className={`text-sm text-center mt-2 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {block.caption}
            </p>
          )}
        </div>
      ) : null;
    
    case 'gallery':
      return block.imageFiles && block.imageFiles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          {block.imageFiles.map((img: string, i: number) => (
            <img 
              key={i}
              src={img} 
              alt={`Gallery image ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
            />
          ))}
        </div>
      ) : null;
    
    case 'link':
      return block.url ? (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block p-4 rounded-lg border transition-colors my-4 ${
            lightMode 
              ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
          }`}
        >
          <div className={`text-base font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            {block.title || block.url}
          </div>
          {block.content && (
            <div className={`text-sm mt-1 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {block.content}
            </div>
          )}
        </a>
      ) : null;
    
    default:
      return null;
  }
}

export default function ProjectContentViewer({ project, lightMode = false }: ProjectContentViewerProps) {
  const contentBlocks = project.contentBlocks || [];
  const hasContent = contentBlocks.length > 0;
  const uploadedImages = project.images || [];
  const contentImages = project.contentBlocks?.filter(b => b.type === 'image').map(b => ({
    id: b.id,
    src: b.file || b.content,
    caption: b.caption,
  })) || [];
  const galleryImages = project.contentBlocks?.filter(b => b.type === 'gallery').flatMap(b => [
    ...(b.images || []).map((img, i) => ({ id: `${b.id}-url-${i}`, src: img, caption: undefined })),
    ...(b.imageFiles || []).map((img, i) => ({ id: `${b.id}-file-${i}`, src: img, caption: undefined })),
  ]) || [];
  const videoUrl = project.links.video;
  const allImages = [
    ...uploadedImages.map(i => ({ id: i.id, src: i.data, caption: i.caption })),
    ...contentImages,
    ...galleryImages,
  ].filter(i => i.src);
  const hasMedia = !!videoUrl || allImages.length > 0;

  return (
    <div className={`h-full overflow-y-auto ${lightMode ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Project Header */}
        <div className="mb-8 pb-8 border-b border-gray-700/50">
          {/* Thumbnail */}
          {(project.thumbnailFile || project.thumbnail) && (
            <div className="mb-6">
              <img 
                src={project.thumbnailFile || resolvePublicUrl(project.thumbnail)} 
                alt={project.name}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}
          
          {/* Title and metadata */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-sm px-3 py-1 rounded-full ${lightMode ? 'bg-gray-200 text-gray-600' : 'bg-gray-800 text-gray-300'}`}>
                  {project.year}
                </span>
                <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full capitalize">
                  {project.category}
                </span>
              </div>
              <h1 className={`text-4xl font-bold mb-3 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                {project.name}
              </h1>
              <p className={`text-lg ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {project.description}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {project.role && (
              <div className={`rounded-lg p-4 ${lightMode ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className={`text-xs uppercase ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</div>
                </div>
                <div className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.role}</div>
              </div>
            )}
            {project.teamSize && (
              <div className={`rounded-lg p-4 ${lightMode ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className={`text-xs uppercase ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Team Size</div>
                </div>
                <div className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.teamSize}</div>
              </div>
            )}
            {project.duration && (
              <div className={`rounded-lg p-4 ${lightMode ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className={`text-xs uppercase ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</div>
                </div>
                <div className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.duration}</div>
              </div>
            )}
            <div className={`rounded-lg p-4 ${lightMode ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Box size={16} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                <div className={`text-xs uppercase ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Components</div>
              </div>
              <div className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                {project.subsystems.length}
              </div>
            </div>
          </div>
        </div>
        
        {/* Challenge / Solution / Impact */}
        {(project.challenge || project.solution || project.impact) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {project.challenge && (
              <div className={`rounded-xl p-6 ${lightMode ? 'bg-red-50 border border-red-100' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className="text-red-400 uppercase tracking-wider text-xs font-bold mb-2">Challenge</div>
                <p className={`text-sm ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div className={`rounded-xl p-6 ${lightMode ? 'bg-green-50 border border-green-100' : 'bg-green-500/10 border border-green-500/20'}`}>
                <div className="text-green-400 uppercase tracking-wider text-xs font-bold mb-2">Solution</div>
                <p className={`text-sm ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>{project.solution}</p>
              </div>
            )}
            {project.impact && (
              <div className={`rounded-xl p-6 ${lightMode ? 'bg-blue-50 border border-blue-100' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                <div className="text-blue-400 uppercase tracking-wider text-xs font-bold mb-2">Impact</div>
                <p className={`text-sm ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>{project.impact}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Tools & Skills */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.tools.length > 0 && (
            <div>
              <div className={`text-xs uppercase tracking-wider mb-3 flex items-center gap-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Wrench size={14} />
                Tools & Technologies
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool: string) => (
                  <span
                    key={tool}
                    className={`text-sm px-3 py-1.5 rounded-lg ${lightMode ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-300'}`}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {project.skills && project.skills.length > 0 && (
            <div>
              <div className={`text-xs uppercase tracking-wider mb-3 flex items-center gap-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Lightbulb size={14} />
                Skills Developed
              </div>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Content Blocks - Main content area */}
        {hasContent && (
          <div className="mb-8">
            <div className={`text-xs uppercase tracking-wider mb-6 flex items-center gap-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText size={14} />
              Project Details
            </div>
            <div className="prose prose-invert max-w-none">
              {contentBlocks.map((block: ContentBlock) => (
                <ContentBlockRenderer key={block.id} block={block} lightMode={lightMode} />
              ))}
            </div>
          </div>
        )}
        
        {/* Links */}
        {(project.links.github || project.links.video || project.links.onshape || project.links.writeup) && (
          <div className="mt-8 pt-8 border-t border-gray-700/50">
            <div className={`text-xs uppercase tracking-wider mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <LinkIcon size={14} />
              Links & Resources
            </div>
            <div className="flex flex-wrap gap-3">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    lightMode 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Github size={18} />
                  GitHub
                  <ExternalLink size={14} />
                </a>
              )}
              {project.links.video && (
                <a
                  href={project.links.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    lightMode 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Video size={18} />
                  Video
                  <ExternalLink size={14} />
                </a>
              )}
              {project.links.onshape && (
                <a
                  href={project.links.onshape}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    lightMode 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Box size={18} />
                  CAD Model
                  <ExternalLink size={14} />
                </a>
              )}
              {project.links.writeup && (
                <a
                  href={project.links.writeup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    lightMode 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <FileText size={18} />
                  Documentation
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Media */}
        {hasMedia && (
          <div className="mt-10 pt-8 border-t border-gray-700/50">
            <div className={`text-xs uppercase tracking-wider mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <ImageIcon size={14} />
              Media
            </div>
            {videoUrl && (
              <div className="mb-6">
                <div className={`text-xs uppercase tracking-wider mb-3 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Video</div>
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <div className="aspect-video max-w-3xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]}`}
                      className="w-full h-full rounded-xl shadow-lg"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      lightMode
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Play size={16} />
                    Watch Video
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
            {allImages.length > 0 ? (
              <div>
                <div className={`text-xs uppercase tracking-wider mb-3 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Images ({allImages.length})
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.src}
                        alt={img.caption || 'Project image'}
                        className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-all"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-sm ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No images uploaded yet.
              </div>
            )}
          </div>
        )}
        
        {/* No Content Message */}
        {!hasContent && !project.challenge && !project.solution && !hasMedia && (
          <div className={`text-center py-16 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No detailed content yet</p>
            <p className="text-sm">Add content blocks in the admin panel to show project details here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
