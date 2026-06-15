/**
 * AuthContext — React context for authentication state management.
 * Provides user info, login/signup/logout methods, and role checks.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)    // initial auth check
  const [authLoading, setAuthLoading] = useState(false) // action in progress

  // Check session on mount
  useEffect(() => {
    let cancelled = false
    async function checkAuth() {
      try {
        const data = await authApi.me()
        if (!cancelled && data.authenticated) {
          setUser(data.user)
        }
      } catch {
        // Not authenticated
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  const signup = useCallback(async (email, dli_number, password, confirm_password) => {
    setAuthLoading(true)
    try {
      const data = await authApi.signup({ email, dli_number, password, confirm_password })
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const signin = useCallback(async (identifier, password) => {
    setAuthLoading(true)
    try {
      const data = await authApi.signin({ identifier, password })
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  const forgotPassword = useCallback(async (email) => {
    setAuthLoading(true)
    try {
      const data = await authApi.forgotPassword({ email })
      return { success: true, message: data.message, email: data.email }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email, code, new_password, confirm_password) => {
    setAuthLoading(true)
    try {
      const data = await authApi.resetPassword({ email, code, new_password, confirm_password })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    authLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin,
    signup,
    signin,
    logout,
    forgotPassword,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
