export const PROPOSAL_DOCS = [
    'Form Bukti Pendaftaran',
    'Print Out Rekap Nilai dari SIKADU',
    'Lembar Persetujuan yang sudah ditandatangani Pembimbing',
    'Keterangan Lunas SPP dari Bagian Keuangan',
    'Screenshot Validasi Bimbingan'
];

export const THESIS_DOCS = [
    'Form Bukti Pendaftaran',
    'Print Out Rekap Nilai dari SIKADU',
    'Surat Keterangan Lulus Ujian Komprehensif',
    'Lulus Ujian Proposal',
    'Sertifikat Workshop Penulisan Artikel Ilmiah',
    'Sertifikat Studium Generale',
    'Sertifikat Seminar Nasional',
    'Sertifikat Seminar Internasional',
    'Artikel yang Publish',
    'Surat Pernyataan Penggunaan Referensi',
    'Validasi Akhir Bimbingan',
    'Keterangan Lunas SPP',
    'Hasil Cek Plagiasi',
    'Sertifikat Pengalaman Lapangan'
];

export const getDocumentSortIndex = (docName, type) => {
    const list = type === 'Proposal' ? PROPOSAL_DOCS : THESIS_DOCS;
    const index = list.indexOf(docName);
    return index !== -1 ? index : 999;
};
