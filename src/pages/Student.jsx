import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext.jsx';
import { FileUp, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { PROPOSAL_DOCS, THESIS_DOCS } from '../utils/constants.js';

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Verified: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
        Missing: 'bg-gray-100 text-gray-800',
    };

    const Icon = {
        Pending: Clock,
        Verified: CheckCircle,
        Rejected: XCircle,
        Missing: Clock,
    }[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
};

export const StudentDashboard = () => {
    const { submissions, schedules, currentUser } = useMockData();

    const mySubmissions = submissions.filter(s => Number(s.student_id) === Number(currentUser?.id));
    const mySchedules = schedules.filter(sched => {
        const sub = mySubmissions.find(s => s.id === sched.submission_id);
        return !!sub;
    });

    // Check if all Proposal docs are verified
    const isProposalCleared = PROPOSAL_DOCS.every(docName =>
        mySubmissions.some(sub => sub.document_name === docName && sub.status === 'Verified')
    );

    const renderDocumentGroup = (title, docs, phase) => {
        const phaseSubmissions = mySubmissions.filter(s => s.type === phase);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{title} Documents</h3>
                    <span className="text-sm text-gray-500">{phaseSubmissions.length} of {docs.length} Submitted</span>
                </div>

                <div className="divide-y divide-gray-200">
                    {docs.map((docName, idx) => {
                        const submission = phaseSubmissions.find(s => s.document_name === docName);
                        const status = submission ? submission.status : 'Missing';

                        return (
                            <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 flex items-center gap-3">
                                        {docName}
                                        {submission?.is_reuploaded === 1 && (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Re-uploaded
                                            </span>
                                        )}
                                        <StatusBadge status={status} />
                                    </div>
                                    {submission ? (
                                        <>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Submitted on {new Date(submission.created_at).toLocaleDateString()}
                                            </div>
                                            <a href={submission.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 inline-block font-medium">
                                                View Attached File →
                                            </a>
                                        </>
                                    ) : (
                                        <div className="text-xs text-red-500 mt-1">Required Document</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">My Overview</h2>

            {mySchedules.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4">Upcoming Defenses</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {mySchedules.map(sched => {
                            const relatedSub = mySubmissions.find(s => s.id === sched.submission_id);
                            return (
                                <div key={sched.id} className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                                    <div className="font-medium text-indigo-900">{relatedSub?.type}</div>
                                    <div className="text-sm text-indigo-700 mt-1">
                                        Date: {new Date(sched.event_date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-indigo-500 mt-2">
                                        Chief: {sched.chief_examiner}<br />
                                        Secretary: {sched.secretary}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {renderDocumentGroup("Proposal Phase", PROPOSAL_DOCS, "Proposal")}
            {isProposalCleared ? (
                renderDocumentGroup("Thesis Phase", THESIS_DOCS, "Thesis")
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Thesis Phase Locked</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        All required Proposal documents must be uploaded and <span className="font-semibold text-gray-700">Verified</span> by the faculty before you can proceed to the Thesis phase.
                    </p>
                </div>
            )}
        </div>
    );
};

export const SubmitDocument = () => {
    const { submissions, currentUser, addSubmission, updateSubmissionFile } = useMockData();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [phase, setPhase] = useState('Proposal');
    const [selectedDoc, setSelectedDoc] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const mySubmissions = submissions.filter(s => Number(s.student_id) === Number(currentUser?.id));
    const requiredDocs = phase === 'Proposal' ? PROPOSAL_DOCS : THESIS_DOCS;
    const existingSubmission = mySubmissions.find(s => s.type === phase && s.document_name === selectedDoc);

    // Check if all Proposal docs are verified
    const isProposalCleared = PROPOSAL_DOCS.every(docName =>
        mySubmissions.some(sub => sub.document_name === docName && sub.status === 'Verified')
    );

    // Reset selected doc when phase changes
    useEffect(() => {
        setSelectedDoc(requiredDocs[0] || '');
    }, [phase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedDoc) return;

        setIsUploading(true);
        setError('');
        try {
            if (existingSubmission) {
                await updateSubmissionFile(existingSubmission.id, file);
            } else {
                await addSubmission(file, phase, selectedDoc);
            }
            // Navigate to dashboard after success — avoids re-render crash
            navigate('/student');
        } catch (err) {
            console.error('Upload failed', err);
            setError(err.message || 'Upload failed. Please try again.');
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Submit Document</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Proposal', 'Thesis'].map((t) => {
                                const isLocked = t === 'Thesis' && !isProposalCleared;
                                return (
                                    <label
                                        key={t}
                                        title={isLocked ? "Complete Proposal Phase verification first." : ""}
                                        className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' :
                                            phase === t ? 'bg-indigo-50 border-indigo-600 text-indigo-700 cursor-pointer' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="phase"
                                            value={t}
                                            disabled={isLocked}
                                            checked={phase === t}
                                            onChange={(e) => setPhase(e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="font-medium">{t} {isLocked && ' (Locked)'}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Document</label>
                        <select
                            value={selectedDoc}
                            onChange={(e) => setSelectedDoc(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                        >
                            {requiredDocs.map(doc => {
                                const isSubmitted = mySubmissions.some(s => s.type === phase && s.document_name === doc);
                                return (
                                    <option key={doc} value={doc}>
                                        {doc} {isSubmitted ? '(Re-upload)' : '*'}
                                    </option>
                                );
                            })}
                        </select>
                        {existingSubmission && (
                            <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                                <RefreshCw className="w-4 h-4" />
                                This will overwrite your previously submitted document (Status: {existingSubmission.status}).
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (PDF)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50 relative">
                            <div className="space-y-1 text-center">
                                <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label className="relative cursor-pointer rounded-md bg-transparent font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                        <span>{file ? file.name : 'Choose a file'}</span>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md font-semibold text-white transition-all duration-200 uppercase tracking-wide ${(!file || isUploading)
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                                }`}
                        >
                            {isUploading ? 'Uploading...' : (existingSubmission ? 'Re-upload Document' : 'Submit Document')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
