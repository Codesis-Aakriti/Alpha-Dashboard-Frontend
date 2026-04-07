import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

// Helper to extract a user-friendly error string from various backend formats
const extractErrorMessage = (errorData) => {
    if (typeof errorData === 'string') {
        const trimmed = errorData.trim()
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
            return 'Something went wrong. Please try again later.'
        }
        return errorData
    }
    if (!errorData || typeof errorData !== 'object') return 'An unexpected error occurred'

    // 1. Check for the common 'detail' key (DRF standard)
    if (errorData.detail) {
        if (typeof errorData.detail === 'string' && errorData.detail.trim().startsWith('<!DOCTYPE')) {
            return 'Something went wrong. Please try again later.'
        }
        return errorData.detail
    }

    // 2. Check for 'error' key (Common in some endpoints)
    if (errorData.error) return errorData.error

    // 3. Check for 'non_field_errors' (DRF standard for general errors)
    if (Array.isArray(errorData.non_field_errors)) return errorData.non_field_errors[0]

    // 4. Fallback: Take the first error from any field object
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
            const response = await api.post('/auth/register/', userData)
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
            const response = await api.post('/auth/login/', credentials)
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

export const uploadStudentDoc = createAsyncThunk(
    'auth/uploadStudentDoc',
    async (params, { getState, rejectWithValue }) => {
        try {
            const state = getState()
            const userId = parseInt(state.auth.id, 10)
            const { document_type, document, ut_eid } = params
            if (document_type === 'ut_eid') {
                const payload = {
                    user: userId,
                    document_type,
                    ut_eid
                }
                const response = await api.post('/competition/kyb/student/upload/', payload)
                return response.data
            } else {
                const formData = new FormData()
                formData.append('document_type', document_type)
                if (document) {
                    formData.append('document', document)
                }
                if (userId) {
                    formData.append('user', userId)
                }

                const response = await api.post('/competition/kyb/student/upload/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                return response.data
            }
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

export const getKycDecision = createAsyncThunk(
    'auth/getKycDecision',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/veriff/get-decision/')
            return response.data
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

export const getStudentDocStatus = createAsyncThunk(
    'auth/getStudentDocStatus',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/competition/kyb/student/document/status/?user_id=${userId}`)
            return response.data
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error.response?.data) || error.message)
        }
    }
)

const initialState = {
    user: null,
    id: localStorage.getItem('userId') || null,
    idToken: localStorage.getItem('idToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    uid: localStorage.getItem('uid') || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    kycLink: null,
    kyb_id: null,
    kybStatus: null,
    kycDecision: null,
    studentDocStatus: null,
    registrationMessage: null,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.id = null
            state.idToken = null
            state.refreshToken = null
            state.uid = null
            state.kycLink = null
            localStorage.removeItem('userId')
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
                state.id = action.payload.id
                state.idToken = action.payload.idToken
                state.refreshToken = action.payload.refreshToken
                state.uid = action.payload.uid
                state.registrationMessage = action.payload.detail

                if (action.payload.id) localStorage.setItem('userId', action.payload.id)
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
                state.id = action.payload.id
                state.idToken = action.payload.idToken
                state.refreshToken = action.payload.refreshToken
                state.uid = action.payload.uid
                state.registrationMessage = null

                if (action.payload.id) localStorage.setItem('userId', action.payload.id)
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
                state.kycLink = action.payload.verification?.url
            })
            .addCase(getKycLink.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // Student Upload
            .addCase(uploadStudentDoc.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(uploadStudentDoc.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.kyb_id = action.payload.kyb_id
                state.kybStatus = action.payload.status
            })
            .addCase(uploadStudentDoc.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // KYC Decision
            .addCase(getKycDecision.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(getKycDecision.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.kycDecision = action.payload
            })
            .addCase(getKycDecision.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // Student Doc Status
            .addCase(getStudentDocStatus.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(getStudentDocStatus.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.studentDocStatus = action.payload
            })
            .addCase(getStudentDocStatus.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
