import { BaseTool, RunAsyncToolRequest } from '@google/adk';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import type { FunctionDeclaration } from '@google/genai';

export interface PDFToolConfig {
  reportTitle: string;
  outputPath?: string;
}

export class PDFTool extends BaseTool {
  constructor(private config: PDFToolConfig) {
    super({
      name: 'generate_pdf_report',
      description: 'Generates a professional PDF report from a synthesis of research findings with citations.',
    });
  }

  _getDeclaration(): FunctionDeclaration {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object' as any,
        properties: {
          content: { 
            type: 'string' as any, 
            description: 'The synthesized report content with headers and paragraphs.' 
          },
          citations: { 
            type: 'array' as any, 
            items: { type: 'string' as any },
            description: 'Optional list of source citations if not already embedded in the content.' 
          }
        },
        required: ['content']
      }
    };
  }

  async runAsync({ args }: RunAsyncToolRequest): Promise<string> {
    const { content, citations = [] } = args as { content: string, citations: string[] };
    
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const margin = 50;
      const fontSize = 12;
      const titleSize = 18;
      
      let currentY = height - margin;

      // Draw Title
      page.drawText(this.config.reportTitle, {
        x: margin,
        y: currentY,
        size: titleSize,
        font: boldFont,
        color: rgb(0, 0, 0.4),
      });
      currentY -= 40;

      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
          if (textWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      const drawWrappedText = (text: string, isBold: boolean = false) => {
        const maxWidth = width - 2 * margin;
        const subLines = wrapText(text, maxWidth);
        for (const subLine of subLines) {
          if (currentY < margin + 20) {
            page = pdfDoc.addPage();
            currentY = height - margin;
          }
          page.drawText(subLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: isBold ? boldFont : timesRomanFont,
          });
          currentY -= 15;
        }
        currentY -= 10; // Extra spacing between paragraphs
      };

      // In-line content splitting
      const sections = content.split('\n');
      for (const section of sections) {
        if (!section.trim()) {
           currentY -= 10;
           continue;
        }
        // Very basic Header detection
        const isHeader = section.startsWith('#') || section.toUpperCase() === section;
        drawWrappedText(section.replace(/^#+\s*/, ''), isHeader);
      }

      // Citations Section
      if (citations.length > 0) {
        if (currentY < margin + 60) {
          page = pdfDoc.addPage();
          currentY = height - margin;
        }
        currentY -= 20;
        page.drawText('REFERENCES & CITATIONS:', {
          x: margin,
          y: currentY,
          size: 14,
          font: boldFont,
        });
        currentY -= 20;

        for (const citation of citations) {
          drawWrappedText(`[Cite] ${citation}`);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const filename = this.config.outputPath || `grounded_report_${Date.now()}.pdf`;
      const fullPath = path.resolve(process.cwd(), filename);
      fs.writeFileSync(fullPath, pdfBytes);

      return `Successfully synthesized report to: ${fullPath}`;
    } catch (error: any) {
       console.error('PDF Tool Error:', error);
       return `Failed to generate PDF: ${error.message}`;
    }
  }
}


