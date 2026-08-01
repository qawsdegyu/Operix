const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class RagService {
  constructor() {
    this.kbDir = path.join(process.cwd(), 'operix');
  }

  async getContextString() {
    let contextString = "No local documents found.";
    
    try {
      if (fs.existsSync(this.kbDir)) {
        const files = fs.readdirSync(this.kbDir);
        let allText = [];
        for (const filename of files) {
          const filePath = path.join(this.kbDir, filename);
          if (filename.endsWith('.txt') || filename.endsWith('.md')) {
            const text = fs.readFileSync(filePath, 'utf8');
            allText.push(`--- Context from ${filename} ---\n${text}`);
          } else if (filename.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            let parseFunc = pdfParse;
            if (typeof pdfParse !== 'function') {
              parseFunc = pdfParse.default || (pdfParse.pdfParse ? pdfParse.pdfParse : pdfParse);
            }
            const data = await parseFunc(dataBuffer);
            allText.push(`--- Context from ${filename} ---\n${data.text}`);
          }
        }
        if (allText.length > 0) {
          contextString = allText.join('\n\n');
        }
      }
    } catch (err) {
      console.error("Error reading folder:", err);
      throw new Error("Failed to read knowledge base.");
    }
    
    return contextString;
  }
}

module.exports = new RagService();
