import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext.jsx';
import { Calendar, Users, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getDocumentSortIndex, PROPOSAL_DOCS, THESIS_DOCS } from '../utils/constants.js';

export const SupervisorDashboard = () => {
    const { submissions, schedules } = useMockData();
    const [expandedStudents, setExpandedStudents] = useState({});

    const toggleStudent = (studentId) => {
        setExpandedStudents(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    // Calculate unique students for metrics
    const totalStudents = new Set(submissions.map(s => s.student_id)).size;
    const studentsWithVerifiedProposals = new Set(submissions.filter(s => s.type === 'Proposal' && s.status === 'Verified').map(s => s.student_id)).size;
    const studentsWithVerifiedDefenses = new Set(submissions.filter(s => s.type === 'Thesis' && s.status === 'Verified').map(s => s.student_id)).size;

    // Group everything by student using `submissions`
    const groupedStudents = Object.values(submissions.reduce((acc, sub) => {
        const key = sub.student_id;
        if (!acc[key]) {
            acc[key] = {
                studentId: sub.student_id,
                studentName: sub.student_name || 'Mahasiswa Tidak Dikenal',
                studentIdentifier: sub.student_identifier || 'Tanpa NIM',
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
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Ringkasan Supervisor</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl shadow-inner">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{totalStudents}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Mahasiswa</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600 rounded-xl shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{studentsWithVerifiedProposals}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Siap Sidang Proposal</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="p-4 bg-gradient-to-br from-fuchsia-100 to-purple-100 text-purple-600 rounded-xl shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-slate-800">{studentsWithVerifiedDefenses}</div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Siap Sidang Skripsi</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Ringkasan Mahasiswa</h3>
                </div>

                {groupedStudents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        Belum ada aktivitas mahasiswa.
                    </div>
                ) : (
                    groupedStudents.map(student => (
                        <div key={student.studentId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => toggleStudent(student.studentId)}
                                className="w-full text-left bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-white px-6 py-5 border-b border-gray-200 flex justify-between items-center gap-4 transition-colors duration-200"
                            >
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700">{student.studentName}</h4>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                                        <span>NIM: <span className="font-medium text-gray-800">{student.studentIdentifier}</span></span>
                                        <span>Email: <span className="font-medium text-gray-800">{student.studentEmail}</span></span>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {expandedStudents[student.studentId] ? (
                                        <ChevronUp className="w-6 h-6" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6" />
                                    )}
                                </div>
                            </button>

                            {expandedStudents[student.studentId] && (
                                <div className="px-6 py-5 animate-in slide-in-from-top-2 duration-200">
                                    <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Dokumen yang Diunggah
                                    </h5>
                                    {student.documents.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Belum ada dokumen yang diunggah.</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {['Proposal', 'Thesis'].map(phase => {
                                                const phaseDocs = student.documents
                                                    .filter(d => d.type === phase)
                                                    .sort((a, b) => getDocumentSortIndex(a.document_name, a.type) - getDocumentSortIndex(b.document_name, b.type));

                                                if (phaseDocs.length === 0) return null;

                                                return (
                                                    <div key={phase}>
                                                        <h6 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Fase {phase === 'Thesis' ? 'Skripsi' : phase}</h6>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {phaseDocs.map(doc => (
                                                                <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                                                            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">{doc.type}</span>
                                                                            {doc.document_name}
                                                                            {doc.is_reuploaded === 1 && (
                                                                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                                                                                    <AlertCircle className="w-3 h-3" /> Diunggah Ulang
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 mt-1.5 inline-block font-medium">
                                                                            Lihat Dokumen →
                                                                        </a>
                                                                    </div>
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${doc.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                        doc.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                        }`}>
                                                                        {doc.status === 'Verified' ? 'Terverifikasi' : doc.status === 'Rejected' ? 'Ditolak' : 'Menunggu'}
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
                                                <Calendar className="w-4 h-4" /> Jadwal Sidang
                                            </h5>
                                            <div className="space-y-4">
                                                {student.schedules.map(sched => (
                                                    <div key={sched.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h6 className="font-bold text-indigo-900 text-lg">Sidang {sched.type === 'Thesis' ? 'Skripsi' : sched.type}</h6>
                                                            <div className="bg-white text-indigo-700 font-semibold px-3 py-1 rounded-md text-sm shadow-sm border border-indigo-100">
                                                                {new Date(sched.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
                                                            <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Ketua Penguji:</span> <span className="text-indigo-900 font-medium">{sched.chief_examiner}</span></div>
                                                            <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Sekretaris:</span> <span className="text-indigo-900 font-medium">{sched.secretary}</span></div>
                                                            <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Penguji 1:</span> <span className="text-indigo-900 font-medium">{sched.examiner_1}</span></div>
                                                            <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Penguji 2:</span> <span className="text-indigo-900 font-medium">{sched.examiner_2}</span></div>
                                                            <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Penguji 3:</span> <span className="text-indigo-900 font-medium">{sched.examiner_3}</span></div>
                                                            {sched.examiner_4 && <div className="flex items-center gap-2"><span className="text-indigo-400 font-medium w-24">Penguji 4:</span> <span className="text-indigo-900 font-medium">{sched.examiner_4}</span></div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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

    // Helper to check if a student has all required docs verified for a phase
    const hasAllDocsVerified = (studentId, phase) => {
        const studentDocs = submissions.filter(s => s.student_id === studentId && s.type === phase);
        const requiredDocsLength = phase === 'Proposal' ? PROPOSAL_DOCS.length : THESIS_DOCS.length;

        // Count unique verified document types the student has
        const verifiedDocs = new Set(
            studentDocs.filter(d => d.status === 'Verified').map(d => d.document_name)
        );

        return verifiedDocs.size === requiredDocsLength;
    };

    // Get unique students who have all docs verified but NO schedule yet for that phase
    const getEligibleStudents = (phase) => {
        const uniqueStudentIds = [...new Set(submissions.map(s => s.student_id))];
        return uniqueStudentIds
            .filter(id => hasAllDocsVerified(id, phase))
            .filter(id => {
                // Check if they already have a schedule for this phase (by looking up any of their submissions)
                const studentSubIds = submissions.filter(s => s.student_id === id && s.type === phase).map(s => s.id);
                return !schedules.some(sched => studentSubIds.includes(sched.submission_id));
            })
            .map(id => {
                const sub = submissions.find(s => s.student_id === id); // just get any sub to grab their name
                return {
                    id: id,
                    name: sub?.student_name || `Student #${id}`,
                    // Provide a reference submission_id to use for the schedule mapping
                    submission_id: submissions.find(s => s.student_id === id && s.type === phase)?.id
                };
            });
    };

    const eligibleProposalStudents = getEligibleStudents('Proposal');
    const eligibleThesisStudents = getEligibleStudents('Thesis');

    const defaultFormState = {
        submission_id: '',
        event_date: '',
        chief_examiner: '',
        secretary: '',
        examiner_1: '',
        examiner_2: '',
        examiner_3: '',
        examiner_4: '',
    };

    const [proposalForm, setProposalForm] = useState(defaultFormState);
    const [thesisForm, setThesisForm] = useState(defaultFormState);

    const handleProposalChange = (e) => {
        setProposalForm({ ...proposalForm, [e.target.name]: e.target.value });
    };

    const handleThesisChange = (e) => {
        setThesisForm({ ...thesisForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e, formType) => {
        e.preventDefault();

        const formState = formType === 'Proposal' ? proposalForm : thesisForm;
        if (!formState.submission_id || !formState.event_date) return;

        let scheduleData = { ...formState, submission_id: parseInt(formState.submission_id) };
        if (formType === 'Proposal') {
            scheduleData.examiner_4 = null; // proposals don't need 4th examiner
        }

        addSchedule(scheduleData);
        setSuccessMsg(`Sidang ${formType === 'Thesis' ? 'Skripsi' : formType} berhasil dijadwalkan!`);
        setTimeout(() => setSuccessMsg(''), 3000);

        if (formType === 'Proposal') {
            setProposalForm(defaultFormState);
        } else {
            setThesisForm(defaultFormState);
        }
    };

    // Helper to filter out already selected examiners in a specific form context
    const getAvailableExaminers = (formState, currentField) => {
        const selectedIds = Object.entries(formState)
            .filter(([key, value]) => key.startsWith('chief') || key.startsWith('sec') || key.startsWith('exam'))
            .filter(([key, value]) => key !== currentField && value !== '')
            .map(([key, value]) => value);

        return examiners.filter(ex => !selectedIds.includes(ex.name));
    };

    // Helper to render the scheduling form to avoid code duplication
    const renderScheduleForm = (formType, dataList, formState, handleChange) => {
        if (dataList.length === 0) {
            return (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-100">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Semua sidang {formType === 'Thesis' ? 'skripsi' : 'proposal'} yang terverifikasi telah dijadwalkan.</p>
                </div>
            );
        }

        return (
            <form onSubmit={(e) => handleSubmit(e, formType)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl" />
                <h3 className="text-xl font-bold text-gray-900 mb-6">Fase {formType === 'Thesis' ? 'Skripsi' : formType}</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mahasiswa ({formType === 'Thesis' ? 'Skripsi' : formType})</label>
                        <select
                            name="submission_id"
                            value={formState.submission_id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">- Pilih mahasiswa -</option>
                            {dataList.map(student => (
                                <option key={student.id} value={student.submission_id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Sidang</label>
                        <input
                            type="date"
                            name="event_date"
                            value={formState.event_date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>

                    <div className="col-span-2">
                        <h4 className="font-medium text-gray-900 border-b pb-2 mb-4 mt-2">Tugaskan Panel</h4>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ketua Penguji</label>
                        <select name="chief_examiner" required value={formState.chief_examiner} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Pilih...</option>
                            {getAvailableExaminers(formState, 'chief_examiner').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sekretaris</label>
                        <select name="secretary" required value={formState.secretary} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Pilih...</option>
                            {getAvailableExaminers(formState, 'secretary').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Penguji 1</label>
                        <select name="examiner_1" required value={formState.examiner_1} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Pilih...</option>
                            {getAvailableExaminers(formState, 'examiner_1').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Penguji 2</label>
                        <select name="examiner_2" required value={formState.examiner_2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Pilih...</option>
                            {getAvailableExaminers(formState, 'examiner_2').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Penguji 3</label>
                        <select name="examiner_3" required value={formState.examiner_3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">Pilih...</option>
                            {getAvailableExaminers(formState, 'examiner_3').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>

                    {formType === 'Thesis' && (
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Penguji 4 (Hanya Sidang Akhir)</label>
                            <select name="examiner_4" required value={formState.examiner_4} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="">Pilih...</option>
                                {getAvailableExaminers(formState, 'examiner_4').map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-200 mt-6">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide uppercase py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Jadwalkan Sidang {formType === 'Thesis' ? 'Skripsi' : formType}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Jadwal Sidang</h2>

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                    <CheckCircle className="w-5 h-5" /> {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-12">
                <div>
                    {renderScheduleForm('Proposal', eligibleProposalStudents, proposalForm, handleProposalChange)}
                </div>
                <div>
                    {renderScheduleForm('Thesis', eligibleThesisStudents, thesisForm, handleThesisChange)}
                </div>
            </div>
        </div>
    );
};
