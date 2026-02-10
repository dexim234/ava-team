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
    where,
    getDoc // Импортируем getDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export interface Rating {
    userId: string
    value: number // Оценка от 1 до 5
}

export interface AnalyticsReview {
    id: string
    number?: number // Порядковый номер для отображения
    sphere: string[] // Изменено на массив строк
    expertComment?: string
    importantDetails?: string
    deadline?: string // ISO date string
    links?: string[]
    asset?: string // Актив, под который делается аналитический разбор
    screenshot?: string // URL скриншота (base64)
    createdBy: string
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
    ratings?: Rating[] // Новое поле для оценок
}

const COLLECTION_NAME = 'analytics'

// Функция для получения следующего свободного номера
const getNextFreeNumber = async (): Promise<number> => {
    const analyticsRef = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(analyticsRef)

    const usedNumbers = new Set<number>()
    snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.number !== undefined) {
            usedNumbers.add(data.number)
        }
    })

    // Находим минимальный свободный номер
    let nextNumber = 1
    while (usedNumbers.has(nextNumber)) {
        nextNumber++
    }

    return nextNumber
}

export const getAnalyticsReviews = async (sphere?: string[]): Promise<AnalyticsReview[]> => {
    const analyticsRef = collection(db, COLLECTION_NAME)
    let q = query(analyticsRef, orderBy('createdAt', 'desc'))

    if (sphere && sphere.length > 0 && !sphere.includes('all')) {
        q = query(analyticsRef, where('sphere', 'array-contains-any', sphere), orderBy('createdAt', 'desc'))
    }

    if (sphere && sphere.includes('all')) {
        
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }) as AnalyticsReview)
}

export const getAnalyticsReviewById = async (id: string): Promise<AnalyticsReview | null> => {
    const reviewRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(reviewRef)

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as AnalyticsReview
    } else {
        return null
    }
}

export const subscribeToAnalyticsReviews = (callback: (reviews: AnalyticsReview[]) => void, sphere?: string[]) => {
    const analyticsRef = collection(db, COLLECTION_NAME)
    let q = query(analyticsRef, orderBy('createdAt', 'desc'))

    if (sphere && sphere.length > 0 && !sphere.includes('all')) {
        q = query(analyticsRef, where('sphere', 'array-contains-any', sphere), orderBy('createdAt', 'desc'))
    }

    return onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }) as AnalyticsReview)
        callback(reviews)
    })
}

export const addAnalyticsReview = async (review: Omit<AnalyticsReview, 'id' | 'createdAt' | 'updatedAt' | 'number'>): Promise<string> => {
    const analyticsRef = collection(db, COLLECTION_NAME)
    const now = new Date().toISOString()
    const nextNumber = await getNextFreeNumber()
    const result = await addDoc(analyticsRef, {
        ...review,
        number: nextNumber,
        createdAt: now,
        updatedAt: now,
        ratings: [] // Инициализируем массив оценок при создании
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

// Функция для добавления или обновления оценки
export const addOrUpdateReviewRating = async (reviewId: string, userId: string, ratingValue: number): Promise<void> => {
    const reviewRef = doc(db, COLLECTION_NAME, reviewId);
    const docSnap = await getDoc(reviewRef);

    if (docSnap.exists()) {
        const currentReview = docSnap.data() as AnalyticsReview;
        const currentRatings = currentReview.ratings || [];

        const existingRatingIndex = currentRatings.findIndex(r => r.userId === userId);

        let newRatings: Rating[];

        if (existingRatingIndex !== -1) {
            // Обновить существующую оценку
            newRatings = currentRatings.map((r, index) =>
                index === existingRatingIndex ? { ...r, value: ratingValue } : r
            );
        } else {
            // Добавить новую оценку
            newRatings = [...currentRatings, { userId, value: ratingValue }];
        }

        await updateDoc(reviewRef, { ratings: newRatings, updatedAt: new Date().toISOString() });
    } else {
        throw new Error("Аналитический обзор не найден");
    }
};