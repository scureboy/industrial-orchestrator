import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { PROFILE_SCHEMAS } from '../../constants/interactionDefinitions';
import api from '../../lib/api';
import { User, Mail, Briefcase, Phone, ArrowLeft, MessageSquare } from 'lucide-react';

const StakeholderProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <MainLayout>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </MainLayout>
    );

    if (!profile) return (
        <MainLayout>
            <div className="text-center py-12">
                <p className="text-xl text-slate-500">User not found.</p>
                <button
                    onClick={() => navigate('/stakeholders')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                    Back to Stakeholders
                </button>
            </div>
        </MainLayout>
    );

    const roleFields = PROFILE_SCHEMAS[profile.role] || [];
    const profileDetails = profile.profile_details || {};

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </button>

                <div className="bg-white shadow rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-800 px-8 py-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <User className="h-64 w-64" />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex items-center space-x-6">
                                <div className="h-24 w-24 rounded-full bg-slate-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-slate-600">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white mt-2 border border-white/20">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                                    About
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500">Email</label>
                                        <div className="mt-1 flex items-center text-slate-900">
                                            <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                            {profile.email}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 mb-1">Bio</label>
                                        <p className="text-slate-900 text-sm leading-relaxed">
                                            {profile.bio || <span className="text-slate-400 italic">No bio provided.</span>}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 mb-1">Contact Details</label>
                                        <div className="flex items-center text-slate-900">
                                            <Phone className="h-4 w-4 mr-2 text-slate-400" />
                                            {profile.contact || <span className="text-slate-400 italic">No contact info.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role Specific Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />
                                    {profile.role} Profile
                                </h3>

                                <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                                    {roleFields.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No specific details available.</p>
                                    ) : (
                                        roleFields.map(field => (
                                            <div key={field.name} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                                <label className="block text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
                                                    {field.label}
                                                </label>
                                                <p className="text-slate-900 font-medium">
                                                    {profileDetails[field.name] || <span className="text-slate-400">-</span>}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StakeholderProfile;
