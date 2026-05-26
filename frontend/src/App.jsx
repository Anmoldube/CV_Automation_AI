import { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TemplateSelector from './components/TemplateSelector';
import GeneratorForm from './components/GeneratorForm';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

const API_BASE = '/api';

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [currentResume, setCurrentResume] = useState('');
  const [selectedModel, setSelectedModel] = useState('groq-llama3-70b');

  const formRef = useRef(null);

  const generateResume = async () => {
    setStatus('analyzing');
    setError(null);
    setResult(null);

    const steps = [
      'analyzing',
      'extracting',
      'rewriting',
      'formatting',
      'compiling',
      'generating-docx',
      'done',
    ];

    for (let i = 0; i < steps.length; i++) {
      setStatus(steps[i]);
      if (steps[i] === 'done') break;
      await new Promise(r => setTimeout(r, steps[i] === 'analyzing' ? 800 : 400));
    }

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          currentResume,
          model: selectedModel,
          template: selectedTemplate,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Generation failed');
      }

      setResult(json);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const downloadPDF = async () => {
    const res = await fetch(`${API_BASE}/download/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result.data, template: selectedTemplate }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDOCX = async () => {
    const res = await fetch(`${API_BASE}/download/docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result.data, template: selectedTemplate }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadLaTeX = async () => {
    const res = await fetch(`${API_BASE}/download/latex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result.data, template: selectedTemplate }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLaTeX = async () => {
    const res = await fetch(`${API_BASE}/download/latex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result.data, template: selectedTemplate }),
    });
    const text = await res.text();
    await navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setJobDescription('');
    setCurrentResume('');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar onStart={scrollToForm} />
      <Hero onStart={scrollToForm} />
      <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />
      <GeneratorForm
        ref={formRef}
        jobDescription={jobDescription}
        currentResume={currentResume}
        selectedModel={selectedModel}
        selectedTemplate={selectedTemplate}
        status={status}
        result={result}
        error={error}
        onJobDescriptionChange={setJobDescription}
        onCurrentResumeChange={setCurrentResume}
        onModelChange={setSelectedModel}
        onGenerate={generateResume}
        onDownloadPDF={downloadPDF}
        onDownloadDOCX={downloadDOCX}
        onDownloadLaTeX={downloadLaTeX}
        onCopyLaTeX={copyLaTeX}
        onReset={reset}
      />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
