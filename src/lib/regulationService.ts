import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { Regulation } from "./types";

const regulationsCollection = collection(db, "regulations");

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Regulation | null => {
    const data = snapshot.data();
    if (!data) {
        return null; // Return null if document data doesn't exist
    }
    // Filter out invalid regulations that might have been created due to previous bugs
    if (!data.category || !data.violation) {
        return null;
    }
    return {
        id: snapshot.id,
        category: data.category,
        violation: data.violation,
        penalty: data.penalty,
    };
};

export const getRegulations = async (): Promise<Regulation[]> => {
  const snapshot = await getDocs(regulationsCollection);
  // Filter out any null results before returning
  return snapshot.docs.map(fromFirestore).filter((reg): reg is Regulation => reg !== null);
};

export const addRegulation = async (regulation: Omit<Regulation, 'id'>): Promise<Regulation> => {
    const docRef = await addDoc(regulationsCollection, regulation);
    return { id: docRef.id, ...regulation };
};

export const updateRegulation = async (id: string, regulation: Partial<Omit<Regulation, 'id'>>): Promise<void> => {
    const regulationDoc = doc(db, "regulations", id);
    await updateDoc(regulationDoc, regulation);
};

export const deleteRegulation = async (id: string): Promise<void> => {
    const regulationDoc = doc(db, "regulations", id);
    await deleteDoc(regulationDoc);
};
