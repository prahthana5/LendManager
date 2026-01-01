import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Users, PlusCircle } from 'lucide-react';

export default function Layout() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                                L
                            </div>
                            <span className="hidden sm:inline">கடன் மேலாளர்</span>
                        </Link>

                        <nav className="hidden sm:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                முகப்பு
                            </Link>
                            <Link to="/loans" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                கடன்கள்
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/loans/new" className="hidden sm:flex btn btn-primary py-1.5 px-3 text-sm flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> புதிய கடன்
                        </Link>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        <span className="text-sm text-slate-500 hidden sm:block">
                            {currentUser?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav (Optional, but good for PWA) */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe">
                <div className="flex justify-around items-center h-16">
                    <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary-600">
                        <Home className="w-6 h-6" />
                        <span className="text-xs mt-1">முகப்பு</span>
                    </Link>
                    <Link to="/loans" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary-600">
                        <Users className="w-6 h-6" />
                        <span className="text-xs mt-1">கடன்கள்</span>
                    </Link>
                    <Link to="/loans/new" className="flex flex-col items-center justify-center w-full h-full text-primary-600">
                        <PlusCircle className="w-8 h-8" />
                    </Link>
                </div>
            </nav>
            {/* Spacing for bottom nav */}
            <div className="h-16 sm:hidden"></div>
        </div>
    );
}
