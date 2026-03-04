const API_BASE = '/api';

// Get stored token
const getToken = () => localStorage.getItem('tdms_token');

// Store token
export const setToken = (token) => localStorage.setItem('tdms_token', token);

// Remove token
export const removeToken = () => localStorage.removeItem('tdms_token');

// Fetch wrapper with auth
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        removeToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Auth API
export const authApi = {
    register: (data) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    login: (email, password) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),

    me: () => apiFetch('/auth/me'),
};

// Submissions API
export const submissionsApi = {
    getAll: () => apiFetch('/submissions'),

    create: (file, type, document_name) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('document_name', document_name);
        return apiFetch('/submissions', {
            method: 'POST',
            body: formData,
        });
    },

    reupload: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch(`/submissions/${id}/file`, {
            method: 'PUT',
            body: formData,
        });
    },

    updateStatus: (id, status) => apiFetch(`/submissions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),
};

// Examiners API
export const examinersApi = {
    getAll: () => apiFetch('/examiners'),
    add: (name) => apiFetch('/examiners', {
        method: 'POST',
        body: JSON.stringify({ name }),
    }),
    remove: (id) => apiFetch(`/examiners/${id}`, {
        method: 'DELETE',
    }),
};

// Schedules API
export const schedulesApi = {
    getAll: () => apiFetch('/schedules'),
    create: (data) => apiFetch('/schedules', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
