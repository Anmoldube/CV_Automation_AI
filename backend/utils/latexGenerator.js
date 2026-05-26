function escapeLatex(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

const TEMPLATE_PREAMBLES = {
  1: `\\documentclass[11pt]{article}
\\usepackage[hmargin=1in,vmargin=0.8in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{textcomp}
\\usepackage{hyperref}
\\definecolor{primary}{HTML}{1e40af}
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\rule{\\textwidth}{0.4pt}]`,

  2: `\\documentclass[10pt]{article}
\\usepackage[hmargin=0.9in,vmargin=0.7in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{textcomp}
\\usepackage{hyperref}
\\definecolor{primary}{HTML}{333333}
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\rule{\\textwidth}{0.3pt}]`,

  3: `\\documentclass[11pt]{article}
\\usepackage[hmargin=0.8in,vmargin=0.8in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{textcomp}
\\usepackage{hyperref}
\\definecolor{primary}{HTML}{059669}
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\rule{\\textwidth}{0.4pt}]`,

  4: `\\documentclass[11pt]{article}
\\usepackage[hmargin=0.8in,vmargin=0.8in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{textcomp}
\\usepackage{hyperref}
\\definecolor{primary}{HTML}{7c3aed}
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\rule{\\textwidth}{0.4pt}]`,

  5: `\\documentclass[12pt]{article}
\\usepackage[hmargin=1in,vmargin=0.8in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{textcomp}
\\usepackage{hyperref}
\\definecolor{primary}{HTML}{991b1b}
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\color{primary}\\rule{\\textwidth}{0.4pt}]`,
};

function buildHeader(data) {
  const h = data.sections.header;
  const lines = [];
  lines.push(`\\begin{center}`);
  lines.push(`  {\\Huge \\bfseries ${escapeLatex(h.name)}} \\\\[4pt]`);
  const contact = [h.email, h.phone, h.location].filter(Boolean).join(' $|$ ');
  if (contact) lines.push(`  {\\large ${contact}} \\\\[2pt]`);
  const links = [h.linkedin, h.website, h.github].filter(Boolean).join(' $|$ ');
  if (links) lines.push(`  {\\small ${escapeLatex(links)}}`);
  lines.push(`\\end{center}`);
  return lines.join('\n');
}

function buildExperience(data) {
  if (!data.sections.experience?.length) return '';
  const lines = ['\\section*{Experience}'];
  for (const exp of data.sections.experience) {
    lines.push(`\\textbf{${escapeLatex(exp.position)}} \\hfill \\textit{${escapeLatex(exp.dates)}}`);
    const right = [exp.company, exp.location].filter(Boolean).join(' - ');
    if (right) lines.push(`{\\small ${escapeLatex(right)}}`);
    if (exp.bullets?.length) {
      lines.push('\\begin{itemize}[leftmargin=*,nosep]');
      for (const b of exp.bullets) {
        lines.push(`  \\item ${escapeLatex(b)}`);
      }
      lines.push('\\end{itemize}');
    }
  }
  return lines.join('\n');
}

function buildSection(title, items) {
  if (!items?.length) return '';
  const lines = [`\\section*{${title}}`];
  if (typeof items[0] === 'string') {
    lines.push('\\begin{itemize}[leftmargin=*,nosep]');
    for (const item of items) lines.push(`  \\item ${escapeLatex(item)}`);
    lines.push('\\end{itemize}');
  } else if (items[0]?.institution || items[0]?.degree) {
    for (const edu of items) {
      lines.push(`\\textbf{${[edu.degree, edu.field].filter(Boolean).join(' in ')}} \\hfill \\textit{${escapeLatex(edu.dates)}}`);
      const right = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' - ');
      if (right) lines.push(`{\\small ${escapeLatex(right)}}`);
    }
  } else if (items[0]?.title) {
    lines.push('\\begin{itemize}[leftmargin=*,nosep]');
    for (const pub of items) {
      lines.push(`  \\item ${escapeLatex(pub.title)}`);
      if (pub.journal || pub.year) {
        lines.push(`    {\\small ${[pub.journal, pub.year].filter(Boolean).join(', ')}}`);
      }
    }
    lines.push('\\end{itemize}');
  }
  return lines.join('\n');
}

export function generateLaTeX(data, templateId) {
  const bodyParts = [buildHeader(data)];

  if (data.sections.professionalSummary) {
    bodyParts.push(`\\section*{Professional Summary}\n${escapeLatex(data.sections.professionalSummary)}`);
  }

  if (data.sections.skills?.length) {
    bodyParts.push(`\\section*{Skills}\n${data.sections.skills.map(s => escapeLatex(s)).join('  \\textbullet{}  ')}`);
  }

  bodyParts.push(buildExperience(data));
  bodyParts.push(buildSection('Education', data.sections.education));

  if (data.sections.projects?.length) {
    const projParts = ['\\section*{Projects}'];
    for (const proj of data.sections.projects) {
      projParts.push(`\\textbf{${escapeLatex(proj.name)}}`);
      if (proj.technologies) projParts.push(`{\\small ${escapeLatex(proj.technologies)}}`);
      if (proj.bullets?.length) {
        projParts.push('\\begin{itemize}[leftmargin=*,nosep]');
        for (const b of proj.bullets) projParts.push(`  \\item ${escapeLatex(b)}`);
        projParts.push('\\end{itemize}');
      }
    }
    bodyParts.push(projParts.join('\n'));
  }

  bodyParts.push(buildSection('Certifications', data.sections.certifications));

  if (data.sections.publications?.length) {
    const pubParts = ['\\section*{Publications}'];
    pubParts.push('\\begin{itemize}[leftmargin=*,nosep]');
    for (const pub of data.sections.publications) {
      pubParts.push(`  \\item ${escapeLatex(pub.title)}`);
      if (pub.journal || pub.year) {
        pubParts.push(`    {\\small ${[pub.journal, pub.year].filter(Boolean).join(', ')}}`);
      }
    }
    pubParts.push('\\end{itemize}');
    bodyParts.push(pubParts.join('\n'));
  }

  const preamble = TEMPLATE_PREAMBLES[templateId] || TEMPLATE_PREAMBLES[2];

  return `${preamble}
\\begin{document}
\\pagestyle{empty}
${bodyParts.join('\n\n')}
\\end{document}`;
}
