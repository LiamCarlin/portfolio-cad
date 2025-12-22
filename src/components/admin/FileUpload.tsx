'use client';

import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File, dataUrl: string) => void;
  label: string;
  currentFile?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  accept, 
  onFileSelect, 
  label, 
  currentFile,
  maxSizeMB = 50
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File too large. Max size is ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    
    try {
      // Read file as data URL (base64)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onFileSelect(file, dataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process file');
      setUploading(false);
    }
  }, [maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-')}`}
        />
        <label 
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className="cursor-pointer"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Processing...</span>
            </div>
          ) : currentFile ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-sm">File uploaded</span>
              <span className="text-gray-500 text-xs">Click or drag to replace</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-gray-400">
                Drag & drop or <span className="text-blue-400 underline">browse</span>
              </span>
              <span className="text-gray-500 text-xs">Max {maxSizeMB}MB</span>
            </div>
          )}
        </label>
      </div>
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

// Image preview component
export function ImagePreview({ 
  src, 
  alt, 
  onRemove 
}: { 
  src: string; 
  alt: string; 
  onRemove?: () => void;
}) {
  return (
    <div className="relative group">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-32 object-cover rounded-lg"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Multi-image upload
export function MultiImageUpload({
  images,
  onAdd,
  onRemove,
  maxImages = 10,
}: {
  images: Array<{ id: string; data: string; caption?: string }>;
  onAdd: (file: File, dataUrl: string) => void;
  onRemove: (id: string) => void;
  maxImages?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <ImagePreview 
            key={img.id} 
            src={img.data} 
            alt={img.caption || 'Project image'}
            onRemove={() => onRemove(img.id)}
          />
        ))}
      </div>
      
      {images.length < maxImages && (
        <FileUpload
          accept="image/*"
          label={`Add Image (${images.length}/${maxImages})`}
          onFileSelect={onAdd}
          maxSizeMB={10}
        />
      )}
    </div>
  );
}
