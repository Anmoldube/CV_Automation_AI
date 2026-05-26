import { Router } from 'express';
import { optimizeResume as openrouterOptimize } from '../services/openrouter.js';
import { optimizeResume as groqOptimize } from '../services/groq.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import { generateDOCX } from '../utils/docxGenerator.js';
import { generateLaTeX } from '../utils/latexGenerator.js';

export const generateRouter = Router();

const isGroqModel = (model) => model?.startsWith('groq-');

generateRouter.post('/generate', async (req, res) => {
  try {
    const { jobDescription, currentResume, model = 'qwen-3-coder', template = 1 } = req.body;

    if (!jobDescription || !currentResume) {
      return res.status(400).json({ error: 'jobDescription and currentResume are required' });
    }

    const optimize = isGroqModel(model) ? groqOptimize : openrouterOptimize;
    const data = await optimize(jobDescription, currentResume, model);

    res.json({
      success: true,
      data,
      template,
    });
  } catch (err) {
    const status = err.statusCode || err.response?.status || 500;

    console.error('Generation error:', status, err.message);

    res.status(status).json({
      success: false,
      error: err.message || 'Generation failed',
    });
  }
});

generateRouter.post('/download/pdf', async (req, res) => {
  try {
    const { data, template = 1 } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required' });

    const doc = generatePDF(data, template);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    doc.pipe(res);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

generateRouter.post('/download/docx', async (req, res) => {
  try {
    const { data, template = 1 } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required' });

    const buffer = await generateDOCX(data, template);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
    res.send(buffer);
  } catch (err) {
    console.error('DOCX error:', err);
    res.status(500).json({ error: 'DOCX generation failed' });
  }
});

generateRouter.post('/download/latex', async (req, res) => {
  try {
    const { data, template = 1 } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required' });

    const latex = generateLaTeX(data, template);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.tex');
    res.send(latex);
  } catch (err) {
    console.error('LaTeX error:', err);
    res.status(500).json({ error: 'LaTeX generation failed' });
  }
});
