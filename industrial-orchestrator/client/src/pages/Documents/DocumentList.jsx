import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import Modal from '../../components/ui/Modal';
import { Upload, FileText, Download, User, Calendar } from 'lucide-react';

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        interaction_id: '',
        name: '',
        file: null
    });

    useEffect(() => {
        fetchDocuments();
        fetchInteractions();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInteractions = async () => {
        try {
            const response = await api.get('/interactions');
            setInteractions(response.data);
        } catch (error) {
            console.error('Error fetching interactions:', error);
        }
    };

    const handleFileChange = (e) => {
        setUploadForm({ ...uploadForm, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('interaction_id', uploadForm.interaction_id);
        formData.append('name', uploadForm.name);
        formData.append('file', uploadForm.file);

        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploadModalOpen(false);
            setUploadForm({ interaction_id: '', name: '', file: null });
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Upload failed');
        }
    };

    return (
        <MainLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
                    <p className="mt-2 text-slate-600">Manage contracts, invoices, and other project files.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors duration-200"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading documents...</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <li key={doc.id} className="hover:bg-slate-50 transition-colors duration-200">
                                <div className="px-6 py-4 flex items-center">
                                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <FileText size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{doc.name}</p>
                                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                                    <User size={12} className="mr-1" />
                                                    Uploaded by {doc.uploader_name}
                                                    <span className="mx-2">•</span>
                                                    <span>Interaction #{doc.interaction_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-5 flex-shrink-0">
                                        <a
                                            href={`http://localhost:3000/uploads/${doc.path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200"
                                        >
                                            <Download className="h-4 w-4 mr-1.5" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {documents.length === 0 && (
                            <li className="px-6 py-12 text-center text-slate-500 flex flex-col items-center">
                                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                                <p className="text-lg font-medium text-slate-900">No documents found</p>
                                <p className="text-sm text-slate-500 mt-1">Upload a document to get started.</p>
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="Upload Document"
            >
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Interaction</label>
                        <select
                            required
                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={uploadForm.interaction_id}
                            onChange={(e) => setUploadForm({ ...uploadForm, interaction_id: e.target.value })}
                        >
                            <option value="">Select an interaction...</option>
                            {interactions.map(i => (
                                <option key={i.id} value={i.id}>{i.project_name} ({i.type})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                        <input
                            type="text"
                            required
                            className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g. Contract Draft v1"
                            value={uploadForm.name}
                            onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" required className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                                {uploadForm.file && <p className="text-sm text-indigo-600 mt-2 font-medium">{uploadForm.file.name}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(false)}
                            className="inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        >
                            Upload
                        </button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default DocumentList;
