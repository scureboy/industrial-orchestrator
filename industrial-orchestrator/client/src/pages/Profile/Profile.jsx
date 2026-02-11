import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layouts/MainLayout';
import { PROFILE_SCHEMAS } from '../../constants/interactionDefinitions';
import api from '../../lib/api';
import { Save, User, Mail, Briefcase, Phone, Info } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio || '',
                contact: user.contact || '',
                profile_details: user.profile_details ? (typeof user.profile_details === 'string' ? JSON.parse(user.profile_details) : user.profile_details) : {}
            });
        }
    }, [user]);

    const handleDetailChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            profile_details: {
                ...prev.profile_details,
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update /profile endpoint needs to be created or we patch /users/:id
            // For now assuming a generic update profile endpoint
            const response = await api.patch('/users/profile', {
                bio: formData.bio,
                contact: formData.contact,
                profile_details: formData.profile_details
            });

            // Update local context
            const updatedProfile = {
                bio: formData.bio,
                contact: formData.contact,
                profile_details: formData.profile_details
            };

            updateUser(updatedProfile);

            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const roleFields = PROFILE_SCHEMAS[user?.role] || [];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-600 px-8 py-8 text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-6">
                                <div className="h-24 w-24 rounded-full bg-white/20 text-white flex items-center justify-center text-4xl font-bold border-4 border-white/30 backdrop-blur-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{user?.name}</h1>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white mt-2 border border-white/20">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={loading}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                                    ? 'bg-white text-indigo-600 hover:bg-slate-100'
                                    : 'bg-indigo-500/50 text-white hover:bg-indigo-500/70'
                                    }`}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                                    Basic Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500">Email</label>
                                        <div className="mt-1 flex items-center text-slate-900">
                                            <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                            {user?.email}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 mb-1">Bio</label>
                                        {isEditing ? (
                                            <textarea
                                                className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                rows={3}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        ) : (
                                            <p className="text-slate-900 text-sm leading-relaxed">
                                                {user?.bio || <span className="text-slate-400 italic">No bio added yet.</span>}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 mb-1">Contact Details</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center text-slate-900">
                                                <Phone className="h-4 w-4 mr-2 text-slate-400" />
                                                {user?.contact || <span className="text-slate-400 italic">No contact info.</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Role Specific Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />
                                    {user?.role} Details
                                </h3>

                                {roleFields.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No specific details defined for this role.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {roleFields.map(field => (
                                            <div key={field.name}>
                                                <label className="block text-sm font-medium text-slate-500 mb-1">
                                                    {field.label}
                                                </label>
                                                {isEditing ? (
                                                    field.type === 'textarea' ? (
                                                        <textarea
                                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            value={formData.profile_details?.[field.name] || ''}
                                                            onChange={(e) => handleDetailChange(field.name, e.target.value)}
                                                        />
                                                    ) : field.type === 'select' ? (
                                                        <select
                                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            value={formData.profile_details?.[field.name] || ''}
                                                            onChange={(e) => handleDetailChange(field.name, e.target.value)}
                                                        >
                                                            <option value="">Select...</option>
                                                            {field.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            placeholder={field.placeholder}
                                                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            value={formData.profile_details?.[field.name] || ''}
                                                            onChange={(e) => handleDetailChange(field.name, e.target.value)}
                                                        />
                                                    )
                                                ) : (
                                                    <p className="text-slate-900 font-medium text-sm">
                                                        {formData.profile_details?.[field.name] || <span className="text-slate-400">-</span>}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
