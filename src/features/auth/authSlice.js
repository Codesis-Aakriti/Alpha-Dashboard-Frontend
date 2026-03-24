import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

// Helper to extract a user-friendly error string from various backend formats
const extractErrorMessage = (errorData) => {
    if (typeof errorData === 'string') return errorData
    if (!errorData || typeof errorData !== 'object') return 'An unexpected error occurred'

    // 1. Check for the common 'detail' key (DRF standard)
    if (errorData.detail) return errorData.detail

    // 2. Check for 'non_field_errors' (DRF standard for general errors)
    if (Array.isArray(errorData.non_field_errors)) return errorData.non_field_errors[0]

    // 3. Fallback: Take the first error from any field object
    const firstKey = Object.keys(errorData)[0]
    if (firstKey) {
        const fieldError = errorData[firstKey]
        if (Array.isArray(fieldError)) return fieldError[0]
        if (typeof fieldError === 'string') return fieldError
    }

    return 'An unexpected error occurred'
}

// Async Thunks
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            Object.keys(userData).forEach((key) => {
                if (userData[key] !== undefined && userData[key] !== null) {
                    formData.append(key, userData[key])
                }
            })
            const response = await api.post('/auth/register/', formData)
            return response.data
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const formData = new FormData()
            Object.keys(credentials).forEach((key) => {
                if (credentials[key] !== undefined && credentials[key] !== null) {
                    formData.append(key, credentials[key])
                }
            })
            const response = await api.post('/auth/login/', formData)
            return response.data
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

export const getKycLink = createAsyncThunk(
    'auth/getKycLink',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/veriff/get-link/')
            return response.data
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

const initialState = {
    user: null,
    idToken: localStorage.getItem('idToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    uid: localStorage.getItem('uid') || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    kycLink: null,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.idToken = null
            state.refreshToken = null
            state.uid = null
            state.kycLink = null
            localStorage.removeItem('idToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('uid')
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.user = action.payload
                state.idToken = action.payload.idToken
                state.refreshToken = action.payload.refreshToken
                state.uid = action.payload.uid

                if (action.payload.idToken) localStorage.setItem('idToken', action.payload.idToken)
                if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken)
                if (action.payload.uid) localStorage.setItem('uid', action.payload.uid)
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.user = action.payload
                state.idToken = action.payload.idToken
                state.refreshToken = action.payload.refreshToken
                state.uid = action.payload.uid

                if (action.payload.idToken) localStorage.setItem('idToken', action.payload.idToken)
                if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken)
                if (action.payload.uid) localStorage.setItem('uid', action.payload.uid)
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // KYC Link
            .addCase(getKycLink.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(getKycLink.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.kycLink = action.payload.url // Assuming response is { url: '...' }
            })
            .addCase(getKycLink.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
