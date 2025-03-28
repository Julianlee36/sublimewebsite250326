import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { storage, db } from "./config";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Uploads a player image file to Firebase Storage and returns the download URL
 * @param file The file to upload
 * @param playerId The player ID to use in the path
 * @returns Promise with the download URL for the uploaded image
 */
export async function uploadPlayerImage(file: File, playerId: string): Promise<string> {
  try {
    const filePath = `players/player_${playerId}_${Date.now()}`;
    const fileRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    console.log(`Upload complete! Bytes transferred: ${snapshot.metadata.size}`);
    
    // Get the download URL - this is essential to avoid CORS and 404 errors
    const downloadUrl = await getDownloadURL(snapshot.ref); // Use snapshot.ref to ensure we get the URL for the exact file
    console.log("Image uploaded. Firebase Storage URL:", downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading player image:", error);
    throw error;
  }
}

/**
 * Saves a player image URL to Firestore
 * @param playerId ID of the player document
 * @param downloadUrl The download URL from Firebase Storage
 */
export async function savePlayerImageUrl(playerId: string, downloadUrl: string): Promise<void> {
  try {
    await updateDoc(doc(db, "players", playerId), {
      image: downloadUrl
    });
    console.log("Image URL saved to Firestore for player:", playerId);
  } catch (error) {
    console.error("Error saving player image URL to Firestore:", error);
    throw error;
  }
}

/**
 * Complete workflow to upload a player image and save the URL to Firestore
 * @param file The file to upload
 * @param playerId ID of the player document
 * @returns Promise with the download URL
 */
export async function uploadPlayerImageAndSave(file: File, playerId: string): Promise<string> {
  try {
    // Step 1: Upload image to Storage
    const downloadUrl = await uploadPlayerImage(file, playerId);
    
    // Step 2: Save URL to Firestore
    await savePlayerImageUrl(playerId, downloadUrl);
    
    return downloadUrl;
  } catch (error) {
    console.error("Complete player image upload workflow failed:", error);
    throw error;
  }
}

/**
 * Uploads an image file to Firebase Storage and returns the download URL
 * @param file The file to upload
 * @param path The path in Firebase Storage to upload to (e.g., 'players/player_1.jpg')
 * @returns Promise with the download URL for the uploaded image
 */
export const uploadImageFile = async (file: File, path: string): Promise<string> => {
  try {
    // Add timestamp to ensure uniqueness and avoid cache issues
    const timestamp = Date.now();
    const uniquePath = path.includes('_') ? path : `${path}_${timestamp}`;
    
    // Create a storage reference - using the default bucket from config.ts
    const storageRef = ref(storage, uniquePath);
    
    // Upload the file directly using uploadBytes
    const snapshot = await uploadBytes(storageRef, file);
    console.log(`File uploaded successfully. Size: ${file.size} bytes to path: ${uniquePath}`);
    
    // Get download URL from Firebase (using the proper method to ensure auth tokens)
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL obtained: ${downloadURL}`);
    
    // Verify URL accessibility
    try {
      const testRequest = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`Image URL accessibility check: ${testRequest.status} ${testRequest.statusText}`);
      if (!testRequest.ok) {
        console.warn(`Warning: The uploaded image URL might not be accessible: ${testRequest.status}`);
      }
    } catch (fetchError) {
      console.warn(`Warning: Could not verify URL accessibility: ${fetchError}`);
      // Continue despite the warning - the URL might still work in the browser
    }
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image file:", error);
    throw error;
  }
};

/**
 * Uploads a base64/data URL image to Firebase Storage and returns the download URL
 * @param dataUrl The base64/data URL string to upload
 * @param path The path in Firebase Storage to upload to (e.g., 'players/player_1.jpg')
 * @returns Promise with the download URL for the uploaded image
 */
export const uploadImageDataUrl = async (dataUrl: string, path: string): Promise<string> => {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new Error('Invalid data URL');
    }
    
    // Ensure we have a unique path with timestamp
    const timestamp = Date.now();
    const uniquePath = path.includes('_') ? path : `${path}_${timestamp}`;
    const storageRef = ref(storage, uniquePath);
    
    // Extract the content type and base64 data from the dataUrl
    const contentType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const base64Data = dataUrl.split(',')[1];
    
    // Upload the base64 string directly using uploadString
    console.log(`Uploading image to path: ${uniquePath}`);
    const snapshot = await uploadString(storageRef, base64Data, 'base64', { contentType });
    console.log(`Image uploaded successfully using uploadString`);
    
    // Get download URL (this is crucial - always use the URL provided by Firebase)
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL obtained: ${downloadURL}`);
    
    // Log the full URL details for debugging
    console.log(`Image URL details:
      - Storage path: ${uniquePath}
      - Full download URL: ${downloadURL}
      - URL contains token: ${downloadURL.includes('token=')}
      - URL has alt=media param: ${downloadURL.includes('alt=media')}
    `);
    
    // Verify URL accessibility by attempting to fetch it
    try {
      const testRequest = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`Image URL accessibility check: ${testRequest.status} ${testRequest.statusText}`);
      if (!testRequest.ok) {
        console.warn(`Warning: The uploaded image URL might not be accessible: ${testRequest.status}`);
      }
    } catch (fetchError) {
      console.warn(`Warning: Could not verify URL accessibility: ${fetchError}`);
      // Continue despite the warning - the URL might still work in the browser
    }
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image data URL:", error);
    throw error;
  }
};

/**
 * Gets the download URL for an image in Firebase Storage
 * @param path The path to the image in Firebase Storage
 * @returns Promise with the download URL
 */
export const getImageUrl = async (path: string): Promise<string> => {
  try {
    if (!path) throw new Error('No path provided to getImageUrl');
    
    // Create a reference to the file
    const storageRef = ref(storage, path);
    
    // Get a proper download URL that includes auth token (not a manual path)
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Generated authorized download URL for ${path}:`, downloadURL);
    
    // Verify URL accessibility
    try {
      const testRequest = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`URL accessibility check: ${testRequest.status} ${testRequest.statusText}`);
      if (!testRequest.ok) {
        console.warn(`Warning: The URL might not be accessible: ${testRequest.status}`);
      }
    } catch (fetchError) {
      console.warn(`Could not verify URL accessibility: ${fetchError}`);
      // Continue despite the warning - the URL might still work in the browser
    }
    
    return downloadURL;
  } catch (error) {
    console.error(`Error getting image URL for path ${path}:`, error);
    throw error;
  }
};

/**
 * Saves an image to Firestore with its download URL
 * @param collectionName The collection name in Firestore (e.g., 'players', 'events')
 * @param docId The document ID to update
 * @param fieldName The field in the document to store the image URL
 * @param downloadURL The download URL returned by getDownloadURL
 */
export const saveImageUrlToFirestore = async (
  collectionName: string, 
  docId: string, 
  fieldName: string, 
  downloadURL: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      [fieldName]: downloadURL
    });
    console.log(`Image URL saved to Firestore: ${collectionName}/${docId}.${fieldName}`);
  } catch (error) {
    console.error("Error saving image URL to Firestore:", error);
    throw error;
  }
};

/**
 * Makes an image publicly accessible in Firebase Storage
 * This automatically happens through our storage.rules configuration
 * @param storagePath The path to the image in Firebase Storage
 * @returns Promise with the public download URL
 */
export const makeImagePublic = async (storagePath: string): Promise<string> => {
  try {
    // Create a reference to the file
    const imageRef = ref(storage, storagePath);
    
    // Get a download URL - Firebase Storage security rules control the access
    // The image will be publicly accessible if the storage rules permit it
    const downloadURL = await getDownloadURL(imageRef);
    
    console.log(`Public URL generated for ${storagePath}`, downloadURL);
    return downloadURL;
  } catch (error) {
    console.error(`Error making image public at path ${storagePath}:`, error);
    throw error;
  }
};

/**
 * Complete workflow to upload an image and save its URL to Firestore
 * @param file The file to upload
 * @param storagePath The path in Firebase Storage to upload to
 * @param collectionName The collection name in Firestore
 * @param docId The document ID to update
 * @param fieldName The field in the document to store the image URL
 * @returns Promise with the download URL for the uploaded image
 */
export const uploadImageAndSaveUrl = async (
  file: File,
  storagePath: string,
  collectionName: string,
  docId: string,
  fieldName: string
): Promise<string> => {
  try {
    // 1. Upload the image to Firebase Storage
    const downloadURL = await uploadImageFile(file, storagePath);
    
    // 2. Save the download URL to Firestore
    await saveImageUrlToFirestore(collectionName, docId, fieldName, downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error in uploadImageAndSaveUrl workflow:", error);
    throw error;
  }
};

/**
 * Complete workflow to upload a data URL image and save its URL to Firestore
 * @param dataUrl The base64/data URL string to upload
 * @param storagePath The path in Firebase Storage to upload to
 * @param collectionName The collection name in Firestore
 * @param docId The document ID to update
 * @param fieldName The field in the document to store the image URL
 * @returns Promise with the download URL for the uploaded image
 */
export const uploadDataUrlAndSaveUrl = async (
  dataUrl: string,
  storagePath: string,
  collectionName: string,
  docId: string,
  fieldName: string
): Promise<string> => {
  try {
    // 1. Upload the image to Firebase Storage
    const downloadURL = await uploadImageDataUrl(dataUrl, storagePath);
    
    // 2. Save the download URL to Firestore
    await saveImageUrlToFirestore(collectionName, docId, fieldName, downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error in uploadDataUrlAndSaveUrl workflow:", error);
    throw error;
  }
};