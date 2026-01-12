// src/firebase/firestore.js
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { app } from "./config";

// Initialize Firestore
const db = getFirestore(app);

//
// 🔹 GENERIC HELPERS — You can reuse these for any collection
//

// ➕ Add new document
export const addData = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
  }
};

// 📖 Get all documents from a collection
export const getData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents:", error);
  }
};

// ✏️ Update a document by ID
export const updateData = async (collectionName, id, updatedFields) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedFields);
    console.log("Document updated:", id);
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

// ❌ Delete a document by ID
export const deleteData = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log("Document deleted:", id);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

export { db };
