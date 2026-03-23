import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText } from 'lucide-react';
import { motion } from 'framer-motion';

const getRedirectPath = (role?: string) => {
    const normalizedRole = String(role || '').toUpperCase();
    return normalizedRole === 'LECTURER' ? '/dashboard' : '/TaskCatalog';
};

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'STUDENT' | 'LECTURER'>('STUDENT');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [indexNumber, setIndexNumber] = useState('');

    // Academic Data States
    const [years, setYears] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);

    // Selected Academic States
    const [selectedYearId, setSelectedYearId] = useState('');
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

    // Fetch initial data
    useEffect(() => {
        fetchYears();
        if (role === 'LECTURER') {
            fetchModules();
        }
    }, [role]);

    // Fetch semesters when year changes
    useEffect(() => {
        if (selectedYearId) {
            fetchSemesters(selectedYearId);
        } else {
            setSemesters([]);
            setSelectedSemesterId('');
        }
    }, [selectedYearId]);

    const fetchYears = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/academic/years');
            const data = await res.json();
            if (res.ok) setYears(data);
        } catch (err) {
            console.error('Failed to fetch years', err);
        }
    };

    const fetchSemesters = async (yearId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/academic/years/${yearId}/semesters`);
            const data = await res.json();
            if (res.ok) setSemesters(data);
        } catch (err) {
            console.error('Failed to fetch semesters', err);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/academic/modules');
            const data = await res.json();
            if (res.ok) setModules(data);
        } catch (err) {
            console.error('Failed to fetch modules', err);
        }
    };

    const toggleModuleSelection = (id: string) => {
        setSelectedModuleIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = role === 'STUDENT' ? '/api/auth/register/student' : '/api/auth/register/lecturer';

        const payload: any = { name, email, password };
        if (role === 'STUDENT') {
            payload.indexNumber = indexNumber;
            payload.semesterId = selectedSemesterId;
        } else {
            payload.moduleIds = selectedModuleIds;
        }

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

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
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-blue-100/50 to-purple-50/20 rounded-full blur-[100px] -z-10" />

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
                className="w-full max-w-xl bg-white/60 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Create an account</h2>
                    <p className="text-slate-500 font-medium">Join the intelligent academic governance platform.</p>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 mb-8 bg-slate-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setRole('STUDENT')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('LECTURER')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'LECTURER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lecturer
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" placeholder="john@uni.edu" />
                        </div>
                    </div>

                    {role === 'STUDENT' ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Student Index / IT Number</label>
                                <input type="text" required value={indexNumber} onChange={(e) => setIndexNumber(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" placeholder="IT21000000" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Academic Year</label>
                                    <select required value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium">
                                        <option value="">Select Year...</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Semester</label>
                                    <select required disabled={!selectedYearId} value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium disabled:opacity-50">
                                        <option value="">Select Semester...</option>
                                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Assigned Modules</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border border-slate-200 rounded-xl p-3 bg-white/80">
                                {modules.map(mod => (
                                    <label key={mod.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                            checked={selectedModuleIds.includes(mod.id)}
                                            onChange={() => toggleModuleSelection(mod.id)}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{mod.code} - {mod.name}</span>
                                    </label>
                                ))}
                                {modules.length === 0 && <span className="text-sm text-slate-500 p-2 block">Loading modules...</span>}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading || (role === 'STUDENT' ? !selectedSemesterId : selectedModuleIds.length === 0)} className="w-full flex items-center justify-center py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 group">
                        {loading ? (
                            <span className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                <span>Creating account...</span>
                            </span>
                        ) : (
                            <span className="flex items-center space-x-2">
                                <span>Complete Registration</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
