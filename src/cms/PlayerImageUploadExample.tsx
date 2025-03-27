import React, { useState } from 'react';
// We're importing only the functions we need
import { uploadPlayerImage } from '../firebase/imageUtils';
import ImageWithFallback from '../components/ImageWithFallback';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  image?: string;
}

interface PlayerFormProps {
  player: Player;
  onSave: (updatedPlayer: Player) => Promise<void>;
}

/**
 * Example component demonstrating the proper way to handle Firebase Storage image uploads
 * This form shows best practices for:
 * 1. Uploading images to Firebase Storage
 * 2. Getting proper download URLs with auth tokens
 * 3. Saving those URLs to Firestore
 * 4. Using the ImageWithFallback component for display
 */
const PlayerImageUploadExample: React.FC<PlayerFormProps> = ({ player, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(player.image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  /**
   * Method 1: Handles file selection and shows a preview, but doesn't upload yet
   * The actual upload happens when the form is submitted
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for display only
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };
  
  /**
   * Method 2: Upload the image immediately when selected
   * This is an alternative to the first approach
   */
  const handleInstantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      try {
        const file = e.target.files[0];
        
        // Approach 1: Upload only
        const imageUrl = await uploadPlayerImage(file, player.id);
        
        // Verify URL has proper authentication token
        if (!imageUrl.includes('token=')) {
          throw new Error('Invalid image URL received - missing authentication token');
        }
        
        // Show preview and store for later save
        setImagePreview(imageUrl);
        setSuccessMessage("Image uploaded successfully!");
        
        // Note: We don't auto-save to Firestore here - that happens on form submit
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  /**
   * Submit handler that demonstrates both upload approaches
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      const number = parseInt(formData.get('number') as string);
      const position = formData.get('position') as string;
      
      let finalImageUrl = player.image; // Default to existing image
      
      // If we have a new image file to upload
      if (imageFile) {
        // Option 1: Upload image and get URL
        finalImageUrl = await uploadPlayerImage(imageFile, player.id);
        
        // Option 2: Upload and save to Firestore in one step
        // This option directly updates the 'image' field in the player document
        // const finalImageUrl = await uploadPlayerImageAndSave(imageFile, player.id);
      }
      
      // Create updated player object - IMPORTANT: Don't include the File object in the Firestore document
      const updatedPlayer: Player = {
        ...player,
        name,
        number,
        position,
        image: finalImageUrl,
      };
      
      // Important: Make sure image is a string URL, not a File object
      // Firestore will reject documents containing File objects with error:
      // "Function setDoc() called with invalid data. Unsupported field value: a custom File object"
      
      // Call parent component's save method
      await onSave(updatedPlayer);
      
      // Clear file input and show success message
      setSuccessMessage('Player saved successfully!');
      setImageFile(null);
      
    } catch (error) {
      console.error('Error saving player:', error);
      setErrorMessage('Failed to save player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="player-form-container">
      <h2>Player Form Example</h2>
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Player Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            defaultValue={player.name} 
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="number">Jersey Number:</label>
          <input 
            type="number" 
            id="number" 
            name="number" 
            defaultValue={player.number} 
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="position">Position:</label>
          <input 
            type="text" 
            id="position" 
            name="position" 
            defaultValue={player.position} 
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Player Image:</label>
          <p className="form-help">
            Select an image to upload. The file will be uploaded to Firebase Storage when you save the form.
          </p>
          <input 
            type="file" 
            id="image" 
            name="image" 
            accept="image/*" 
            onChange={handleImageSelect}
            disabled={isLoading}
          />
        </div>
        
        {/* Alternative method with instant upload */}
        <div className="form-group">
          <label htmlFor="instant-image">Instant Upload Image:</label>
          <p className="form-help">
            This option uploads to Firebase immediately when selected.
          </p>
          <input 
            type="file" 
            id="instant-image" 
            name="instant-image" 
            accept="image/*" 
            onChange={handleInstantImageUpload}
            disabled={isLoading}
          />
        </div>
        
        {/* Image preview */}
        {imagePreview && (
          <div className="image-preview">
            <h3>Image Preview:</h3>
            <ImageWithFallback 
              src={imagePreview} 
              alt={`${player.name} preview`} 
              fallbackSrc="/placeholder-player.jpg"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
            />
            <p className="image-url-info">
              Using Firebase Storage URL with authentication token
            </p>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Player'}
          </button>
        </div>
      </form>
      
      {/* Technical notes for developers (optional section) */}
      <div className="technical-notes">
        <h3>Technical Implementation Notes:</h3>
        <ul>
          <li>
            <strong>Two-step upload process:</strong> First uploadBytes(), then getDownloadURL() 
            to get authenticated URL
          </li>
          <li>
            <strong>Full workflow function:</strong> uploadPlayerImageAndSave() handles both upload 
            and Firestore update
          </li>
          <li>
            <strong>ImageWithFallback component:</strong> Handles errors and validates Firebase Storage 
            URLs have token parameters
          </li>
          <li>
            <strong>URL validation:</strong> Check that URL includes 'token=' parameter to ensure it's 
            a properly authenticated Firebase Storage URL
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PlayerImageUploadExample;