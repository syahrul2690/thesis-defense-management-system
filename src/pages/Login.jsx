import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext.jsx';

const Login = () => {
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useMockData();

    // Message from registration
    const message = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate(`/${result.user.role}`);
            } else {
                setError(result.error || 'Kredensial tidak valid. Silakan coba lagi.');
            }
        } catch (err) {
            setError('Login gagal. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-slate-900">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"></div>

            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 max-w-lg w-full rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-10 relative z-10 transform transition-all">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-4xl filter drop-shadow-md">🎓</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Masuk ke TDMS</h2>
                    <p className="text-indigo-200 mt-3 font-medium">Sistem Manajemen Sidang Skripsi</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm font-medium">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-sm font-semibold text-indigo-100 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                                placeholder="Masukkan email Anda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-indigo-100 mb-1">Kata Sandi</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-lg shadow-indigo-500/25 transform uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sedang masuk...' : 'Masuk'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-indigo-200">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-white hover:text-indigo-300 font-semibold transition-colors">
                        Daftar di sini
                    </Link>
                </div>

                <div className="mt-6 p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-sm text-indigo-200 backdrop-blur-sm">
                    <div className="flex items-center gap-2 font-semibold mb-2 text-indigo-100">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Akun Demo
                    </div>
                    <div className="space-y-1 text-xs">
                        <p>Mahasiswa: <span className="text-white">john@student.ac.id</span> / password123</p>
                        <p>Verifikator: <span className="text-white">vera@admin.ac.id</span> / Hermawan1234</p>
                        <p>Supervisor: <span className="text-white">smith@faculty.ac.id</span> / Hermawan1234</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
