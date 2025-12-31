'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Quote,
  List,
  Link2,
  Video,
  Calendar,
  CheckCircle,
  Circle,
  Camera,
  Play,
  Download,
  Github,
  Box,
  Award,
  Target,
  Wrench,
  User,
  Clock,
  Lightbulb,
  Edit2,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { usePortfolioStore, Project, ContentBlock, Milestone, ExperienceEntry } from '@/store/usePortfolioStore';
import { EditButton } from '@/components/admin/UserMenu';
import { ProjectDetailsEditor, ContentBlockEditor, MilestoneEditor } from '@/components/admin/InlineEditors';
import { resolvePublicUrl } from '@/lib/resolvePublicUrl';

// Content Block Renderer
function ContentBlockView({ block, lightMode }: { block: ContentBlock; lightMode: boolean }) {
  const bgClass = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-600' : 'text-gray-300';

  switch (block.type) {
    case 'heading':
      const level = block.level || 2;
      const sizes: Record<number, string> = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl' };
      const HeadingClass = `${sizes[level]} font-bold ${textClass} mb-4`;
      if (level === 1) return <h1 className={HeadingClass}>{block.content}</h1>;
      if (level === 3) return <h3 className={HeadingClass}>{block.content}</h3>;
      return <h2 className={HeadingClass}>{block.content}</h2>;

    case 'text':
      return (
        <div className={`${mutedClass} leading-relaxed whitespace-pre-wrap`}>
          {block.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
      );

    case 'image':
      const imageSrc = block.file || block.content;
      return (
        <figure className="mb-6">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={block.caption || 'Project image'}
              className="w-full rounded-lg shadow-lg"
            />
          )}
          {block.caption && (
            <figcaption className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center italic`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      const allImages = [
        ...(block.images || []),
        ...(block.imageFiles || [])
      ];
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {allImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Gallery image ${i + 1}`}
              className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            />
          ))}
        </div>
      );

    case 'quote':
      return (
        <blockquote className={`border-l-4 border-blue-500 pl-6 py-2 mb-6 ${bgClass} rounded-r-lg`}>
          <p className={`text-lg italic ${mutedClass}`}>"{block.content}"</p>
          {block.author && (
            <cite className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'} mt-2 block`}>
              — {block.author}
            </cite>
          )}
        </blockquote>
      );

    case 'list':
      return (
        <ul className={`list-none space-y-2 mb-6 ${mutedClass}`}>
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'link':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${bgClass} rounded-lg p-4 mb-6 hover:ring-2 ring-blue-500 transition-all`}
        >
          <div className="flex items-center gap-3">
            <Link2 className="text-blue-500" size={20} />
            <div className="flex-1">
              <div className={`font-medium ${textClass}`}>{block.title || 'Link'}</div>
              {block.content && (
                <div className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {block.content}
                </div>
              )}
            </div>
            <ExternalLink size={16} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
          </div>
        </a>
      );

    case 'video':
      // Support YouTube embeds
      const youtubeMatch = block.content?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (youtubeMatch) {
        return (
          <div className="aspect-video mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <video
          src={block.content}
          controls
          className="w-full rounded-lg mb-6"
        />
      );

    default:
      return null;
  }
}

// Project Content View - Shows all content blocks prominently
export function ProjectContentView({ project, lightMode }: { project: Project; lightMode: boolean }) {
  const [showDetailsEditor, setShowDetailsEditor] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);
  
  const contentBlocks = project.contentBlocks || [];
  const bgClass = lightMode ? 'bg-gray-50' : 'bg-gray-900';
  const cardBg = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-600' : 'text-gray-300';

  return (
    <div className={`h-full overflow-y-auto ${bgClass} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8 relative">
          <EditButton onClick={() => setShowDetailsEditor(true)} className="absolute top-0 right-0 z-10" />
          
          {(project.thumbnailFile || project.thumbnail) && (
            <img
              src={project.thumbnailFile || resolvePublicUrl(project.thumbnail)}
              alt={project.name}
              className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg"
            />
          )}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${lightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-blue-300'}`}>
              {project.category}
            </span>
            <span className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {project.year}
            </span>
          </div>
          <h1 className={`text-4xl font-bold ${textClass} mb-4`}>{project.name}</h1>
          <p className={`text-xl ${mutedClass} mb-6`}>{project.description}</p>
          
          {/* Role & Team Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {project.role && (
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <User size={18} />
                <span>{project.role}</span>
              </div>
            )}
            {project.duration && (
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <Clock size={18} />
                <span>{project.duration}</span>
              </div>
            )}
            {project.teamSize && (
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <User size={18} />
                <span>{project.teamSize} team members</span>
              </div>
            )}
          </div>

          {/* Tools */}
          {project.tools.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className={`px-3 py-1 rounded-full text-sm ${lightMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'}`}
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Challenge / Solution / Impact */}
        {(project.challenge || project.solution || project.impact) && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {project.challenge && (
              <div className={`${cardBg} rounded-xl p-6 shadow-md`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-red-500" size={20} />
                  <h3 className={`font-semibold ${textClass}`}>Challenge</h3>
                </div>
                <p className={`text-sm ${mutedClass}`}>{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div className={`${cardBg} rounded-xl p-6 shadow-md`}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-green-500" size={20} />
                  <h3 className={`font-semibold ${textClass}`}>Solution</h3>
                </div>
                <p className={`text-sm ${mutedClass}`}>{project.solution}</p>
              </div>
            )}
            {project.impact && (
              <div className={`${cardBg} rounded-xl p-6 shadow-md`}>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="text-blue-500" size={20} />
                  <h3 className={`font-semibold ${textClass}`}>Impact</h3>
                </div>
                <p className={`text-sm ${mutedClass}`}>{project.impact}</p>
              </div>
            )}
          </div>
        )}

        {/* Content Blocks */}
        <div className="relative">
          <EditButton onClick={() => setShowContentEditor(true)} className="absolute -top-2 right-0 z-10" />
          {contentBlocks.length > 0 ? (
            <div className="space-y-6">
              {contentBlocks.map((block) => (
                <ContentBlockView key={block.id} block={block} lightMode={lightMode} />
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No content blocks yet</p>
            </div>
          )}
        </div>

        {/* Links Section */}
        {(project.links.github || project.links.video || project.links.onshape || project.links.writeup) && (
          <div className={`${cardBg} rounded-xl p-6 mt-8 shadow-md`}>
            <h3 className={`font-semibold ${textClass} mb-4`}>Project Links</h3>
            <div className="flex flex-wrap gap-3">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Github size={18} />
                  GitHub
                </a>
              )}
              {project.links.video && (
                <a
                  href={project.links.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  <Play size={18} />
                  Video
                </a>
              )}
              {project.links.onshape && (
                <a
                  href={project.links.onshape}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Box size={18} />
                  View CAD
                </a>
              )}
              {project.links.writeup && (
                <a
                  href={project.links.writeup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  <FileText size={18} />
                  Documentation
                </a>
              )}
            </div>
          </div>
        )}

        {/* No content message */}
        {contentBlocks.length === 0 && !project.challenge && !project.solution && !project.impact && (
          <div className={`text-center py-16 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>No content blocks added yet.</p>
            <p className="text-sm">Add content in the admin panel or enable edit mode.</p>
          </div>
        )}
      </div>
      
      {/* Editor Modals */}
      <ProjectDetailsEditor project={project} isOpen={showDetailsEditor} onClose={() => setShowDetailsEditor(false)} />
      <ContentBlockEditor project={project} isOpen={showContentEditor} onClose={() => setShowContentEditor(false)} />
    </div>
  );
}

// Timeline View - Project milestones and history
export function TimelineView({ project, lightMode }: { project: Project; lightMode: boolean }) {
  const [showMilestoneEditor, setShowMilestoneEditor] = useState(false);
  
  const bgClass = lightMode ? 'bg-gray-50' : 'bg-gray-900';
  const cardBg = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-500' : 'text-gray-400';

  const sortedMilestones = [...(project.milestones || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className={`h-full overflow-y-auto ${bgClass} p-6`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={28} />
            <h2 className={`text-2xl font-bold ${textClass}`}>Project Timeline</h2>
          </div>
          <EditButton onClick={() => setShowMilestoneEditor(true)} />
        </div>

        {sortedMilestones.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${lightMode ? 'bg-gray-300' : 'bg-gray-700'}`} />
            
            <div className="space-y-6">
              {sortedMilestones.map((milestone, index) => (
                <div key={milestone.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-300' 
                      : lightMode ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-600'
                  }`}>
                    {milestone.completed && (
                      <CheckCircle size={12} className="text-white absolute -top-0.5 -left-0.5" />
                    )}
                  </div>
                  
                  <div className={`${cardBg} rounded-xl p-5 shadow-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${textClass}`}>{milestone.name}</h3>
                      <span className={`text-sm ${mutedClass}`}>
                        {new Date(milestone.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className={mutedClass}>{milestone.description}</p>
                    {milestone.completed && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-500 mt-2">
                        <CheckCircle size={14} />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`text-center py-16 ${mutedClass}`}>
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p>No milestones added yet.</p>
            <p className="text-sm">Add milestones in edit mode.</p>
          </div>
        )}
      </div>
      
      {/* Editor Modal */}
      <MilestoneEditor project={project} isOpen={showMilestoneEditor} onClose={() => setShowMilestoneEditor(false)} />
    </div>
  );
}

// Results View - Outcomes and achievements
export function ResultsView({ project, lightMode }: { project: Project; lightMode: boolean }) {
  const bgClass = lightMode ? 'bg-gray-50' : 'bg-gray-900';
  const cardBg = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-500' : 'text-gray-400';

  // Collect all outcomes from subsystems and tagged parts
  const subsystemOutcomes = project.subsystems?.flatMap(s => 
    s.outcomes.map(o => ({ source: s.name, outcome: o }))
  ) || [];

  const taggedPartOutcomes = project.cadModel?.taggedParts?.flatMap(p =>
    p.outcomes.map(o => ({ source: p.name, outcome: o }))
  ) || [];

  const allOutcomes = [...subsystemOutcomes, ...taggedPartOutcomes];

  return (
    <div className={`h-full overflow-y-auto ${bgClass} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-blue-500" size={28} />
          <h2 className={`text-2xl font-bold ${textClass}`}>Results & Outcomes</h2>
        </div>

        {/* Impact Summary */}
        {project.impact && (
          <div className={`${cardBg} rounded-xl p-6 mb-8 shadow-md border-l-4 border-blue-500`}>
            <h3 className={`font-semibold ${textClass} mb-3`}>Project Impact</h3>
            <p className={`text-lg ${mutedClass}`}>{project.impact}</p>
          </div>
        )}

        {/* Skills Developed */}
        {project.skills && project.skills.length > 0 && (
          <div className={`${cardBg} rounded-xl p-6 mb-8 shadow-md`}>
            <h3 className={`font-semibold ${textClass} mb-4`}>Skills Developed</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Component Outcomes */}
        {allOutcomes.length > 0 && (
          <div className={`${cardBg} rounded-xl p-6 shadow-md`}>
            <h3 className={`font-semibold ${textClass} mb-4`}>Key Achievements</h3>
            <div className="space-y-3">
              {allOutcomes.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className={mutedClass}>{item.outcome}</p>
                    <span className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      from {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Learned */}
        {project.lessonsLearned && (
          <div className={`${cardBg} rounded-xl p-6 mt-6 shadow-md`}>
            <h3 className={`font-semibold ${textClass} mb-3`}>Lessons Learned</h3>
            <p className={mutedClass}>{project.lessonsLearned}</p>
          </div>
        )}

        {/* Future Work */}
        {project.futureWork && (
          <div className={`${cardBg} rounded-xl p-6 mt-6 shadow-md`}>
            <h3 className={`font-semibold ${textClass} mb-3`}>Future Work</h3>
            <p className={mutedClass}>{project.futureWork}</p>
          </div>
        )}

        {/* Empty state */}
        {!project.impact && allOutcomes.length === 0 && !project.lessonsLearned && (
          <div className={`text-center py-16 ${mutedClass}`}>
            <Award size={48} className="mx-auto mb-4 opacity-30" />
            <p>No results documented yet.</p>
            <p className="text-sm">Add outcomes in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Media View - All images and videos
export function MediaView({ project, lightMode }: { project: Project; lightMode: boolean }) {
  const bgClass = lightMode ? 'bg-gray-50' : 'bg-gray-900';
  const cardBg = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-500' : 'text-gray-400';

  // Collect all images
  const uploadedImages = project.images || [];
  
  // Images from content blocks
  const contentImages = project.contentBlocks?.filter(b => b.type === 'image').map(b => ({
    id: b.id,
    src: b.file || b.content,
    caption: b.caption
  })) || [];

  // Gallery images from content blocks
  const galleryImages = project.contentBlocks?.filter(b => b.type === 'gallery').flatMap(b => [
    ...(b.images || []).map((img, i) => ({ id: `${b.id}-url-${i}`, src: img, caption: undefined })),
    ...(b.imageFiles || []).map((img, i) => ({ id: `${b.id}-file-${i}`, src: img, caption: undefined }))
  ]) || [];

  // Video links
  const videoUrl = project.links.video;

  const allImages = [
    ...uploadedImages.map(i => ({ id: i.id, src: i.data, caption: i.caption })),
    ...contentImages,
    ...galleryImages
  ].filter(i => i.src);

  return (
    <div className={`h-full overflow-y-auto ${bgClass} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Camera className="text-blue-500" size={28} />
          <h2 className={`text-2xl font-bold ${textClass}`}>Media Gallery</h2>
        </div>

        {/* Video Section */}
        {videoUrl && (
          <div className="mb-8">
            <h3 className={`font-semibold ${textClass} mb-4`}>Video</h3>
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                <Play size={20} />
                Watch Video
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}

        {/* Images Gallery */}
        {allImages.length > 0 ? (
          <div>
            <h3 className={`font-semibold ${textClass} mb-4`}>Images ({allImages.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((img) => (
                <div key={img.id} className={`${cardBg} rounded-lg overflow-hidden shadow-md group`}>
                  <img
                    src={img.src}
                    alt={img.caption || 'Project image'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  {img.caption && (
                    <p className={`p-2 text-sm ${mutedClass}`}>{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`text-center py-16 ${mutedClass}`}>
            <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p>No images uploaded yet.</p>
            <p className="text-sm">Add images in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
// Helper to parse "Month Year" date format
function parseMonthYear(dateStr: string): Date | null {
  if (dateStr === 'Present') {
    return new Date(); // Current date for sorting
  }
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return null;
  const monthIndex = months.indexOf(parts[0]);
  if (monthIndex === -1) return null;
  const year = parseInt(parts[1]);
  if (isNaN(year)) return null;
  return new Date(year, monthIndex);
}

export function ExperienceView({ lightMode }: { lightMode: boolean }) {
  const { experienceEntries } = usePortfolioStore();
  const baseResolve = require('@/lib/resolvePublicUrl');
  const resolvePublicUrl = baseResolve.resolvePublicUrl as (url?: string) => string | null;
  
  const bgClass = lightMode ? 'bg-gray-50' : 'bg-gray-900';
  const cardBg = lightMode ? 'bg-white' : 'bg-gray-800';
  const textClass = lightMode ? 'text-gray-900' : 'text-white';
  const mutedClass = lightMode ? 'text-gray-500' : 'text-gray-400';

  // Sort by start date (most recent first)
  const sortedExperience = useMemo(() => {
    return [...experienceEntries].sort((a, b) => {
      const dateA = parseMonthYear(a.startDate || 'January 1970');
      const dateB = parseMonthYear(b.startDate || 'January 1970');
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  }, [experienceEntries]);

  return (
    <div className={`h-full overflow-y-auto ${bgClass} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="text-blue-500" size={28} />
          <h2 className={`text-2xl font-bold ${textClass}`}>Experience</h2>
        </div>

        {sortedExperience.length > 0 ? (
          <div className="space-y-4">
            {sortedExperience.map((entry) => (
              <div key={entry.id} className={`${cardBg} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-300 bg-white">
                      {entry.logoFile || entry.logoUrl ? (
                        <img
                          src={entry.logoFile || resolvePublicUrl(entry.logoUrl) || ''}
                          alt={entry.organization || 'Company logo'}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Logo</div>
                      )}
                    </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${textClass}`}>{entry.role}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase size={16} className="text-blue-500" />
                      <span className={`font-medium ${mutedClass}`}>{entry.organization}</span>
                    </div>
                  </div>
                  </div>
                  <div className={`text-right text-sm ${mutedClass}`}>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{entry.startDate} - {entry.endDate}</span>
                    </div>
                    {entry.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        <span>{entry.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {entry.description && (
                  <p className={`${mutedClass} leading-relaxed mt-3 whitespace-pre-wrap`}>
                    {entry.description}
                  </p>
                )}

                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-blue-500 hover:text-blue-400 text-sm transition-colors"
                  >
                    Learn more
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 ${mutedClass}`}>
            <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
            <p>No experience entries yet.</p>
            <p className="text-sm">Add your work history in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
