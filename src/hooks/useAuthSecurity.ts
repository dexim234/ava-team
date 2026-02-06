import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/authStore'

export const useAuthSecurity = () => {
    const { user, isAuthenticated, logout } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return

        // Create a listener for the current user's document in Firestore
        const userRef = doc(db, 'users', user.id)

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.data()

                // If the login or password has changed in Firestore, 
                // it means the session is no longer valid.
                const loginChanged = userData.login !== user.login
                const passwordChanged = userData.password !== user.password
                const recoveryCodeChanged = userData.recoveryCode !== user.recoveryCode

                if (loginChanged || passwordChanged || recoveryCodeChanged) {
                    console.log('Security check failed: credentials changed. Logging out.')
                    logout()
                }
            } else {
                // If user document was deleted from Firestore, also log out
                console.log('Security check failed: user document deleted. Logging out.')
                logout()
            }
        }, (error) => {
            console.error('Auth security listener error:', error)
        })

        return () => unsubscribe()
    }, [isAuthenticated, user?.id, user?.login, user?.password, user?.recoveryCode, logout])
}
