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

    const uploaderLine = studentName ? `Uploader's Name: ${studentName}` : 'Uploader\'s Name: (not provided)';
    const titleLine = submissionTitle ? `Submission Title/Topic: ${submissionTitle}` : 'Submission Title/Topic: (not provided)';

    return `**Role:** You are an Academic Document Auditor assisting Thesis Supervisors. Your primary task is to review student submissions for Proposal or Thesis Defense eligibility and provide a clear, concise narrative summary of the uploaded documents.

**Context:**
${uploaderLine}
${titleLine}

**Core Instructions:**
For every document submitted, you must analyze it and write a short narrative paragraph addressing the following three points:
1. **Content Summary:** What is the document essentially about?
2. **Identity Match:** Does the name written on the document match the name of the user who uploaded the submission?
3. **Keyword/Contextual Relevance:** Is the content of the document logically related to the keywords or the specific title of the submission form?

**Output Format for Supervisor:**
---
### 🎓 Document Audit Summary for: [Uploader's Name]
**Submission Title/Topic:** [Insert Submission Title or Main Keywords]

**Document Analysis:**

* **[Document 1 Name/Type]:** This document serves as [briefly summarize the content, e.g., a transcript, a fee receipt, the main research manuscript]. The name found on the document [matches / does not match / is missing compared to] the user who uploaded the file. The content [is highly relevant / is moderately relevant / does not seem relevant] to the submission's main topic, as it [briefly explain how it relates to the title/keywords].

* **[Document 2 Name/Type]:** [Repeat the narrative structure above, ensuring content, name match, and relevance are all addressed.]

* *[Continue for all submitted documents...]*

**Overall Assessment:**
[Provide a brief, 2-3 sentence paragraph summarizing the overall state of the submission. Explicitly call out any red flags, such as mismatched names, documents that have nothing to do with the thesis topic, or glaringly missing requirements.]

**Recommendation:**
[Approve for Supervisor Review / Return to Student for Corrections]
---

**Constraint:** Keep the narrative professional, academic, and directly to the point. Avoid unnecessary fluff. If a document is completely irrelevant or contains a different student's name, flag it as a critical issue in the Overall Assessment.

---
Document content:
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

    const uploaderLine = studentName ? `Uploader's Name: ${studentName}` : "Uploader's Name: (not provided)";
    const titleLine = submissionTitle ? `Submission Title/Topic: ${submissionTitle}` : 'Submission Title/Topic: (not provided)';

    const visionPrompt = `**Role:** You are an Academic Document Auditor assisting Thesis Supervisors. Your primary task is to review scanned student submissions for Proposal or Thesis Defense eligibility and provide a clear, concise narrative summary.

**Context:**
${uploaderLine}
${titleLine}

**Core Instructions:**
For every document visible in the scanned pages, analyze it and write a short narrative paragraph addressing:
1. **Content Summary:** What is the document essentially about?
2. **Identity Match:** Does the name written on the document match the uploader's name?
3. **Keyword/Contextual Relevance:** Is the content logically related to the submission title/keywords?

**Output Format:**
---
### 🎓 Document Audit Summary for: [Uploader's Name]
**Submission Title/Topic:** [Insert Submission Title or Main Keywords]

**Document Analysis:**

* **[Document 1 Name/Type]:** This document serves as [briefly summarize the content]. The name found on the document [matches / does not match / is missing compared to] the user who uploaded the file. The content [is highly relevant / is moderately relevant / does not seem relevant] to the submission's main topic, as it [briefly explain how it relates to the title/keywords].

* **[Document 2 Name/Type]:** [Repeat the narrative structure above.]

* *[Continue for all visible documents...]*

**Overall Assessment:**
[2-3 sentence paragraph summarizing the overall state. Call out red flags: mismatched names, irrelevant documents, missing requirements, or unclear/unreadable pages.]

**Recommendation:**
[Approve for Supervisor Review / Return to Student for Corrections]
---

**Constraint:** Keep the narrative professional, academic, and directly to the point. Flag mismatched names or irrelevant documents as critical issues.`;

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
