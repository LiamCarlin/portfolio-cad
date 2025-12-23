'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Save } from 'lucide-react';
import { usePortfolioStore, SocialLink } from '@/store/usePortfolioStore';
import { saveImage, getImage } from '@/lib/imageStorage';

interface WelcomePageEditorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WelcomePageEditor({ isOpen = true, onClose }: WelcomePageEditorProps) {
  const { welcomePageData, updateWelcomePageData, setBannerImageId, setProfileImageId, theme } = usePortfolioStore();
  const lightMode = theme === 'light';
  
  const [formData, setFormData] = useState(welcomePageData);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Load banner image preview on mount and when store updates
  useEffect(() => {
    setFormData(welcomePageData);
    
    // Load banner image from IndexedDB if it exists
    if (welcomePageData.bannerImageId) {
      setIsLoadingBanner(true);
      getImage(welcomePageData.bannerImageId)
        .then((image) => {
          if (image) {
            setBannerImagePreview(image.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load banner image:', err);
        })
        .finally(() => {
          setIsLoadingBanner(false);
        });
    } else {
      setBannerImagePreview(null);
    }
    
    // Load profile image from IndexedDB if it exists
    if (welcomePageData.profileImageId) {
      setIsLoadingProfile(true);
      getImage(welcomePageData.profileImageId)
        .then((image) => {
          if (image) {
            setProfileImagePreview(image.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load profile image:', err);
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else {
      setProfileImagePreview(null);
    }
  }, [welcomePageData]);
  
  const [newSocialLink, setNewSocialLink] = useState<Partial<SocialLink>>({
    platform: 'github',
    url: '',
    label: '',
  });
  
  const inputClass = `w-full ${lightMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'} border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none ${lightMode ? 'text-gray-900' : 'text-white'}`;
  const labelClass = `block text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'} mb-1 font-medium`;
  const buttonClass = `px-4 py-2 rounded-lg font-medium transition-colors`;
  
  const handleSave = () => {
    updateWelcomePageData(formData);
    if (onClose) onClose();
  };
  
  const handleAddSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      const link: SocialLink = {
        id: `link-${Date.now()}`,
        platform: newSocialLink.platform as SocialLink['platform'],
        url: newSocialLink.url,
        label: newSocialLink.label || newSocialLink.platform,
        icon: newSocialLink.icon,
      };
      setFormData({
        ...formData,
        socialLinks: [...formData.socialLinks, link],
      });
      setNewSocialLink({ platform: 'github', url: '', label: '' });
    }
  };
  
  const handleRemoveSocialLink = (id: string) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter(link => link.id !== id),
    });
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Check file size (warn if > 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Warning: Banner image is larger than 5MB. Consider using a smaller image for better performance.');
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          
          // Save to IndexedDB instead of storing in component state
          const imageId = `banner-${Date.now()}`;
          try {
            await saveImage(imageId, dataUrl, file.name);
            
            // Update store with the image ID
            setBannerImageId(imageId);
            setBannerImagePreview(dataUrl);
            
            // Update form data (without the image data itself)
            setFormData({
              ...formData,
              bannerImageId: imageId,
            });
          } catch (err) {
            console.error('Failed to save banner image:', err);
            alert('Failed to save banner image. It may be too large.');
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error uploading banner:', err);
        alert('Failed to upload banner image.');
      }
    }
  };

  const handleRemoveBanner = async () => {
    if (formData.bannerImageId) {
      try {
        // Delete from IndexedDB is optional - we just clear the reference
        // await deleteImage(formData.bannerImageId);
        setBannerImageId(undefined);
        setBannerImagePreview(null);
        setFormData({
          ...formData,
          bannerImageId: undefined,
        });
      } catch (err) {
        console.error('Failed to remove banner:', err);
      }
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          alert('Warning: Profile image is larger than 5MB. Consider using a smaller image.');
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          const imageId = `profile-${Date.now()}`;
          try {
            await saveImage(imageId, dataUrl, file.name);
            setProfileImageId(imageId);
            setProfileImagePreview(dataUrl);
            setFormData({
              ...formData,
              profileImageId: imageId,
            });
          } catch (err) {
            console.error('Failed to save profile image:', err);
            alert('Failed to save profile image. It may be too large.');
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error uploading profile:', err);
        alert('Failed to upload profile image.');
      }
    }
  };

  const handleRemoveProfile = async () => {
    if (formData.profileImageId) {
      try {
        setProfileImageId(undefined);
        setProfileImagePreview(null);
        setFormData({
          ...formData,
          profileImageId: undefined,
        });
      } catch (err) {
        console.error('Failed to remove profile:', err);
      }
    }
  };

    const handleSocialIconUpload = (linkId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          socialLinks: formData.socialLinks.map(link =>
            link.id === linkId
              ? { ...link, icon: event.target?.result as string }
              : link
          ),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewSocialIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewSocialLink({
          ...newSocialLink,
          icon: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="w-full">
      <div className="space-y-6 max-w-4xl">
        {/* Personal Information */}
        <div className={`p-4 rounded-lg ${lightMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h3 className={`text-lg font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            Personal Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="e.g., Mechanical Engineer, Student, etc."
              />
            </div>
            
            <div>
              <label className={labelClass}>School/Organization</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="Tell people about yourself..."
              />
            </div>
          </div>
        </div>
        
        {/* Banner Image */}
        <div className={`p-4 rounded-lg ${lightMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h3 className={`text-lg font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            Banner Image
          </h3>
          
          <div className="space-y-3">
            {bannerImagePreview && !isLoadingBanner && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-500">
                <img 
                  src={bannerImagePreview} 
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {isLoadingBanner && (
              <div className="w-full h-40 rounded-lg bg-gray-700 flex items-center justify-center">
                <p className="text-gray-400">Loading banner...</p>
              </div>
            )}
            
            <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              lightMode 
                ? 'border-gray-300 hover:bg-gray-100' 
                : 'border-gray-600 hover:bg-gray-700'
            }`}>
              <Upload size={18} />
              <span className={`text-sm font-medium ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Click to upload banner image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </label>
            <p className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Recommended: 1920x400px or wider. The image will be displayed as the background.
            </p>
            
            {/* Banner Darkness Control */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <label className={labelClass}>Banner Darkness (for text readability)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={formData.bannerDarkness ?? 30}
                  onChange={(e) => setFormData({ ...formData, bannerDarkness: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className={`text-sm font-medium w-12 text-right ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {formData.bannerDarkness ?? 30}%
                </span>
              </div>
              <p className={`text-xs mt-1 ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Adds a dark overlay to make text more readable. 0% = no overlay, 80% = very dark.
              </p>
              
              {/* Preview with darkness */}
              {bannerImagePreview && (
                <div className="mt-3 relative w-full h-20 rounded-lg overflow-hidden">
                  <img 
                    src={bannerImagePreview} 
                    alt="Banner preview with darkness"
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 bg-black transition-opacity"
                    style={{ opacity: (formData.bannerDarkness ?? 30) / 100 }}
                  />
                  <p className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                    Sample Text Preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Picture */}
        <div className={`p-4 rounded-lg ${lightMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h3 className={`text-lg font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            Profile Picture
          </h3>
          
          <div className="space-y-3">
            {profileImagePreview && !isLoadingProfile && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-500">
                <img 
                  src={profileImagePreview} 
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveProfile}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                  title="Remove profile picture"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {isLoadingProfile && (
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Loading...</span>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium mb-2 cursor-pointer flex items-center gap-2 ${lightMode ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 hover:text-blue-400'} transition-colors`}>
                <Upload size={16} />
                {profileImagePreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                className="hidden"
                id="profile-upload"
              />
              <label htmlFor="profile-upload" className={`block p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${lightMode ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50' : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700'}`}>
                <span className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Click to upload or drag and drop
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className={`p-4 rounded-lg ${lightMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h3 className={`text-lg font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            Social Links & Contact
          </h3>
          
          {/* Existing links */}
          <div className="space-y-3 mb-6">
            {formData.socialLinks.map((link) => (
              <div key={link.id} className={`p-4 rounded-lg ${lightMode ? 'bg-white border border-gray-200' : 'bg-gray-700 border border-gray-600'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                      {link.label || link.platform}
                    </p>
                    <p className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                      {link.url}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSocialLink(link.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Icon Upload for this link */}
                <div className="mt-3">
                  <label className={labelClass}>Icon Image</label>
                  <div className="flex items-center gap-3">
                    {link.icon && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-400 flex-shrink-0">
                        <img 
                          src={link.icon} 
                          alt="Icon preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                      lightMode 
                        ? 'border-gray-300 hover:bg-gray-100' 
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}>
                      <Upload size={16} className="mr-2" />
                      <span className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        Upload icon
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSocialIconUpload(link.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add new link */}
          <div className={`p-4 rounded-lg border-2 border-dashed ${lightMode ? 'border-gray-300' : 'border-gray-600'}`}>
            <p className={`text-sm font-medium mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              Add New Link
            </p>
            <div className="space-y-3">
              <select
                value={newSocialLink.platform || 'github'}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value as SocialLink['platform'] })}
                className={inputClass}
              >
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="email">Email</option>
                <option value="twitter">Twitter / X</option>
                <option value="discord">Discord</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="website">Website</option>
                <option value="phone">Phone</option>
              </select>
              
              <input
                type="text"
                value={newSocialLink.url || ''}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                placeholder="URL or contact info"
                className={inputClass}
              />
              
              <input
                type="text"
                value={newSocialLink.label || ''}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, label: e.target.value })}
                placeholder="Label (optional)"
                className={inputClass}
              />

              {/* Icon upload for new link */}
              <div>
                <label className={labelClass}>Icon Image</label>
                <div className="flex items-center gap-3">
                  {newSocialLink.icon && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-400 flex-shrink-0">
                      <img 
                        src={newSocialLink.icon} 
                        alt="Icon preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    lightMode 
                      ? 'border-gray-300 hover:bg-gray-100' 
                      : 'border-gray-600 hover:bg-gray-700'
                  }`}>
                    <Upload size={16} className="mr-2" />
                    <span className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      Upload icon
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewSocialIconUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleAddSocialLink}
                disabled={!newSocialLink.platform || !newSocialLink.url}
                className={`w-full flex items-center justify-center gap-2 ${buttonClass} ${
                  (!newSocialLink.platform || !newSocialLink.url)
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : lightMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className={`p-4 rounded-lg ${lightMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h3 className={`text-lg font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            About This Portfolio Section
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Section Title</label>
              <input
                type="text"
                value={formData.aboutTitle}
                onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Section Content</label>
              <textarea
                value={formData.aboutContent}
                onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
                className={`${inputClass} resize-none h-32`}
                placeholder="Describe your portfolio..."
              />
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 ${buttonClass} bg-green-600 hover:bg-green-700 text-white`}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
