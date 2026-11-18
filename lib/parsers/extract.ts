import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import mammoth from 'mammoth';

const pdfParse = require('pdf-parse');

export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  try {
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    } else if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } else if (ext === 'xlsx' || ext === 'xls' || mimeType.includes('spreadsheet')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        text += `\n--- Sheet: ${sheetName} ---\n` + XLSX.utils.sheet_to_csv(sheet);
      });
      return text;
    } else if (ext === 'csv' || mimeType === 'text/csv') {
      const csvString = buffer.toString('utf-8');
      const parsed = Papa.parse(csvString, { header: true });
      return JSON.stringify(parsed.data, null, 2);
    } else {
      return buffer.toString('utf-8');
    }
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error);
    throw new Error(`Failed to extract text from file ${filename}`);
  }
}

export function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const words = cleaned.split(' ');
  const chunks: string[] = [];
  
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(' '));
    i += (chunkSize - overlap);
  }

  return chunks;
}
