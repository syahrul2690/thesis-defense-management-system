import React from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext.jsx';
import { LogOut, Home, FileText, CheckCircle, Users } from 'lucide-react';

export const Layout = ({ requiredRole }) => {
    const { currentUser, logout } = useMockData();
    const location = useLocation();
    const navigate = useNavigate();

    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.role !== requiredRole) return <Navigate to={`/${currentUser.role}`} />;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-indigo-900 text-white shadow-2xl flex flex-col transition-all duration-300 z-20">
                <div className="p-8 border-b border-indigo-800/50">
                    <h1 className="text-2xl font-extrabold flex items-center gap-3 text-white tracking-tight">
                        <span className="text-3xl drop-shadow-md">🎓</span> TDMS
                    </h1>
                    <p className="text-sm font-medium text-indigo-300 mt-2 tracking-wide uppercase">{currentUser.role} Portal</p>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <Link
                        to={`/${requiredRole}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(`/${requiredRole}`) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}`}
                    >
                        <Home className="w-5 h-5" /> Beranda
                    </Link>

                    {requiredRole === 'student' && (
                        <Link
                            to="/student/submit"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/student/submit') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}`}
                        >
                            <FileText className="w-5 h-5" /> Unggah Dokumen
                        </Link>
                    )}

                    {requiredRole === 'verificator' && (
                        <Link
                            to="/verificator/examiners"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/verificator/examiners') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5" /> Kelola Penguji
                        </Link>
                    )}

                    {requiredRole === 'supervisor' && (
                        <Link
                            to="/supervisor/schedule"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/supervisor/schedule') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}`}
                        >
                            <CheckCircle className="w-5 h-5" /> Jadwal Sidang
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-800">Selamat datang kembali, {currentUser.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Semoga sukses untuk Proposal dan Thesis Anda!</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" /> Keluar
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
