import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <span className="text-white font-bold text-xl">REO</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-slate-600 max-w">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-xl sm:px-10 border border-slate-100">
                    {children}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        &copy; 2026 Real Estate Orchestrator. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
