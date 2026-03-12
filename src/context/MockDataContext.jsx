import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi, submissionsApi, examinersApi, schedulesApi, setToken, removeToken } from '../utils/api.js';

const MockDataContext = createContext();

export const useMockData = () => useContext(MockDataContext);

export const MockDataProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [examiners, setExaminers] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('tdms_token');
        if (token) {
            authApi.me()
                .then(data => {
                    setCurrentUser(data.user);
                })
                .catch(() => {
                    removeToken();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch data when user is logged in
    useEffect(() => {
        if (currentUser) {
            refreshData();
        }
    }, [currentUser]);

    const refreshData = async () => {
        try {
            const [subs, exams, scheds] = await Promise.all([
                submissionsApi.getAll(),
                examinersApi.getAll().catch(() => []),
                schedulesApi.getAll().catch(() => []),
            ]);
            setSubmissions(subs);
            setExaminers(exams);
            setSchedules(scheds);
        } catch (err) {
            console.error('Failed to refresh data:', err);
        }
    };

    // Auth Methods
    const login = async (email, password) => {
        try {
            const data = await authApi.login(email, password);
            setToken(data.token);
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (name, studentId, email, password) => {
        try {
            await authApi.register({ name, student_id: studentId, email, password });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        removeToken();
        setCurrentUser(null);
        setSubmissions([]);
        setExaminers([]);
        setSchedules([]);
    };

    // Submission Methods
    const addSubmission = async (file, type, documentName) => {
        try {
            const newSub = await submissionsApi.create(file, type, documentName);
            setSubmissions(prev => [newSub, ...prev]);
            return newSub;
        } catch (err) {
            console.error('Failed to add submission:', err);
            throw err;
        }
    };

    const updateSubmissionStatus = async (id, status) => {
        try {
            const updated = await submissionsApi.updateStatus(id, status);
            setSubmissions(prev => prev.map(sub => sub.id === id ? updated : sub));
        } catch (err) {
            console.error('Failed to update status:', err);
            throw err;
        }
    };

    const updateSubmissionFile = async (id, file) => {
        try {
            const updated = await submissionsApi.reupload(id, file);
            setSubmissions(prev => prev.map(sub => sub.id === id ? updated : sub));
        } catch (err) {
            console.error('Failed to re-upload:', err);
            throw err;
        }
    };

    // Examiner Methods
    const addExaminer = async (name) => {
        try {
            const newEx = await examinersApi.add(name);
            setExaminers(prev => [...prev, newEx]);
        } catch (err) {
            console.error('Failed to add examiner:', err);
            throw err;
        }
    };

    const removeExaminer = async (id) => {
        try {
            await examinersApi.remove(id);
            setExaminers(prev => prev.filter(ex => ex.id !== id));
        } catch (err) {
            console.error('Failed to remove examiner:', err);
            throw err;
        }
    };

    // Schedule Methods
    const addSchedule = async (schedule) => {
        try {
            const newSched = await schedulesApi.create(schedule);
            setSchedules(prev => [...prev, newSched]);
        } catch (err) {
            console.error('Failed to add schedule:', err);
            throw err;
        }
    };

    const updateSchedule = async (id, scheduleData) => {
        try {
            const updatedSched = await schedulesApi.update(id, scheduleData);
            setSchedules(prev => prev.map(s => s.id === id ? updatedSched : s));
            refreshData(); // Refresh to ensure we get clean lists and inactive ones are removed if needed
            return updatedSched;
        } catch (err) {
            console.error('Failed to update schedule:', err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-white text-lg font-medium">Loading...</div>
            </div>
        );
    }

    return (
        <MockDataContext.Provider value={{
            currentUser,
            login,
            register,
            logout,

            submissions,
            addSubmission,
            updateSubmissionStatus,
            updateSubmissionFile,

            examiners,
            addExaminer,
            removeExaminer,

            schedules,
            addSchedule,
            updateSchedule,

            refreshData,
        }}>
            {children}
        </MockDataContext.Provider>
    );
};
