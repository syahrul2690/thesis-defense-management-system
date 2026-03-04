import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext.jsx';
import { Calendar, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { getDocumentSortIndex } from '../utils/constants.js';

export const SupervisorDashboard = () => {
    const { submissions, schedules } = useMockData();

    const totalSubmissions = submissions.length;
    const verifiedProposals = submissions.filter(s => s.type === 'Proposal' && s.status === 'Verified').length;
    const verifiedDefenses = submissions.filter(s => s.type === 'Defense' && s.status === 'Verified').length;

    // Group everything by student using `submissions`
    const groupedStudents = Object.values(submissions.reduce((acc, sub) => {
        const key = sub.student_id;
        if (!acc[key]) {
            acc[key] = {
                studentId: sub.student_id,
                studentName: sub.student_name || 'Unknown Student',
                studentIdentifier: sub.student_identifier || 'No ID',
                studentEmail: sub.student_email || '',
                documents: [],
                schedules: []
            };
        }
        acc[key].documents.push(sub);

        // Find if this submission has a schedule mapped
        const sched = schedules.find(s => s.submission_id === sub.id);
        if (sched && !acc[key].schedules.some(s => s.id === sched.id)) {
            acc[key].schedules.push({ ...sched, type: sub.type });
        }
        return acc;
    }, {}));

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Supervisor Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl shadow-inner">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{totalSubmissions}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Submissions</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600 rounded-xl shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{verifiedProposals}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Verified Proposals</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-fuchsia-100 to-purple-100 text-purple-600 rounded-xl shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{verifiedDefenses}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Verified Defenses</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Student Overviews</h3>
                </div>

                {groupedStudents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        No student activity found yet.
                    </div>
                ) : (
                    groupedStudents.map(student => (
                        <div key={student.studentId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{student.studentName}</h4>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                                        <span>NIM: <span className="font-medium text-gray-800">{student.studentIdentifier}</span></span>
                                        <span>Email: <span className="font-medium text-gray-800">{student.studentEmail}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5">
                                <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Uploaded Documents
                                </h5>
                                {student.documents.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No documents uploaded yet.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {['Proposal', 'Thesis'].map(phase => {
                                            const phaseDocs = student.documents
                                                .filter(d => d.type === phase)
                                                .sort((a, b) => getDocumentSortIndex(a.document_name, a.type) - getDocumentSortIndex(b.document_name, b.type));

                                            if (phaseDocs.length === 0) return null;

                                            return (
                                                <div key={phase}>
                                                    <h6 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">{phase} Phase</h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {phaseDocs.map(doc => (
                                                            <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                                                        <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">{doc.type}</span>
                                                                        {doc.document_name}
                                                                        {doc.is_reuploaded === 1 && (
                                                                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                                                                                <AlertCircle className="w-3 h-3" /> Re-uploaded
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 mt-1.5 inline-block font-medium">
                                                                        View Document →
                                                                    </a>
                                                                </div>
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${doc.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    doc.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                    }`}>
                                                                    {doc.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {student.schedules.length > 0 && (
                                    <div className="mt-8">
                                        <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Scheduled Defenses
                                        </h5>
                                        <div className="space-y-4">
                                            {student.schedules.map(sched => (
                                                <div key={sched.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h6 className="font-bold text-indigo-900 text-lg">{sched.type} Defense</h6>
                                                        <div className="bg-white text-indigo-700 font-semibold px-3 py-1 rounded-md text-sm shadow-sm border border-indigo-100">
                                                            {new Date(sched.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
                                                        <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Chief:</span> <span className="text-indigo-900 font-medium">{sched.chief_examiner}</span></div>
                                                        <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Secretary:</span> <span className="text-indigo-900 font-medium">{sched.secretary}</span></div>
                                                        <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Examiner 1:</span> <span className="text-indigo-900 font-medium">{sched.examiner_1}</span></div>
                                                        <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Examiner 2:</span> <span className="text-indigo-900 font-medium">{sched.examiner_2}</span></div>
                                                        <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Examiner 3:</span> <span className="text-indigo-900 font-medium">{sched.examiner_3}</span></div>
                                                        {sched.examiner_4 && <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Examiner 4:</span> <span className="text-indigo-900 font-medium">{sched.examiner_4}</span></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const ScheduleDefense = () => {
    const { submissions, examiners, addSchedule, schedules } = useMockData();
    const [successMsg, setSuccessMsg] = useState('');

    // Only Verified submissions that haven't been scheduled yet
    const verfiedUnscheduled = submissions.filter(sub =>
        sub.status === 'Verified' &&
        !schedules.some(sched => sched.submission_id === sub.id)
    );

    const [formData, setFormData] = useState({
        submission_id: '',
        event_date: '',
        chief_examiner: '',
        secretary: '',
        examiner_1: '',
        examiner_2: '',
        examiner_3: '',
        examiner_4: '',
    });

    const isProposal = (subId) => {
        const sub = submissions.find(s => s.id === parseInt(subId));
        return sub?.type === 'Proposal';
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.submission_id || !formData.event_date) return;

        let scheduleData = { ...formData, submission_id: parseInt(formData.submission_id) };
        if (isProposal(scheduleData.submission_id)) {
            scheduleData.examiner_4 = null; // proposals don't need 4th examiner mapping
        }

        addSchedule(scheduleData);
        setSuccessMsg('Defense successfully scheduled!');
        setTimeout(() => setSuccessMsg(''), 3000);

        // Reset form
        setFormData({
            submission_id: '', event_date: '', chief_examiner: '', secretary: '',
            examiner_1: '', examiner_2: '', examiner_3: '', examiner_4: ''
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Schedule Defenses</h2>

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                    <CheckCircle className="w-5 h-5" /> {successMsg}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {verfiedUnscheduled.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>All verified submissions have been scheduled.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Verified Submission</label>
                                <select
                                    name="submission_id"
                                    value={formData.submission_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">- Select a submission -</option>
                                    {verfiedUnscheduled.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            Student #{sub.student_id} - {sub.type} (Submitted {new Date(sub.created_at).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>

                            <div className="col-span-2">
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4 mt-2">Assign Panel</h4>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chief Examiner</label>
                                <select name="chief_examiner" required value={formData.chief_examiner} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select...</option>
                                    {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secretary</label>
                                <select name="secretary" required value={formData.secretary} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select...</option>
                                    {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Examiner 1</label>
                                <select name="examiner_1" required value={formData.examiner_1} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select...</option>
                                    {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Examiner 2</label>
                                <select name="examiner_2" required value={formData.examiner_2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select...</option>
                                    {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Examiner 3</label>
                                <select name="examiner_3" required value={formData.examiner_3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select...</option>
                                    {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                </select>
                            </div>

                            {formData.submission_id && !isProposal(formData.submission_id) && (
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Examiner 4 (Final Defense Only)</label>
                                    <select name="examiner_4" required value={formData.examiner_4} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Select...</option>
                                        {examiners.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 border-t border-slate-200 mt-6">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide uppercase py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Schedule Event
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
