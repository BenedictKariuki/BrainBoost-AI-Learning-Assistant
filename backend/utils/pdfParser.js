import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text:string,numPages:number}>}
 */

export const extractTextFromPDF = async (filePath) => {
  try {
    // if no encoding is specified, the data is returned as a <Buffer> object
    const dataBuffer = await fs.readFile(filePath);
    // pdf-parse expects a Uint8Array, not a buffer. PDFParse() converts NodeJS buffer object to Uint8Array automatically
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();
    return {
      text: data.text,
      numPages: data.pages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
