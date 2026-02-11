import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, MessageSquare, FileText, LogOut, User } from 'lucide-react';
import clsx from 'clsx';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Stakeholders', href: '/stakeholders', icon: Users },
        { name: 'Interactions', href: '/interactions', icon: MessageSquare },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-indigo-500 rounded flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">REO</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight leading-none">Orchestrator</span>
                        <span className="text-[10px] text-indigo-400 font-mono mt-0.5">v8.5-FINAL-REPAIR</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-right mr-2">
                        <p className="text-xs font-bold text-white">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar (Desktop) */}
            <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-10 bg-slate-900 border-r border-slate-800 shadow-xl">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">REO</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white tracking-wide leading-none">Orchestrator</span>
                            <span className="text-[10px] text-indigo-400 font-mono mt-1">v8.5-FINAL-REPAIR</span>
                        </div>
                    </div>
                    <nav className="mt-2 flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        isActive ? 'bg-slate-800 text-white border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                        'group flex items-center px-3 py-3 text-sm font-medium rounded-r-md transition-all duration-200'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300',
                                            'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-slate-800 p-4 bg-slate-900">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="inline-block h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white group-hover:text-gray-200">{user?.name}</p>
                                <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">{user?.role}</p>
                            </div>
                            <button onClick={logout} title="Logout" className="ml-auto text-slate-400 hover:text-white transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Bar (Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex justify-around items-center z-20">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                                isActive ? 'text-indigo-600' : 'text-slate-500',
                                'flex flex-col items-center p-2 rounded-lg'
                            )}
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1 w-full">
                <main className="flex-1 relative">
                    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
