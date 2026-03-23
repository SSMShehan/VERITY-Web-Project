import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { motion } from 'framer-motion';

const getRedirectPath = (role?: string) => {
    const normalizedRole = String(role || '').toUpperCase();
    return normalizedRole === 'LECTURER' ? '/dashboard' : '/TaskCatalog';
};

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            navigate(getRedirectPath(data.role));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFCFF] relative overflow-hidden py-12 px-6">
            {/* Background Ambient Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 to-purple-50/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-emerald-50/30 to-cyan-50/20 rounded-full blur-[120px] -z-10" />

            <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm transition-transform group-hover:scale-105">
                    <BookOpenText className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800">VERITY</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Welcome back</h2>
                    <p className="text-slate-500 font-medium">Log in to your academic workspace.</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            placeholder="student@demo.edu"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-slate-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4 group"
                    >
                        {loading ? (
                            <span className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                <span>Signing in...</span>
                            </span>
                        ) : (
                            <span className="flex items-center space-x-2">
                                <span>Sign in to Verity</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
