const fs = require('fs');
const path = require('path');

/**
 * Extracts plain text from a resume file (PDF or DOCX).
 * @param {string} filePath - Absolute path to the uploaded file
 * @returns {Promise<string>} - Extracted plain text
 */
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return await extractFromPDF(filePath);
  } else if (ext === '.docx' || ext === '.doc') {
    return await extractFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Extract text from PDF using pdf-parse.
 */
const extractFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF appears to be empty or scanned (image-only). Please upload a text-based PDF.');
    }

    return cleanText(data.text);
  } catch (err) {
    if (err.message.includes('empty or scanned')) throw err;
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
};

/**
 * Extract text from DOCX using mammoth.
 */
const extractFromDOCX = async (filePath) => {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });

    if (!result.value || result.value.trim().length < 50) {
      throw new Error('DOCX file appears to be empty. Please check your document.');
    }

    return cleanText(result.value);
  } catch (err) {
    if (err.message.includes('empty')) throw err;
    throw new Error(`Failed to parse DOCX: ${err.message}`);
  }
};

/**
 * Cleans up extracted text by removing excess whitespace.
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

/**
 * Deletes a file from disk (cleanup after processing).
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Warning: Could not delete file ${filePath}:`, err.message);
  }
};

module.exports = { extractTextFromFile, deleteFile };
