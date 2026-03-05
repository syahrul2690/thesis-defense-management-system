import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext.jsx';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useMockData();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Kata sandi tidak cocok');
            return;
        }

        setIsLoading(true);
        try {
            const result = await register(
                formData.name,
                formData.studentId,
                formData.email,
                formData.password
            );

            if (result.success) {
                navigate('/login', { state: { message: 'Registrasi berhasil! Silakan masuk.' } });
            } else {
                setError(result.error || 'Registrasi gagal.');
            }
        } catch (err) {
            setError('Registrasi gagal. Silakan coba lagi.');
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
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg mb-4 transform rotate-3 transition-transform">
                        <span className="text-3xl filter drop-shadow-md">🎓</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Buat Akun</h2>
                    <p className="text-indigo-200 mt-2 font-medium">Registrasi Mahasiswa</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-indigo-100 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-indigo-100 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                        <input
                            type="text"
                            name="studentId"
                            required
                            value={formData.studentId}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="12345678"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-indigo-100 mb-1">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="student@university.ac.id"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-indigo-100 mb-1">Kata Sandi</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-indigo-100 mb-1">Konfirmasi Kata Sandi</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-lg shadow-indigo-500/25 transform uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Mendaftar...' : 'Daftar Akun'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-indigo-200">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-white hover:text-indigo-300 font-semibold transition-colors">
                        Masuk
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
