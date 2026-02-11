import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import Modal from '../../components/ui/Modal';
import { Search, Filter, MapPin, Star, CheckSquare, Square, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailableInteractions, ROLES, INTERACTION_SCHEMAS } from '../../constants/interactionDefinitions';

const StakeholderList = () => {
    const [stakeholders, setStakeholders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [interactionForm, setInteractionForm] = useState({ project_name: '', type: '' });
    const [availableActions, setAvailableActions] = useState([]);

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchStakeholders();
    }, [filterRole, searchTerm]);

    useEffect(() => {
        updateAvailableActions();
    }, [selectedIds, stakeholders, user]); // Re-calc actions when selection changes

    const fetchStakeholders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterRole) params.role = filterRole;
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/stakeholders', { params });
            const enhancedData = response.data
                .filter(u => u.id !== user?.id) // Filter out current user
                .map(u => ({
                    ...u,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    location: ['Jakarta, Indonesia', 'Surabaya, Indonesia', 'Bali, Indonesia'][Math.floor(Math.random() * 3)]
                }));
            setStakeholders(enhancedData);
        } catch (error) {
            console.error('Error fetching stakeholders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const updateAvailableActions = () => {
        if (selectedIds.size === 0 || !user) {
            setAvailableActions([]);
            return;
        }

        // Get selected user objects
        const selectedUsers = stakeholders.filter(u => selectedIds.has(u.id));

        // Find common actions supported by ALL selected users
        // (Action must be valid for User -> Target for EVERY target)
        if (selectedUsers.length === 0) return;

        let commonActions = getAvailableInteractions(user.role, selectedUsers[0].role);

        for (let i = 1; i < selectedUsers.length; i++) {
            const nextActions = getAvailableInteractions(user.role, selectedUsers[i].role);
            // Intersection
            commonActions = commonActions.filter(action => nextActions.includes(action));
        }

        setAvailableActions(commonActions);
    };

    const handleInitiateAction = () => {
        if (availableActions.length === 0) {
            alert(`No common actions available between your role (${user?.role}) and the selected stakeholders.`);
            return;
        }
        setInteractionForm({ project_name: '', type: availableActions[0], details: {} });
        setIsModalOpen(true);
    };

    const handleCreateInteractions = async (e) => {
        e.preventDefault();
        try {
            const promises = Array.from(selectedIds).map(receiverId => {
                return api.post('/interactions', {
                    receiver_id: receiverId,
                    project_name: interactionForm.project_name,
                    type: interactionForm.type,
                    details: interactionForm.details
                });
            });

            await Promise.all(promises);

            setIsModalOpen(false);
            setSelectedIds(new Set()); // Clear selection
            navigate('/interactions');
        } catch (error) {
            console.error('Error creating interactions:', error);
            alert('Failed to create one or more interactions');
        }
    };

    const isSelf = (id) => user?.id === id;

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stakeholders</h1>
                <p className="mt-2 text-slate-600">Select stakeholders to initiate actions.</p>


            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex-1 relative">
                    <Search className="absolute inset-y-0 left-0 pl-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <Filter className="absolute inset-y-0 left-0 pl-3 top-2.5 h-5 w-5 text-slate-400" />
                    <select
                        className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm appearance-none"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-24">
                    {stakeholders.map((person) => {
                        const isSelected = selectedIds.has(person.id);
                        const isMe = isSelf(person.id);

                        return (
                            <div
                                key={person.id}
                                onClick={() => !isMe && toggleSelection(person.id)}
                                className={`relative bg-white rounded-xl border transition-all duration-200 flex flex-col cursor-pointer hover:shadow-md ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/10' : 'border-slate-100'
                                    } ${isMe ? 'opacity-60 cursor-default' : ''}`}
                            >
                                <div className="absolute top-4 right-4">
                                    {isMe ? (
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">YOU</span>
                                    ) : (
                                        isSelected ?
                                            <CheckSquare className="h-6 w-6 text-indigo-600" /> :
                                            <Square className="h-6 w-6 text-slate-300" />
                                    )}
                                </div>

                                <div className="p-6 flex-1">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-bold">
                                            {person.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3
                                                className="text-base font-bold text-slate-900 hover:text-indigo-600 hover:underline z-10 relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/stakeholders/${person.id}`);
                                                }}
                                            >
                                                {person.name}
                                            </h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{person.role}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center">
                                            <MapPin size={14} className="mr-2 text-slate-400" />
                                            {person.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Star size={14} className="mr-2 text-yellow-400" />
                                            {person.rating} Rating
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Bar (Sticky Bottom) */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg transform transition-transform duration-300 z-50 flex items-center justify-between sm:px-8 lg:px-12 md:pl-72">
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                            {selectedIds.size} Selected
                        </div>
                        <span className="text-slate-600 text-sm hidden sm:inline">
                            Choose an action to perform with these stakeholders.
                        </span>
                    </div>
                    <div>
                        <button
                            onClick={handleInitiateAction}
                            className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-colors duration-200 ${availableActions.length > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                : 'bg-slate-400 cursor-not-allowed hover:bg-slate-500'
                                }`}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Interact ({availableActions.length})
                        </button>
                    </div>
                </div>
            )}

            {/* Interaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Initiate Interaction (${selectedIds.size} recipients)`}
            >
                <form onSubmit={handleCreateInteractions} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Interaction Type</label>
                        <select
                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={interactionForm.type}
                            onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value, details: {} })}
                        >
                            {availableActions.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project / Topic Name</label>
                        <input
                            type="text"
                            required
                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g. Project Alpha Q1"
                            value={interactionForm.project_name}
                            onChange={(e) => setInteractionForm({ ...interactionForm, project_name: e.target.value })}
                        />
                    </div>

                    {/* Dynamic Fields based on Schema */}
                    {interactionForm.type && INTERACTION_SCHEMAS && INTERACTION_SCHEMAS[interactionForm.type] ? (
                        <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                            <h4 className="text-sm font-bold text-slate-900">Interaction Details</h4>
                            {INTERACTION_SCHEMAS[interactionForm.type].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            rows={3}
                                            value={interactionForm.details?.[field.name] || ''}
                                            onChange={(e) => setInteractionForm({
                                                ...interactionForm,
                                                details: { ...interactionForm.details, [field.name]: e.target.value }
                                            })}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            required={field.required}
                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={interactionForm.details?.[field.name] || ''}
                                            onChange={(e) => setInteractionForm({
                                                ...interactionForm,
                                                details: { ...interactionForm.details, [field.name]: e.target.value }
                                            })}
                                        >
                                            <option value="">Select...</option>
                                            {field.options && field.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={interactionForm.details?.[field.name] || ''}
                                            onChange={(e) => setInteractionForm({
                                                ...interactionForm,
                                                details: { ...interactionForm.details, [field.name]: e.target.value }
                                            })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        interactionForm.type && <p className="text-sm text-slate-500 italic mt-4">No additional details required for this interaction.</p>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-medium text-sm"
                        >
                            Confirm & Send
                        </button>
                    </div>
                </form>
            </Modal>

        </MainLayout>
    );
};

export default StakeholderList;
