import { FunctionTool, ToolContext } from '@google/adk';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const GeneratePdfSchema = z.object({
  report: z.string().describe('The markdown content of the report'),
  images: z.array(z.string()).optional().describe('List of image URLs to include')
});

type GeneratePdfParams = z.infer<typeof GeneratePdfSchema>;

async function generateMultimodalPdf(
  params: GeneratePdfParams,
  context?: ToolContext
): Promise<{ status: string; pdf_path: string }> {
  console.log("--- PDF Generator: Creating multimodal report ---");
  
  const doc = new PDFDocument();
  const outputPath = path.join(process.cwd(), 'fishermans_wharf_report.pdf');
  const stream = fs.createWriteStream(outputPath);
  
  doc.pipe(stream);
  
  doc.fontSize(25).text("Fisherman's Wharf Culinary Report", { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(params.report);
  
  if (params.images && params.images.length > 0) {
    doc.addPage();
    doc.fontSize(18).text("Visual Insights", { align: 'center' });
    params.images.forEach(img => {
      doc.moveDown().fillColor('blue').text(`[Image Link: ${img}]`).fillColor('black');
    });
  }
  
  doc.end();
  
  return new Promise((resolve) => {
    stream.on('finish', () => resolve({ status: "success", pdf_path: outputPath }));
  });
}

export const pdfTool = new FunctionTool({
  name: "generate_multimodal_pdf",
  description: "Generates a professional PDF report with text and image links.",
  execute: generateMultimodalPdf as any,
  parameters: GeneratePdfSchema
});
