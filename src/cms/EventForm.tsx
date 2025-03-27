import React, { useState } from 'react';
import { Event } from './DataContext';
import { uploadImageFile } from '../firebase/imageUtils';
import ImageWithFallback from '../components/ImageWithFallback';

interface EventFormProps {
  event: Event;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (imageUrl: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * Form component for creating and editing events
 * Uses Firebase Storage for image uploads and saves URLs with authentication tokens
 */
const EventForm: React.FC<EventFormProps> = ({ event, onInputChange, onImageUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handles file input change for event images
   * Uploads image to Firebase Storage and returns authenticated download URL
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setErrorMessage(null);
      
      try {
        const file = e.target.files[0];
        
        // Create a unique path for the image using event ID and timestamp
        const imagePath = `events/event_${event.id}_${Date.now()}`;
        
        // Upload the image and get authenticated download URL
        console.log(`Uploading event image to: ${imagePath}`);
        const imageUrl = await uploadImageFile(file, imagePath);
        
        // Verify we got a proper Firebase Storage URL with auth token
        if (!imageUrl.includes('token=')) {
          throw new Error('Invalid image URL received from Firebase Storage');
        }
        
        console.log(`Successfully uploaded image. URL (with auth token): ${imageUrl}`);
        
        // Pass the authenticated URL back to parent component to save in Firestore
        onImageUpload(imageUrl);
        
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="edit-form">
      <div className="form-group">
        <label>Title:</label>
        <input 
          type="text" 
          name="title" 
          value={event.title} 
          onChange={onInputChange} 
          placeholder="Tournament name or event title"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Date:</label>
        <input 
          type="date" 
          name="date" 
          value={event.date} 
          onChange={onInputChange} 
          required
        />
      </div>
      
      <div className="form-group">
        <label>Location:</label>
        <input 
          type="text" 
          name="location" 
          value={event.location} 
          onChange={onInputChange} 
          placeholder="Event venue or field name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description:</label>
        <textarea 
          name="description" 
          value={event.description} 
          onChange={onInputChange} 
          rows={3} 
          placeholder="Tournament details, competing teams, format, etc."
          required
        />
      </div>
      
      <div className="form-group">
        <label>Event Type:</label>
        <select 
          name="type" 
          value={event.type} 
          onChange={onInputChange}
          required
        >
          <option value="upcoming">Upcoming Event</option>
          <option value="current">Current Event</option>
          <option value="past">Past Event</option>
        </select>
      </div>

      <div className="form-group">
        <label>Event Image:</label>
        <input 
          type="file" 
          name="eventImage" 
          onChange={handleImageChange}
          accept="image/*"
          disabled={uploading}
        />
        {uploading && <p className="upload-status">Uploading image... Please wait.</p>}
        {errorMessage && <p className="upload-error">{errorMessage}</p>}
        
        {event.image && (
          <div className="image-preview">
            <p>Current image:</p>
            <ImageWithFallback 
              src={event.image} 
              alt="Event preview" 
              fallbackSrc="/placeholder-event.jpg"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
            />
          </div>
        )}
      </div>
      
      {(event.type === 'past' || event.type === 'current') && (
        <div className="form-group">
          <label>{event.type === 'current' ? 'Current Standing:' : 'Result:'}</label>
          <input 
            type="text" 
            name="result" 
            value={event.result || ''} 
            onChange={onInputChange} 
            placeholder={event.type === 'current' ? "e.g., 'In Group Stage', 'Won 2, Lost 1', etc." : "e.g., '1st Place', '3-2 Record', etc."}
          />
        </div>
      )}
      
      <div className="form-group">
        <label>Livestream Link (optional):</label>
        <input 
          type="url" 
          name="livestreamLink" 
          value={event.livestreamLink || ''} 
          onChange={onInputChange} 
          placeholder="https://livestream-url.com"
        />
      </div>

    </div>
  );
};

export default EventForm;