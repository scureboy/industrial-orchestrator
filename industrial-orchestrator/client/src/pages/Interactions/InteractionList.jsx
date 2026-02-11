import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import { Clock, CheckCircle, XCircle, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InteractionList = () => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInteractions();
    }, []);

    const fetchInteractions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/interactions');
            setInteractions(response.data);
        } catch (error) {
            console.error('Error fetching interactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e, id, status) => {
        e.stopPropagation(); // Prevent navigation when clicking action buttons
        try {
            await api.patch(`/interactions/${id}/status`, { status });
            fetchInteractions();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-amber-500" />;
            case 'accepted':
            case 'paid':
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Clock className="h-5 w-5 text-slate-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-800',
            accepted: 'bg-emerald-100 text-emerald-800',
            paid: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interactions</h1>
                <p className="mt-2 text-slate-600">Track the progress of your projects and proposals.</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading interactions...</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {interactions.map((interaction) => (
                            <li
                                key={interaction.id}
                                onClick={() => navigate(`/interactions/${interaction.id}`)}
                                className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                            >
                                <div className="px-6 py-5 flex items-center">
                                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-lg font-semibold text-indigo-600 truncate">{interaction.project_name}</p>
                                                <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                                    {getStatusBadge(interaction.status)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 space-y-1 sm:space-y-0 sm:space-x-6">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-slate-900 mr-1">
                                                        {interaction.receiver_name || interaction.initiator_name}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                        {interaction.receiver_role || interaction.initiator_role}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock size={14} className="mr-1.5 text-slate-400" />
                                                    {interaction.steps_json?.length > 0
                                                        ? `Step ${interaction.current_step_index + 1} of ${interaction.steps_json.length}: ${interaction.steps_json[interaction.current_step_index] || 'Completed'}`
                                                        : 'In Progress'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex-shrink-0 flex items-center space-x-3">
                                        <ChevronRight className="h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                            </li>
                        ))}
                        {interactions.length === 0 && (
                            <li className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                                <Clock className="h-12 w-12 text-slate-300 mb-4" />
                                <p className="text-lg font-medium text-slate-900">No interactions yet</p>
                                <p className="text-sm text-slate-500 mt-1">Create a proposal to get started.</p>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </MainLayout>
    );
};

export default InteractionList;
