import { forwardRef } from 'react';

const MODELS = [
  { id: 'groq-llama3-70b', name: 'Llama 3.3 70B', provider: 'Groq' },
  { id: 'groq-llama3.1-70b', name: 'Llama 3.1 70B', provider: 'Groq' },
  { id: 'groq-mixtral', name: 'Mixtral 8x7B', provider: 'Groq' },
  { id: 'groq-gemma2', name: 'Gemma 2 9B', provider: 'Groq' },
  { id: 'groq-deepseek', name: 'DeepSeek R1 70B', provider: 'Groq' },
];

const STEPS = [
  { key: 'analyzing', label: 'Analyzing job description...' },
  { key: 'extracting', label: 'Extracting keywords and requirements...' },
  { key: 'rewriting', label: 'Rewriting resume content with AI...' },
  { key: 'formatting', label: 'Formatting into template...' },
  { key: 'compiling', label: 'Compiling PDF...' },
  { key: 'generating-docx', label: 'Generating DOCX...' },
  { key: 'done', label: 'Done!' },
];

const GeneratorForm = forwardRef(function GeneratorForm(props, ref) {
  const {
    jobDescription, currentResume, selectedModel, status,
    result, error,
    onJobDescriptionChange, onCurrentResumeChange, onModelChange,
    onGenerate, onDownloadPDF, onDownloadDOCX, onDownloadLaTeX, onCopyLaTeX, onReset,
  } = props;

  const isGenerating = !['idle', 'done', 'error'].includes(status);
  const currentStepIndex = STEPS.findIndex(s => s.key === status);

  return (
    <section className="py-20 px-4" id="generator" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Generate Your Resume</h2>
        <p className="text-dark-400 text-center mb-10 max-w-xl mx-auto">
          Paste your materials below and let AI do the optimization.
        </p>

        {status === 'idle' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Job Description
                </label>
                <textarea
                  className="input-area"
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={e => onJobDescriptionChange(e.target.value)}
                />
                <p className="text-xs text-dark-500 mt-1 text-right">{jobDescription.length} characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Your Current Resume
                </label>
                <textarea
                  className="input-area"
                  placeholder="Paste your current resume text here..."
                  value={currentResume}
                  onChange={e => onCurrentResumeChange(e.target.value)}
                />
                <p className="text-xs text-dark-500 mt-1 text-right">{currentResume.length} characters</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <label className="text-sm font-medium text-dark-300 whitespace-nowrap">
                AI Model:
              </label>
              <select
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50"
                value={selectedModel}
                onChange={e => onModelChange(e.target.value)}
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onGenerate}
              disabled={!jobDescription.trim() || !currentResume.trim()}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate ATS Resume
            </button>
          </>
        )}

        {isGenerating && (
          <div className="card p-8 max-w-lg mx-auto">
            <div className="space-y-4">
              {STEPS.filter(s => s.key !== 'done').map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    i < currentStepIndex
                      ? 'bg-emerald-500'
                      : i === currentStepIndex
                      ? 'bg-primary-500 animate-pulse'
                      : 'bg-dark-700'
                  }`}>
                    {i < currentStepIndex ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i === currentStepIndex ? (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    i < currentStepIndex ? 'text-emerald-400' : i === currentStepIndex ? 'text-dark-50' : 'text-dark-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {status === 'done' && result && (
          <div className="card p-8 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Your ATS-optimized resume is ready!</h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-semibold mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {result.data.matchScore || 87}% keyword match
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={onDownloadPDF} className="btn-primary flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button onClick={onDownloadDOCX} className="btn-secondary flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download DOCX
              </button>
              <button onClick={onDownloadLaTeX} className="btn-secondary flex items-center justify-center gap-2">
                Download LaTeX
              </button>
              <button onClick={onCopyLaTeX} className="btn-secondary flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy LaTeX
              </button>
            </div>
            <button onClick={onReset} className="text-sm text-dark-400 hover:text-dark-200 mt-6 transition-colors">
              Start Over
            </button>
          </div>
        )}

        {status === 'error' && error && (
          <div className="card p-8 max-w-lg mx-auto text-center border-red-500/30">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Generation Failed</h3>
            <p className="text-dark-400 mb-6">{error}</p>
            <button onClick={onGenerate} className="btn-primary">
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

export default GeneratorForm;
