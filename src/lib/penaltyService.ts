import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import type { ViolationRecord } from "./types";

const penaltiesCollection = collection(db, "penalties");

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): ViolationRecord => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        personName: data.personName,
        date: data.date,
        notes: data.notes,
        regulation: data.regulation,
        isCompleted: data.isCompleted || false,
    };
};

export const getPenalties = async (): Promise<ViolationRecord[]> => {
  const snapshot = await getDocs(penaltiesCollection);
  return snapshot.docs.map(fromFirestore).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addPenalty = async (penalty: Omit<ViolationRecord, 'id'>): Promise<ViolationRecord> => {
    const dataToSave = { ...penalty, isCompleted: false };
    const docRef = await addDoc(penaltiesCollection, dataToSave);
    return { id: docRef.id, ...dataToSave };
};

export const addMultiplePenalties = async (penalties: Omit<ViolationRecord, 'id'>[]): Promise<void> => {
    const batch = writeBatch(db);
    penalties.forEach(penalty => {
        const docRef = doc(penaltiesCollection);
        const dataToSave = { ...penalty, isCompleted: false };
        batch.set(docRef, dataToSave);
    });
    await batch.commit();
};


export const updatePenalty = async (id: string, data: Partial<Omit<ViolationRecord, 'id'>>): Promise<void> => {
    const penaltyDoc = doc(db, "penalties", id);
    await updateDoc(penaltyDoc, data);
};

export const deletePenalty = async (id: string): Promise<void> => {
    const penaltyDoc = doc(db, "penalties", id);
    await deleteDoc(penaltyDoc);
};
