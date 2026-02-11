import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import { Send, Paperclip, FileText, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const InteractionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [interaction, setInteraction] = useState(null);
    const [messages, setMessages] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'docs' or 'timeline'

    useEffect(() => {
        fetchInteractionDetails();
        fetchDocuments();
        fetchMessages();

        // Refresh messages every 5 seconds to simulate real-time
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchInteractionDetails = async () => {
        try {
            const response = await api.get(`/interactions/${id}`);
            setInteraction(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching interaction:', error);
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/documents/interaction/${id}`);
            console.log('Fetched documents:', response.data);
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Error fetching docs:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/interaction/${id}`);
            const formattedMessages = response.data.map(m => ({
                id: m.id,
                text: m.text,
                sender: m.sender_name,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: Number(m.sender_id) === Number(user?.id)
            }));
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post('/messages', {
                interaction_id: Number(id),
                text: newMessage
            });
            setNewMessage('');
            fetchMessages(); // Refresh after send
        } catch (error) {
            console.error('Error sending message:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Gagal mengirim pesan: ${msg}`);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('interaction_id', Number(id));

        try {
            await api.post('/documents', formData); // Let axios set boundary automatically
            fetchDocuments(); // Refresh list
            setActiveTab('docs'); // Switch to docs tab to show success
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Upload failed: ${msg}`);
        }
    };

    const handleApproveStep = async () => {
        setApproving(true);
        try {
            await api.patch(`/interactions/${id}/approve-step`);
            await fetchInteractionDetails(); // Refresh data
        } catch (error) {
            console.error('Approval failed:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to approve step: ${msg}`);
        } finally {
            setApproving(false);
        }
    };

    if (loading) return (
        <MainLayout>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </MainLayout>
    );

    const steps = interaction?.steps_json || [];
    const currentIndex = interaction?.current_step_index || 0;
    const approvals = interaction?.approvals_json || {};
    const hasUserApproved = approvals[Number(user?.id)];
    const isInitiator = Number(user?.id) === Number(interaction?.initiator_id);
    const isReceiver = Number(user?.id) === Number(interaction?.receiver_id);
    const otherPartyName = isInitiator ? interaction?.receiver_name : interaction?.initiator_name;
    const otherPartyApproved = approvals[isInitiator ? Number(interaction?.receiver_id) : Number(interaction?.initiator_id)];

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-6rem)]">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/interactions')} className="mr-4 text-slate-400 hover:text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">{interaction?.project_name}</h1>
                            <div className="flex items-center text-sm text-slate-500">
                                <span className="font-medium text-indigo-600 mr-2">{interaction?.type}</span>
                                <span>• {new Date(interaction?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${interaction?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {interaction?.status?.toUpperCase()}
                        </span>
                        {interaction?.status === 'pending' && currentIndex < steps.length && (
                            <button
                                onClick={handleApproveStep}
                                disabled={hasUserApproved || approving}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${hasUserApproved
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                    }`}
                            >
                                {approving ? 'Processing...' : (hasUserApproved ? 'Awaiting Other Party' : `Approve: ${steps[currentIndex]}`)}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-slate-50 relative">
                        {/* Mobile Tabs */}
                        <div className="lg:hidden flex border-b border-slate-200 bg-white">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-bold transition-colors",
                                    activeTab === 'chat' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                CHAT
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-bold transition-colors",
                                    activeTab === 'docs' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                DOCS ({documents.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-bold transition-colors",
                                    activeTab === 'timeline' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                STEPS
                            </button>
                        </div>

                        {/* View Content based on Tab (Mobile) or unified (Desktop) */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Chat View */}
                            {(activeTab === 'chat' || window.innerWidth >= 1024) && (
                                <div className={clsx("p-4 space-y-4", activeTab !== 'chat' && 'hidden lg:block')}>
                                    {/* Approval Banner */}
                                    {!hasUserApproved && interaction?.status === 'pending' && currentIndex < steps.length && (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between mb-6 shadow-sm">
                                            <div className="flex items-start">
                                                <div className="bg-indigo-600 p-2 rounded-lg text-white mr-3">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-indigo-900 font-bold">Persetujuan Diperlukan</p>
                                                    <p className="text-xs text-indigo-700">Langkah: {steps[currentIndex]}</p>
                                                </div>
                                            </div>
                                            {otherPartyApproved && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                                    {otherPartyName} Sudah Setuju
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <span className="text-[10px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                                            Conversation started with {otherPartyName}
                                        </span>
                                    </div>

                                    {messages.length === 0 && (
                                        <div className="text-center text-slate-400 mt-10">
                                            <p className="text-sm">Belum ada pesan. Mulai koordinasi proyek di sini.</p>
                                        </div>
                                    )}
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2 shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'
                                                }`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {msg.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Mobile Docs View */}
                            {activeTab === 'docs' && (
                                <div className="lg:hidden p-4 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4">Project Documents</h3>
                                    {documents.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <FileText className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">Belum ada dokumen yang diunggah.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                    <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                                                        <FileText className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{doc.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{doc.uploader_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile Timeline View */}
                            {activeTab === 'timeline' && (
                                <div className="lg:hidden p-4">
                                    <h3 className="text-sm font-bold text-slate-900 mb-6">Interaction Progress</h3>
                                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                        {steps.map((step, index) => {
                                            const isDone = index < currentIndex;
                                            const isCurrent = index === currentIndex;
                                            return (
                                                <div key={index} className="relative pl-8">
                                                    <div className={clsx(
                                                        "absolute -left-[11px] top-0 h-5 w-5 rounded-full ring-4 ring-slate-50 flex items-center justify-center transition-colors",
                                                        isDone ? "bg-green-500" : isCurrent ? "bg-indigo-600 animate-pulse" : "bg-slate-200"
                                                    )}>
                                                        {isDone && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className={clsx(
                                                            "text-sm font-bold",
                                                            isDone ? "text-slate-900" : isCurrent ? "text-indigo-600" : "text-slate-400"
                                                        )}>
                                                            {step}
                                                        </p>
                                                        {isCurrent && (
                                                            <div className="mt-2 flex space-x-2">
                                                                <span className={clsx("text-[9px] px-2 py-0.5 rounded-full font-bold", hasUserApproved ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500")}>
                                                                    YOU: {hasUserApproved ? 'APPROVED' : 'PENDING'}
                                                                </span>
                                                                <span className={clsx("text-[9px] px-2 py-0.5 rounded-full font-bold", otherPartyApproved ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500")}>
                                                                    {otherPartyName.split(' ')[0].toUpperCase()}: {otherPartyApproved ? 'APPROVED' : 'PENDING'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area (Only in Chat tab) */}
                        {(activeTab === 'chat' || window.innerWidth >= 1024) && (
                            <div className={clsx("p-4 bg-white border-t border-slate-200 shrink-0", activeTab !== 'chat' && 'hidden lg:block')}>
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <label className="cursor-pointer p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Paperclip size={22} />
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    <input
                                        type="text"
                                        className="flex-1 border border-slate-200 bg-slate-50 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                        placeholder="Tulis pesan untuk koordinasi..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Documents & Info (Desktop) */}
                    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto hidden lg:block p-6">
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Documents</h3>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{documents.length}</span>
                            </div>
                            <div className="space-y-3">
                                {documents.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-tight">No files attached yet</p>
                                    </div>
                                ) : documents.map((doc) => (
                                    <div key={doc.id} className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                        <div className="p-2 bg-white rounded-lg mr-3 shadow-sm group-hover:bg-indigo-600 transition-colors">
                                            <FileText className="h-5 w-5 text-indigo-500 group-hover:text-white" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-slate-900 truncate leading-snug">{doc.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                {doc.uploader_name} • {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6 border-b pb-2">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Progression</h3>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">STEP {currentIndex + 1}/{steps.length}</span>
                            </div>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 mt-4">
                                {steps.map((step, index) => {
                                    const isDone = index < currentIndex;
                                    const isCurrent = index === currentIndex;

                                    return (
                                        <div key={index} className="relative pl-6">
                                            <div className={clsx(
                                                "absolute -left-[9px] top-0 h-4 w-4 rounded-full ring-4 ring-white transition-all duration-300",
                                                isDone ? "bg-green-500" : isCurrent ? "bg-indigo-600 animate-pulse" : "bg-slate-200"
                                            )}>
                                                {isDone && <CheckCircle size={10} className="text-white mx-auto mt-[3px]" />}
                                            </div>
                                            <p className={clsx(
                                                "text-[11px] font-bold uppercase tracking-tight",
                                                isDone ? "text-slate-900" : isCurrent ? "text-indigo-600" : "text-slate-300"
                                            )}>
                                                {step}
                                            </p>
                                            {isCurrent && (
                                                <div className="mt-2 flex flex-col space-y-1">
                                                    <div className="flex items-center">
                                                        <div className={clsx("h-1.5 w-1.5 rounded-full mr-2", hasUserApproved ? "bg-green-500" : "bg-slate-300")}></div>
                                                        <span className="text-[9px] font-bold text-slate-500">YOU: {hasUserApproved ? 'APPROVED' : 'PENDING'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className={clsx("h-1.5 w-1.5 rounded-full mr-2", otherPartyApproved ? "bg-green-500" : "bg-slate-300")}></div>
                                                        <span className="text-[9px] font-bold text-slate-500">{otherPartyName.toUpperCase()}: {otherPartyApproved ? 'APPROVED' : 'PENDING'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Final Completion Step */}
                                {steps.length > 0 && (
                                    <div className="relative pl-6 pt-2">
                                        <div className={clsx(
                                            "absolute -left-[9px] top-2 h-4 w-4 rounded-full ring-4 ring-white transition-all duration-500",
                                            interaction?.status === 'completed' ? "bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.6)]" : "bg-slate-200"
                                        )}>
                                            {interaction?.status === 'completed' && <CheckCircle size={10} className="text-white mx-auto mt-[3px]" />}
                                        </div>
                                        <p className={clsx(
                                            "text-[11px] font-extrabold uppercase tracking-widest",
                                            interaction?.status === 'completed' ? "text-green-600" : "text-slate-300"
                                        )}>
                                            Project Completed
                                        </p>
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

export default InteractionDetail;
