import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, FileText, ArrowUpRight, TrendingUp, Users } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-100 hover:shadow-md transition-shadow duration-300 relative group">
        <div className="p-6">
            <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-2xl font-bold text-slate-900">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
        {link && (
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                <Link to={link} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center group-hover:translate-x-1 transition-transform">
                    View all <ArrowUpRight size={14} className="ml-1" />
                </Link>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalContexts: 0, pending: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/interactions');
                const interactions = response.data;

                setStats({
                    totalContexts: interactions.length,
                    pending: interactions.filter(i => i.status === 'pending').length
                });
                setRecentActivity(interactions.slice(0, 5));
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="mt-2 text-slate-600">Welcome back, {user?.name}! Here's what's happening today.</p>
                </div>
                <div className="hidden sm:block">
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        <TrendingUp className="mr-2 h-4 w-4" /> View Analytics
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard
                    title="Total Interactions"
                    value={stats.totalContexts}
                    icon={Briefcase}
                    color="bg-indigo-500"
                    link="/interactions"
                />
                <StatCard
                    title="Pending Actions"
                    value={stats.pending}
                    icon={Clock}
                    color="bg-amber-500"
                    link="/interactions"
                />
                <StatCard
                    title="Documents"
                    value="0"
                    icon={FileText}
                    color="bg-emerald-500"
                    link="/documents"
                />
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-slate-100 mb-8">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900">Recent Activity</h3>
                    <Link to="/interactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all</Link>
                </div>
                <ul className="divide-y divide-slate-100">
                    {recentActivity.map((activity) => (
                        <li key={activity.id} className="px-6 py-4 hover:bg-slate-50 transition-colors duration-150">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        {activity.type === 'Proposal' ? <Briefcase size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-900 truncate">{activity.project_name}</p>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <span>{activity.type} with <span className="font-semibold text-slate-700">{activity.receiver_name}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex items-center">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                        ${activity.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            activity.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {activity.status}
                                    </span>
                                    <span className="ml-4 text-xs text-slate-400">Just now</span>
                                </div>
                            </div>
                        </li>
                    ))}
                    {recentActivity.length === 0 && (
                        <li className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                            <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-lg font-medium text-slate-900">No recent activity</p>
                            <p className="text-sm text-slate-500 mt-1">Start connecting with stakeholders to see updates here.</p>
                            <Link to="/stakeholders" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                Find Stakeholders
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
