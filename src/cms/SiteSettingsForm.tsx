import React, { useState, useRef } from 'react';
import { SiteSettings } from './DataContext';
import { uploadImageToStorage } from '../firebase/config';

interface SiteSettingsFormProps {
  settings: SiteSettings;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSettingsChange: (updatedSettings: Partial<SiteSettings>) => void;
  _onSave?: () => void;
  _onCancel?: () => void;
}

const SiteSettingsForm: React.FC<SiteSettingsFormProps> = ({
  settings,
  onInputChange,
  onSettingsChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      try {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          // Convert image to base64 data URL
          const base64String = reader.result as string;
          
          try {
            // Upload to Firebase Storage using our helper
            const fileName = `images/hero-background-${Date.now()}`;
            const downloadURL = await uploadImageToStorage(base64String, fileName);
            
            // Store the URL for production
            onSettingsChange({
              heroBackgroundImage: downloadURL
            });
            
            // Also store the base64 in localStorage for quick local preview
            localStorage.setItem('heroImageBase64', base64String);
            
          } catch (error) {
            console.error('Error uploading to Firebase Storage:', error);
            // Fall back to using just the base64 version
            onSettingsChange({
              heroBackgroundImage: base64String
            });
          }
          
          setIsUploading(false);
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error in image upload:', error);
        setIsUploading(false);
      }
    }
  };
  
  const handleRemoveImage = () => {
    onSettingsChange({
      heroBackgroundImage: ''
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="edit-form">
      <h3>Hero Banner Settings</h3>
      
      <div className="form-group">
        <label>Hero Title:</label>
        <input 
          type="text" 
          name="heroTitle" 
          value={settings.heroTitle} 
          onChange={onInputChange} 
          placeholder="Main headline for hero banner"
        />
      </div>
      
      <div className="form-group">
        <label>Hero Subtitle:</label>
        <input 
          type="text" 
          name="heroSubtitle" 
          value={settings.heroSubtitle} 
          onChange={onInputChange} 
          placeholder="Supporting text below the title"
        />
      </div>
      
      <div className="form-group">
        <label>Call-to-Action Text:</label>
        <input 
          type="text" 
          name="heroCtaText" 
          value={settings.heroCtaText} 
          onChange={onInputChange} 
          placeholder="Text for the button"
        />
      </div>
      
      <div className="form-group">
        <label>Call-to-Action Link:</label>
        <input 
          type="text" 
          name="heroCtaLink" 
          value={settings.heroCtaLink} 
          onChange={onInputChange} 
          placeholder="/about"
        />
        <small className="input-help">
          Enter a relative URL path like "/about" or "/contact"
        </small>
      </div>
      
      <div className="form-group">
        <label>Hero Background Image:</label>
        <div className="file-upload-container">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload} 
            accept="image/*"
            id="hero-image-upload"
            className="file-input"
          />
          <label htmlFor="hero-image-upload" className="file-upload-button">
            {isUploading ? 'Uploading...' : 'Choose Image'}
          </label>
          {settings.heroBackgroundImage && (
            <button 
              type="button" 
              onClick={handleRemoveImage}
              className="remove-image-btn"
            >
              Remove Image
            </button>
          )}
        </div>
        <small className="input-help">
          Upload an image for the hero banner background. 
          Recommended size: 1920x800 pixels or similar ratio.
          Leave empty to use the default gradient background.
        </small>
      </div>
      
      <div className="form-group background-preview">
        <label>Background Preview:</label>
        <div 
          className="image-preview" 
          style={{ 
            backgroundImage: settings.heroBackgroundImage ? 
              `url(${settings.heroBackgroundImage})` : 
              'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
          }}
        >
          <div className="preview-overlay">
            <div className="preview-content">
              <h4>{settings.heroTitle || 'Title'}</h4>
              <p>{settings.heroSubtitle || 'Subtitle'}</p>
              <button>{settings.heroCtaText || 'Button'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsForm;