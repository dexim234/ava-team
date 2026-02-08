import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    where
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export interface AnalyticsReview {
    id: string
    sphere: string[] // Изменено на массив строк
    expertComment?: string
    importantDetails?: string
    deadline?: string // ISO date string
    links?: string[]
    createdBy: string
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
}

const COLLECTION_NAME = 'analytics'

export const getAnalyticsReviews = async (sphere?: string[]): Promise<AnalyticsReview[]> => { // Изменено на массив строк
    const analyticsRef = collection(db, COLLECTION_NAME)
    let q = query(analyticsRef, orderBy('createdAt', 'desc'))

    if (sphere && sphere.length > 0 && !sphere.includes('all')) { // Изменено для работы с массивом
        q = query(analyticsRef, where('sphere', 'array-contains-any', sphere), orderBy('createdAt', 'desc')) // Используем array-contains-any
    }

    // Если sphere содержит 'all' или пуст, то не добавляем фильтр по сфере
    if (sphere && sphere.includes('all')) {
        // не добавляем фильтр по сфере, потому что 'all' означает все
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as AnalyticsReview))
}

export const subscribeToAnalyticsReviews = (callback: (reviews: AnalyticsReview[]) => void, sphere?: string[]) => { // Изменено на массив строк
    const analyticsRef = collection(db, COLLECTION_NAME)
    let q = query(analyticsRef, orderBy('createdAt', 'desc'))

    if (sphere && sphere.length > 0 && !sphere.includes('all')) { // Изменено для работы с массивом
        q = query(analyticsRef, where('sphere', 'array-contains-any', sphere), orderBy('createdAt', 'desc')) // Используем array-contains-any
    }

    return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AnalyticsReview))
        callback(reviews)
    })
}

export const addAnalyticsReview = async (review: Omit<AnalyticsReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const analyticsRef = collection(db, COLLECTION_NAME)
    const now = new Date().toISOString()
    const result = await addDoc(analyticsRef, {
        ...review,
        createdAt: now,
        updatedAt: now
    })
    return result.id
}

export const updateAnalyticsReview = async (id: string, updates: Partial<AnalyticsReview>): Promise<void> => {
    const reviewRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(reviewRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    })
}

export const deleteAnalyticsReview = async (id: string): Promise<void> => {
    const reviewRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(reviewRef)
}
