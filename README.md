# Sublime Ultimate Team Website

This is the official website for Sublime Ultimate team, built with React, TypeScript, and Vite.

## Firebase Storage Image Handling

All image upload and display functionality follows these best practices to avoid CORS and 404 errors:

### Key Implementation Principles

1. **Always use Firebase's upload + getDownloadURL pattern:**
   - Upload files using `uploadBytes()` or `uploadString()`
   - **ALWAYS** get proper URLs using `getDownloadURL()`
   - Save complete URLs with auth tokens to Firestore
   - Never manually construct Storage URLs or paths

2. **Use proper error handling when displaying images:**
   - Use the `ImageWithFallback` component
   - Validate URLs have proper authentication tokens
   - Provide fallback images for error states

### Complete Image Upload Flow

```typescript
// Import the proper utility functions
import { uploadPlayerImage, uploadPlayerImageAndSave } from '../firebase/imageUtils';
import ImageWithFallback from '../components/ImageWithFallback';

// Upload function - returns authenticated URL
const handleImageUpload = async (file: File, playerId: string) => {
  try {
    // Option 1: Upload only and get download URL with auth token
    const downloadUrl = await uploadPlayerImage(file, playerId);
    
    // Verify URL has authentication tokens
    if (!downloadUrl.includes('token=')) {
      throw new Error('Invalid download URL - missing authentication token');
    }
    
    console.log("Image uploaded successfully. URL:", downloadUrl);
    
    // Save this URL to Firestore (not just the path)
    await updateDoc(doc(db, 'players', playerId), {
      image: downloadUrl
    });
    
    // Option 2: Upload and save to Firestore in one step
    // const downloadUrl = await uploadPlayerImageAndSave(file, playerId);
    
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading/saving image:", error);
    throw error;
  }
};
```

### Displaying Images Safely

Always use the `ImageWithFallback` component which:
- Handles loading errors gracefully
- Validates Firebase Storage URLs
- Provides fallbacks for invalid/missing images

```jsx
// Recommended: Use ImageWithFallback component
<ImageWithFallback 
  src={player.image} 
  alt={player.name}
  fallbackSrc="/placeholder.jpg"
  className="player-image"
/>

// Alternative: CSS background image approach (already used in Roster.tsx)
<div 
  className="player-photo" 
  style={{ backgroundImage: `url(${player.image})` }}
></div>
```

### Proper Firebase Storage URLs

Valid Firebase Storage URLs from `getDownloadURL()` look like:
```
https://firebasestorage.googleapis.com/v0/b/sublimewebsite20250326.appspot.com/o/images%2Fimage.jpg?alt=media&token=9a5f1a23-4b6c-4d7f-8d9e-1a2b3c4d5e6f
```

Critical components:
- Domain: `firebasestorage.googleapis.com`
- Parameter: `alt=media` (tells Firebase to return the file content)
- Parameter: `token=...` (provides authenticated access)

### CORS Configuration

The CORS configuration in `cors.json` limits access to specific origins:
- Firebase hosting domains: `sublimewebsite20250326.web.app` and `sublimewebsite20250326.firebaseapp.com`
- Local development servers: `localhost` ports 3000, 4000, 5000, 5173

Apply it with: 
```bash
gsutil cors set cors.json gs://sublimewebsite20250326.appspot.com
```

For complete setup instructions, see [FIREBASE_CORS_SETUP.md](./FIREBASE_CORS_SETUP.md).

### Example Implementation

For a complete working example, see [src/cms/PlayerImageUploadExample.tsx](./src/cms/PlayerImageUploadExample.tsx), which demonstrates:
- Two-step upload process (delayed vs. immediate)
- URL validation and error handling
- Integration with Firestore

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
