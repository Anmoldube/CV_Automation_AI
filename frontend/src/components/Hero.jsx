export default function Hero({ onStart }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-mesh">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl animate-mesh" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl animate-mesh-delayed" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
          AI-Powered ATS Optimization
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Beat the <span className="gradient-text">ATS</span>.
          <br />
          Land the Interview.
        </h1>

        <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your resume and job description. Get a perfectly tailored,
          keyword-optimized PDF in seconds.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button onClick={onStart} className="btn-primary text-lg px-8 py-4">
            Start Now &rarr;
          </button>
          <a
            href="#how-it-works"
            className="btn-secondary text-lg px-8 py-4"
          >
            How It Works
          </a>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">95%</div>
            <div className="text-sm text-dark-400 mt-1">ATS Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">5x</div>
            <div className="text-sm text-dark-400 mt-1">More Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">30s</div>
            <div className="text-sm text-dark-400 mt-1">To Generate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
