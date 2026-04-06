const pdfParse = require('pdf-parse');
// pdf-parse v1 exports the function directly; wrap in case of CJS default interop
module.exports = { pdfParse: typeof pdfParse === 'function' ? pdfParse : pdfParse.default };
