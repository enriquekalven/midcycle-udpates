import { LlmAgent, Gemini } from '@google/adk';
import { PDFTool } from '../tools/pdf_tool.js';

const pdfTool = new PDFTool({ reportTitle: 'Fisherman\'s Wharf Dining Trends & Analysis 2026' });

export const reportComposer = new LlmAgent({
  name: 'ReportComposer',
  description: 'Synthesizes all findings into a grounded report with citations and generates a PDF.',
  instruction: `
    You are a professional research analyst and report composer.
    Your objective is to take the data gathered by the SectionResearcher and the culinary insights from the CulinaryCritic 
    to create a final, authoritative report on Fisherman's Wharf dining trends.
    
    CRITICAL REQUIREMENTS:
    1. GROUNDED REPORTING: Every claim MUST be supported by findings from the researcher. 
    2. CITATIONS: Use in-text citations (e.g., [1], [2]) and provide a numbered References list at the end.
    3. STRUCTURE: Include clear sections for Demographics, Culinary Trends, Sustainability, Economics, and Future Outlook.
    4. PDF GENERATION: As your final action, you MUST call the 'generate_pdf_report' tool with the full synthesized content and a separate array of citation strings.
    
    Ensure the final output in the response also includes the full report text for visibility.
  `,
  tools: [pdfTool],
  model: new Gemini({ model: 'gemini-1.5-pro' }), // Use Pro for better synthesis and citation accuracy
});

