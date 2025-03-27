import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { storage, db } from "./config";
import { doc, setDoc } from "firebase/firestore";

/**
 * Uploads a player image file to Firebase Storage and returns the download URL
 */
export async function uploadPlayerImage(file: File, playerId: string): Promise<string> {
  try {
    const filePath = `players/player_${playerId}_${Date.now()}`;
    const fileRef = ref(storage, filePath);

    const snapshot = await uploadBytes(fileRef, file);
    console.log(`Upload complete! Bytes transferred: ${snapshot.metadata.size}`);

    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log("Image uploaded. Firebase Storage URL:", downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading player image:", error);
    throw error;
  }
}

/**
 * Saves a player image URL to Firestore
 */
export async function savePlayerImageUrl(playerId: string, downloadUrl: string): Promise<void> {
  try {
    // Using setDoc with merge:true will create the document if it doesn't exist
    // or update the specified fields if it does exist
    // First, ensure we're using the correct collection based on the website structure
    await setDoc(doc(db, "website", "players"), { 
      data: [{
        id: parseInt(playerId),
        image: downloadUrl
      }]
    }, { merge: true });
    console.log("Image URL saved to Firestore for player:", playerId);
  } catch (error) {
    console.error("Error saving player image URL to Firestore:", error);
    throw error;
  }
}

/**
 * Complete workflow to upload a player image and save the URL to Firestore
 */
export async function uploadPlayerImageAndSave(file: File, playerId: string): Promise<string> {
  try {
    // First check if we received a valid File object
    if (!(file instanceof File)) {
      throw new Error("Invalid file object provided. Must be a File instance.");
    }
    
    // Upload the image file to get a download URL
    const downloadUrl = await uploadPlayerImage(file, playerId);
    
    // Only proceed if we have a valid URL string
    if (typeof downloadUrl !== 'string' || !downloadUrl) {
      throw new Error("Failed to get a valid download URL");
    }
    
    // Save the URL to Firestore - never passing the File object directly
    await savePlayerImageUrl(playerId, downloadUrl);
    
    return downloadUrl;
  } catch (error) {
    console.error("Complete player image upload workflow failed:", error);
    throw error;
  }
}

export const uploadImageFile = async (file: File, path: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const uniquePath = path.includes('_') ? path : `${path}_${timestamp}`;
    const storageRef = ref(storage, uniquePath);

    const snapshot = await uploadBytes(storageRef, file);
    console.log(`File uploaded successfully to: ${uniquePath}`);

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL: ${downloadURL}`);

    try {
      const test = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`URL accessibility check: ${test.status}`);
    } catch (fetchError) {
      console.warn("Could not verify URL accessibility:", fetchError);
    }

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image file:", error);
    throw error;
  }
};

export const uploadImageDataUrl = async (dataUrl: string, path: string): Promise<string> => {
  try {
    if (!dataUrl.startsWith("data:")) throw new Error("Invalid data URL");

    const timestamp = Date.now();
    const uniquePath = path.includes('_') ? path : `${path}_${timestamp}`;
    const storageRef = ref(storage, uniquePath);

    const contentType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const base64Data = dataUrl.split(',')[1];

    const snapshot = await uploadString(storageRef, base64Data, 'base64', { contentType });
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("Base64 image uploaded. Download URL:", downloadURL);

    try {
      const test = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`URL accessibility check: ${test.status}`);
    } catch (fetchError) {
      console.warn("Could not verify URL accessibility:", fetchError);
    }

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image data URL:", error);
    throw error;
  }
};

export const getImageUrl = async (path: string): Promise<string> => {
  try {
    if (!path) throw new Error("No path provided");

    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Generated download URL for ${path}: ${downloadURL}`);

    try {
      const test = await fetch(downloadURL, { method: 'HEAD' });
      console.log(`URL accessibility check: ${test.status}`);
    } catch (fetchError) {
      console.warn("Could not verify URL accessibility:", fetchError);
    }

    return downloadURL;
  } catch (error) {
    console.error(`Error getting image URL for path ${path}:`, error);
    throw error;
  }
};

export const saveImageUrlToFirestore = async (
  collectionName: string,
  docId: string,
  fieldName: string,
  downloadURL: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { [fieldName]: downloadURL }, { merge: true });
    console.log(`Image URL saved to Firestore: ${collectionName}/${docId}.${fieldName}`);
  } catch (error) {
    console.error("Error saving image URL to Firestore:", error);
    throw error;
  }
};

export const makeImagePublic = async (storagePath: string): Promise<string> => {
  try {
    const imageRef = ref(storage, storagePath);
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`Public URL generated for ${storagePath}: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`Error making image public:`, error);
    throw error;
  }
};

export const uploadImageAndSaveUrl = async (
  file: File,
  storagePath: string,
  collectionName: string,
  docId: string,
  fieldName: string
): Promise<string> => {
  try {
    const downloadURL = await uploadImageFile(file, storagePath);
    await saveImageUrlToFirestore(collectionName, docId, fieldName, downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error in uploadImageAndSaveUrl workflow:", error);
    throw error;
  }
};

export const uploadDataUrlAndSaveUrl = async (
  dataUrl: string,
  storagePath: string,
  collectionName: string,
  docId: string,
  fieldName: string
): Promise<string> => {
  try {
    const downloadURL = await uploadImageDataUrl(dataUrl, storagePath);
    await saveImageUrlToFirestore(collectionName, docId, fieldName, downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error in uploadDataUrlAndSaveUrl workflow:", error);
    throw error;
  }
};
