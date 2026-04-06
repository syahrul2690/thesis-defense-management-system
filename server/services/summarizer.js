import fs from 'fs';
import { createRequire } from 'module';
import * as mupdf from 'mupdf';

const require = createRequire(import.meta.url);
const { pdfParse } = require('./pdf-helper.cjs');

// ─── Shared audit prompt (text-based) ────────────────────────────────────────

function buildTextPrompt(text, studentName = null, submissionTitle = null) {
    const trimmedText = text.length > 12000
        ? text.slice(0, 12000) + '\n\n[... dokumen dipotong karena terlalu panjang]'
        : text;

    const uploaderLine = studentName ? `Nama Pengunggah: ${studentName}` : 'Nama Pengunggah: (tidak tersedia)';
    const titleLine = submissionTitle ? `Judul/Topik Pengajuan: ${submissionTitle}` : 'Judul/Topik Pengajuan: (tidak tersedia)';

    return `**Peran:** Anda adalah Auditor Dokumen Akademik yang membantu Dosen Pembimbing Skripsi. Tugas utama Anda adalah menelaah dokumen yang diunggah mahasiswa untuk kelayakan Sidang Proposal atau Sidang Akhir, dan memberikan ringkasan naratif yang jelas dan padat.

**Konteks:**
${uploaderLine}
${titleLine}

**Instruksi Utama:**
Untuk setiap dokumen yang diunggah, analisis dan tulis paragraf naratif singkat yang mencakup tiga poin berikut:
1. **Ringkasan Isi:** Apa inti dari dokumen tersebut?
2. **Kesesuaian Identitas:** Apakah nama yang tertera pada dokumen sesuai dengan nama mahasiswa yang mengunggah?
3. **Relevansi Konten:** Apakah isi dokumen secara logis berkaitan dengan judul atau topik pengajuan?

**Format Output untuk Dosen Pembimbing:**
---
### 🎓 Ringkasan Audit Dokumen untuk: [Nama Pengunggah]
**Judul/Topik Pengajuan:** [Isi Judul atau Kata Kunci Utama]

**Analisis Dokumen:**

* **[Nama/Jenis Dokumen 1]:** Dokumen ini berfungsi sebagai [ringkas isi dokumen, mis. transkrip nilai, bukti pembayaran, naskah penelitian utama]. Nama yang tertera pada dokumen [sesuai / tidak sesuai / tidak ditemukan] dengan nama mahasiswa pengunggah. Isi dokumen [sangat relevan / cukup relevan / tidak relevan] dengan topik pengajuan, karena [jelaskan singkat keterkaitannya dengan judul/kata kunci].

* **[Nama/Jenis Dokumen 2]:** [Ulangi struktur naratif di atas, pastikan isi, kesesuaian nama, dan relevansi tercakup.]

* *[Lanjutkan untuk semua dokumen yang diunggah...]*

**Penilaian Keseluruhan:**
[Tulis paragraf singkat 2-3 kalimat yang merangkum kondisi keseluruhan pengajuan. Sebutkan secara eksplisit setiap temuan penting, seperti nama yang tidak sesuai, dokumen yang tidak relevan dengan topik skripsi, atau persyaratan yang jelas-jelas kurang.]

**Rekomendasi:**
[Disetujui untuk Ditinjau Pembimbing / Dikembalikan ke Mahasiswa untuk Perbaikan]
---

**Batasan:** Gunakan bahasa yang profesional, akademis, dan langsung pada inti permasalahan. Hindari penjelasan yang tidak perlu. Jika dokumen sama sekali tidak relevan atau mencantumkan nama mahasiswa yang berbeda, tandai sebagai masalah kritis pada bagian Penilaian Keseluruhan. Seluruh output harus dalam Bahasa Indonesia.

---
Isi dokumen:
${trimmedText}
---`;
}

// ─── Render PDF pages to base64 images via mupdf ─────────────────────────────

function renderPagesToBase64(dataBuffer, maxPages = 5) {
    const doc = mupdf.Document.openDocument(dataBuffer, 'application/pdf');
    const totalPages = doc.countPages();
    const pagesToRender = Math.min(totalPages, maxPages);
    const images = [];

    for (let i = 0; i < pagesToRender; i++) {
        const page = doc.loadPage(i);
        const matrix = mupdf.Matrix.scale(1.5, 1.5); // 1.5x is enough for LLM vision
        const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
        const pngBuffer = Buffer.from(pixmap.asPNG());
        images.push(pngBuffer.toString('base64'));
    }

    return { images, totalPages };
}

// ─── Vision LLM for scanned PDFs (OpenRouter) ────────────────────────────────

async function summarizeScannedWithOpenRouter(dataBuffer, studentName = null, submissionTitle = null) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment variables.');

    console.log('📷 Scanned PDF — rendering pages for vision LLM...');
    const { images, totalPages } = renderPagesToBase64(dataBuffer, 5);
    console.log(`🖼️  Sending ${images.length}/${totalPages} pages to vision LLM...`);

    const uploaderLine = studentName ? `Nama Pengunggah: ${studentName}` : 'Nama Pengunggah: (tidak tersedia)';
    const titleLine = submissionTitle ? `Judul/Topik Pengajuan: ${submissionTitle}` : 'Judul/Topik Pengajuan: (tidak tersedia)';

    const visionPrompt = `**Peran:** Anda adalah Auditor Dokumen Akademik yang membantu Dosen Pembimbing Skripsi. Tugas utama Anda adalah menelaah dokumen hasil scan yang diunggah mahasiswa untuk kelayakan Sidang Proposal atau Sidang Akhir, dan memberikan ringkasan naratif yang jelas dan padat.

**Konteks:**
${uploaderLine}
${titleLine}

**Instruksi Utama:**
Untuk setiap dokumen yang terlihat pada halaman hasil scan, analisis dan tulis paragraf naratif singkat yang mencakup:
1. **Ringkasan Isi:** Apa inti dari dokumen tersebut?
2. **Kesesuaian Identitas:** Apakah nama yang tertera pada dokumen sesuai dengan nama pengunggah?
3. **Relevansi Konten:** Apakah isi dokumen secara logis berkaitan dengan judul atau topik pengajuan?

**Format Output:**
---
### 🎓 Ringkasan Audit Dokumen untuk: [Nama Pengunggah]
**Judul/Topik Pengajuan:** [Isi Judul atau Kata Kunci Utama]

**Analisis Dokumen:**

* **[Nama/Jenis Dokumen 1]:** Dokumen ini berfungsi sebagai [ringkas isi dokumen]. Nama yang tertera pada dokumen [sesuai / tidak sesuai / tidak ditemukan] dengan nama mahasiswa pengunggah. Isi dokumen [sangat relevan / cukup relevan / tidak relevan] dengan topik pengajuan, karena [jelaskan singkat keterkaitannya].

* **[Nama/Jenis Dokumen 2]:** [Ulangi struktur naratif di atas.]

* *[Lanjutkan untuk semua dokumen yang terlihat...]*

**Penilaian Keseluruhan:**
[Paragraf 2-3 kalimat yang merangkum kondisi keseluruhan pengajuan. Sebutkan temuan penting: nama yang tidak sesuai, dokumen tidak relevan, persyaratan kurang, atau halaman yang tidak terbaca.]

**Rekomendasi:**
[Disetujui untuk Ditinjau Pembimbing / Dikembalikan ke Mahasiswa untuk Perbaikan]
---

**Batasan:** Gunakan bahasa yang profesional, akademis, dan langsung pada inti permasalahan. Tandai nama yang tidak sesuai atau dokumen tidak relevan sebagai masalah kritis. Seluruh output harus dalam Bahasa Indonesia.`;

    // Build message content: prompt + all page images
    const content = [
        { type: 'text', text: visionPrompt },
        ...images.map((b64, i) => ({
            type: 'image_url',
            image_url: { url: `data:image/png;base64,${b64}` }
        }))
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tdms.local',
            'X-Title': 'TDMS PDF Summarizer'
        },
        body: JSON.stringify({
            model: 'minimax/minimax-m2.5:free',
            messages: [{ role: 'user', content }],
            max_tokens: 800,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter vision API error: ${response.status} — ${err}`);
    }

    const result = await response.json();
    const summaryText = result?.choices?.[0]?.message?.content;
    if (!summaryText) throw new Error('OpenRouter vision returned an empty response.');
    return summaryText.trim();
}

// ─── Text extraction ──────────────────────────────────────────────────────────

export async function extractTextFromPDF(absoluteFilePath) {
    const dataBuffer = fs.readFileSync(absoluteFilePath);

    if (dataBuffer.length < 100) {
        throw new Error('File PDF terlalu kecil atau tidak valid. Mahasiswa perlu mengunggah ulang dokumen yang benar.');
    }

    let data;
    try {
        data = await pdfParse(dataBuffer);
    } catch (err) {
        throw new Error('PDF tidak dapat dibaca. Kemungkinan file rusak atau bukan PDF yang valid. Mahasiswa perlu mengunggah ulang.');
    }

    const rawText = data.text || '';
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;

    return { text: rawText, numPages: data.numpages, wordCount, dataBuffer };
}

// ─── LLM providers (text-based) ──────────────────────────────────────────────

async function summarizeWithGemini(text, studentName, submissionTitle) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: buildTextPrompt(text, studentName, submissionTitle) }] }],
                generationConfig: { maxOutputTokens: 800, temperature: 0.3 }
            })
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${response.status} — ${err}`);
    }

    const result = await response.json();
    const summaryText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!summaryText) throw new Error('Gemini returned an empty response.');
    return summaryText.trim();
}

async function summarizeWithOpenRouter(text, studentName, submissionTitle) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment variables.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tdms.local',
            'X-Title': 'TDMS PDF Summarizer'
        },
        body: JSON.stringify({
            model: 'stepfun/step-3.5-flash:free',
            messages: [{ role: 'user', content: buildTextPrompt(text, studentName, submissionTitle) }],
            max_tokens: 800,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} — ${err}`);
    }

    const result = await response.json();
    const summaryText = result?.choices?.[0]?.message?.content;
    if (!summaryText) throw new Error('OpenRouter returned an empty response.');
    return summaryText.trim();
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function generateSummary(absoluteFilePath, studentName = null, submissionTitle = null) {
    const { text, numPages, wordCount, dataBuffer } = await extractTextFromPDF(absoluteFilePath);

    const provider = process.env.LLM_PROVIDER || 'openrouter';
    const isScanned = wordCount < 50;
    let summary;
    let usedOCR = false;

    if (isScanned) {
        usedOCR = true;
        if (provider === 'openrouter' || provider === 'gemini') {
            summary = await summarizeScannedWithOpenRouter(dataBuffer, studentName, submissionTitle);
        } else {
            throw new Error(`Provider "${provider}" does not support vision for scanned PDFs.`);
        }
    } else {
        if (provider === 'gemini') {
            summary = await summarizeWithGemini(text, studentName, submissionTitle);
        } else if (provider === 'openrouter') {
            summary = await summarizeWithOpenRouter(text, studentName, submissionTitle);
        } else {
            throw new Error(`Provider "${provider}" belum didukung.`);
        }
    }

    return { summary, numPages, wordCount, usedOCR };
}
