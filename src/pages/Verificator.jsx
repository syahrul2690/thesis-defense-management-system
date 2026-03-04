import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext.jsx';
import { CheckCircle, XCircle, Clock, Trash2, AlertCircle } from 'lucide-react';
import { getDocumentSortIndex } from '../utils/constants.js';

export const VerificatorDashboard = () => {
    const { submissions, updateSubmissionStatus } = useMockData();

    const handleStatusUpdate = (id, newStatus) => {
        updateSubmissionStatus(id, newStatus);
    };

    // Group submissions by student
    const groupedSubmissions = Object.values(submissions.reduce((acc, sub) => {
        const key = sub.student_id;
        if (!acc[key]) {
            acc[key] = {
                studentId: sub.student_id,
                studentName: sub.student_name || 'Unknown Student',
                studentIdentifier: sub.student_identifier || 'No ID',
                studentEmail: sub.student_email || '',
                documents: []
            };
        }
        acc[key].documents.push(sub);
        return acc;
    }, {}));

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Document Verification</h2>

            {groupedSubmissions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    <p>No documents to verify.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedSubmissions.map(studentGroup => (
                        <div key={studentGroup.studentId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-900">{studentGroup.studentName}</h3>
                                <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                                    <span>NIM: <span className="font-medium text-gray-800">{studentGroup.studentIdentifier}</span></span>
                                    <span>Email: <span className="font-medium text-gray-800">{studentGroup.studentEmail}</span></span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {['Proposal', 'Thesis'].map(phase => {
                                    const phaseDocs = studentGroup.documents
                                        .filter(d => d.type === phase)
                                        .sort((a, b) => getDocumentSortIndex(a.document_name, a.type) - getDocumentSortIndex(b.document_name, b.type));

                                    if (phaseDocs.length === 0) return null;

                                    return (
                                        <div key={phase} className="p-0">
                                            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center">
                                                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">{phase} Phase</h4>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {phaseDocs.map(sub => (
                                                    <div key={sub.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 text-lg flex items-center flex-wrap gap-2">
                                                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">{sub.type}</span>
                                                                <span>{sub.document_name}</span>
                                                                {sub.is_reuploaded === 1 && (
                                                                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                                                                        <AlertCircle className="w-3 h-3" /> Re-uploaded
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                Submitted on {new Date(sub.created_at).toLocaleDateString()}
                                                            </div>
                                                            <a href={sub.file_path} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 mt-3 inline-block font-semibold">
                                                                View Document →
                                                            </a>
                                                        </div>

                                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                            {sub.status === 'Pending' ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(sub.id, 'Verified')}
                                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all shadow-sm"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" /> Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(sub.id, 'Rejected')}
                                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
                                                                    >
                                                                        <XCircle className="w-4 h-4" /> Reject
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border ${sub.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                                                    }`}>
                                                                    {sub.status === 'Verified' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                    {sub.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ManageExaminers = () => {
    const { examiners, addExaminer, removeExaminer } = useMockData();
    const [newName, setNewName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newName.trim()) {
            addExaminer(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Manage Examiners</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Dr. Alan Turing"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            Add Examiner
                        </button>
                    </form>
                </div>

                {examiners.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No examiners added yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {examiners.map(examiner => (
                            <li key={examiner.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <span className="font-medium text-gray-900">{examiner.name}</span>
                                <button
                                    onClick={() => removeExaminer(examiner.id)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                    title="Remove"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
