# Firebase Storage CORS Configuration

This document explains how to fix CORS and 404 errors when working with Firebase Storage. The solution is to always use Firebase's `getDownloadURL()` method after uploading files and never manually construct Firebase Storage URLs.

## Key Principles for Working with Firebase Storage

1. **ALWAYS use `getDownloadURL()` to get image URLs** - Manual URL construction will fail
2. **ALWAYS save the full download URL with token to Firestore** - Not just the file path
3. **NEVER try to construct Firebase Storage URLs manually** - They require authentication tokens
4. **Use the `crossOrigin="anonymous"` attribute** on image tags where needed

## Configure CORS for Your Firebase Storage Bucket

### Option 1: Using Google Cloud SDK (Command Line) - Recommended

1. Install the Google Cloud SDK if you haven't already:
   ```
   curl https://sdk.cloud.google.com | bash
   ```

2. Log in with your Firebase account:
   ```
   firebase login
   ```

3. Run this command to apply the CORS configuration:
   ```
   gsutil cors set cors.json gs://sublimewebsite20250326.firebasestorage.app
   ```

### Option 2: Using Firebase/Google Cloud Console (Web UI)

If the command-line approach doesn't work, you can also set CORS through the Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to Cloud Storage > Buckets
4. Click on your bucket (usually named after your project)
5. Go to the "Permissions" tab
6. Look for "CORS configuration" and click "Edit"
7. Paste the contents of cors.json into the editor
8. Save your changes

## Proper Code for Uploading Images

1. **Upload the image using the Firebase SDK**:
   ```typescript
   const storageRef = ref(storage, `images/myImage_${Date.now()}`);
   await uploadBytes(storageRef, file);
   ```

2. **Get and save the proper download URL**:
   ```typescript
   // ✅ CORRECT: Use getDownloadURL after upload to get authenticated URL
   const downloadURL = await getDownloadURL(storageRef);
   
   // Save this URL to Firestore
   await updateDoc(docRef, { imageUrl: downloadURL });
   ```

3. **Use the saved URL in your components**:
   ```tsx
   // Just use the saved URL directly
   <img src={image.downloadURL} alt="My image" />
   
   // For better error handling, use an ImageWithFallback component
   <ImageWithFallback src={image.downloadURL} alt="My image" fallbackSrc="/placeholder.jpg" />
   ```

## Verification

To verify CORS is working correctly:

1. Upload an image using the website's admin interface
2. Check the Browser Console - there should be no CORS-related errors
3. Open the image in a new browser tab by clicking on it - it should load successfully

## How To Identify Problems

Here's how to identify and fix common Firebase Storage issues:

### Signs of Incorrect URL Construction:

- URLs without a token parameter (`token=`)
- URLs with only a file path
- 403 Forbidden or 404 Not Found errors
- CORS errors in the browser console

### Proper Firebase Storage URLs:

Correct Firebase Storage URLs from `getDownloadURL()` look like:
```
https://firebasestorage.googleapis.com/v0/b/sublimewebsite20250326.firebasestorage.app/o/images%2Fimage.jpg?alt=media&token=9a5f1a23-4b6c-4d7f-8d9e-1a2b3c4d5e6f
```

The important parts are:
- The `alt=media` parameter (tells Firebase to return the file, not metadata)
- The `token=...` parameter (provides authenticated access)

### Common Mistakes to Avoid:

❌ DO NOT manually construct URLs like:
```
https://firebasestorage.googleapis.com/v0/b/sublimewebsite20250326.firebasestorage.app/o?name=players/player_1
```

✅ DO use proper error handling in your components:
```tsx
<ImageWithFallback 
  src={imageUrl} 
  alt="Description"
  fallbackSrc="/placeholder.jpg"
/>
```
