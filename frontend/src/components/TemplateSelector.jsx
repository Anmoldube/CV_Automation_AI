const TEMPLATES = [
  {
    id: 1, name: 'Classic Professional', bestFor: 'Banking, law, government',
    preview: 'bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700/50',
    accent: 'bg-blue-600', textAccent: 'text-blue-400',
    desc: 'Traditional corporate resume with serif fonts and navy accents.',
  },
  {
    id: 2, name: 'Modern Minimal', bestFor: 'Tech startups, product roles',
    preview: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/50',
    accent: 'bg-slate-500', textAccent: 'text-slate-300',
    desc: 'Clean, minimalist design with generous whitespace.',
  },
  {
    id: 3, name: 'Technical Engineering', bestFor: 'Software engineers, DevOps',
    preview: 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700/50',
    accent: 'bg-emerald-600', textAccent: 'text-emerald-400',
    desc: 'Skills-focused layout with monospace accents.',
  },
  {
    id: 4, name: 'Creative Design', bestFor: 'Design, marketing, media',
    preview: 'bg-gradient-to-br from-purple-900 to-purple-950 border-purple-700/50',
    accent: 'bg-purple-600', textAccent: 'text-purple-400',
    desc: 'Bold, asymmetric layout with colorful sections.',
  },
  {
    id: 5, name: 'Academic Research', bestFor: 'PhD candidates, researchers',
    preview: 'bg-gradient-to-br from-red-900 to-red-950 border-red-700/50',
    accent: 'bg-red-800', textAccent: 'text-red-400',
    desc: 'Formal design prioritizing publications and education.',
  },
];

export default function TemplateSelector({ selected, onSelect }) {
  return (
    <section className="py-20 px-4" id="templates">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Choose Your Template</h2>
        <p className="text-dark-400 text-center mb-12 max-w-xl mx-auto">
          Pick the style that best fits your industry and personal brand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`card-hover text-left p-4 relative ${
                selected === t.id
                  ? 'ring-2 ring-primary-500 border-primary-500/50 shadow-lg shadow-primary-500/10'
                  : ''
              }`}
            >
              {selected === t.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className={`h-32 rounded-lg mb-3 ${t.preview} border ${selected === t.id ? 'border-primary-500/50' : ''} flex items-center justify-center`}>
                <div className="space-y-2 w-3/4">
                  <div className={`h-2 rounded ${t.accent} opacity-60 w-1/2`} />
                  <div className="space-y-1">
                    <div className={`h-1.5 rounded ${t.accent} opacity-40`} />
                    <div className={`h-1.5 rounded ${t.accent} opacity-40 w-3/4`} />
                    <div className={`h-1.5 rounded ${t.accent} opacity-40 w-1/2`} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className={`h-1 rounded bg-dark-600 opacity-50`} />
                    <div className={`h-1 rounded bg-dark-600 opacity-50 w-5/6`} />
                    <div className={`h-1 rounded bg-dark-600 opacity-50 w-2/3`} />
                  </div>
                </div>
              </div>

              <h3 className={`font-semibold mb-1 ${selected === t.id ? 'text-primary-400' : 'text-dark-50'}`}>
                {t.name}
              </h3>
              <p className="text-xs text-dark-400 leading-relaxed">
                {t.desc}
              </p>
              <p className="text-[10px] text-dark-500 mt-2">
                Best for: {t.bestFor}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
