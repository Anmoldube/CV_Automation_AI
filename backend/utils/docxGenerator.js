import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx';

const TEMPLATE_COLORS = {
  1: { primary: '1e40af', accent: '1e3a5f' },
  2: { primary: '333333', accent: '2d2d2d' },
  3: { primary: '059669', accent: '0f766e' },
  4: { primary: '7c3aed', accent: '6d28d9' },
  5: { primary: '991b1b', accent: '7f1d1d' },
};

// Returns an array of paragraphs — each has a shaded background so they
// form a solid colour block. Avoids the WidthType.PERCENTAGE/pct unit bug
// that caused the table-based header to render at ~2% page width.
function createHeader(cfg, data) {
  const h = data.sections.header;
  const shading = { type: ShadingType.SOLID, color: cfg.accent, fill: cfg.accent };
  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: h.name || 'Your Name', bold: true, size: 40, color: 'FFFFFF' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      shading,
    })
  );

  const contactParts = [h.email, h.phone, h.location].filter(Boolean);
  if (contactParts.length) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join('  |  '), size: 20, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        shading,
      })
    );
  }

  const linkParts = [h.linkedin, h.website, h.github].filter(Boolean);
  if (linkParts.length) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: linkParts.join('  |  '), size: 18, color: 'DDDDDD' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        shading,
      })
    );
  } else if (contactParts.length) {
    // extend the shading block with a small bottom padding paragraph
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: '', size: 16 })],
        spacing: { after: 160 },
        shading,
      })
    );
  }

  return paragraphs;
}

function sectionTitle(cfg, text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: cfg.primary })],
    spacing: { before: 320, after: 100 },
    border: { bottom: { color: cfg.primary, size: 6, style: BorderStyle.SINGLE, space: 4 } },
  });
}

function bullet(text, spacingAfter = 60) {
  return new Paragraph({
    children: [
      new TextRun({ text: '•  ', size: 20 }),
      new TextRun({ text, size: 20 }),
    ],
    spacing: { after: spacingAfter },
    indent: { left: 400 },
  });
}

function bodyText(text, color = '333333', spacingAfter = 120) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color })],
    spacing: { after: spacingAfter },
  });
}

export async function generateDOCX(data, templateId) {
  const cfg = TEMPLATE_COLORS[templateId] || TEMPLATE_COLORS[2];
  const children = [];

  children.push(...createHeader(cfg, data));

  if (data.sections.professionalSummary) {
    children.push(sectionTitle(cfg, 'Professional Summary'));
    children.push(bodyText(data.sections.professionalSummary));
  }

  if (data.sections.skills?.length) {
    children.push(sectionTitle(cfg, 'Skills'));
    children.push(bodyText(data.sections.skills.join('  •  ')));
  }

  if (data.sections.experience?.length) {
    children.push(sectionTitle(cfg, 'Experience'));
    for (let i = 0; i < data.sections.experience.length; i++) {
      const exp = data.sections.experience[i];
      const isLast = i === data.sections.experience.length - 1;

      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.position || '', bold: true, size: 22 })],
          spacing: { after: 40 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: [exp.company, exp.location].filter(Boolean).join(' – '), size: 20, color: '555555' }),
            new TextRun({ text: exp.dates ? `    ${exp.dates}` : '', size: 20, color: '777777', italics: true }),
          ],
          spacing: { after: 80 },
        })
      );
      if (exp.bullets?.length) {
        exp.bullets.forEach((b, bi) => {
          const last = bi === exp.bullets.length - 1;
          children.push(bullet(b, last && !isLast ? 200 : 60));
        });
      } else if (!isLast) {
        children.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 160 } }));
      }
    }
  }

  if (data.sections.education?.length) {
    children.push(sectionTitle(cfg, 'Education'));
    for (let i = 0; i < data.sections.education.length; i++) {
      const edu = data.sections.education[i];
      const isLast = i === data.sections.education.length - 1;

      children.push(
        new Paragraph({
          children: [new TextRun({ text: [edu.degree, edu.field].filter(Boolean).join(' in '), bold: true, size: 22 })],
          spacing: { after: 40 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution || '', size: 20, color: '555555' }),
            new TextRun({ text: edu.dates ? `    ${edu.dates}` : '', size: 20, color: '777777', italics: true }),
          ],
          spacing: { after: edu.gpa ? 60 : (isLast ? 60 : 200) },
        })
      );
      if (edu.gpa) {
        children.push(bodyText(`GPA: ${edu.gpa}`, '333333', isLast ? 60 : 200));
      }
    }
  }

  if (data.sections.projects?.length) {
    children.push(sectionTitle(cfg, 'Projects'));
    for (let i = 0; i < data.sections.projects.length; i++) {
      const proj = data.sections.projects[i];
      const isLast = i === data.sections.projects.length - 1;

      children.push(
        new Paragraph({
          children: [new TextRun({ text: proj.name || '', bold: true, size: 22 })],
          spacing: { after: 40 },
        })
      );
      if (proj.technologies) {
        children.push(bodyText(proj.technologies, '666666', 60));
      }
      if (proj.bullets?.length) {
        proj.bullets.forEach((b, bi) => {
          const last = bi === proj.bullets.length - 1;
          children.push(bullet(b, last && !isLast ? 200 : 60));
        });
      } else if (!isLast) {
        children.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 160 } }));
      }
    }
  }

  if (data.sections.certifications?.length) {
    children.push(sectionTitle(cfg, 'Certifications'));
    data.sections.certifications.forEach((cert, i) => {
      children.push(bullet(cert, i === data.sections.certifications.length - 1 ? 60 : 60));
    });
  }

  if (data.sections.publications?.length) {
    children.push(sectionTitle(cfg, 'Publications'));
    for (const pub of data.sections.publications) {
      children.push(bullet(pub.title || '', 40));
      if (pub.journal || pub.year) {
        children.push(bodyText([pub.journal, pub.year].filter(Boolean).join(', '), '666666', 80));
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
    styles: { default: { document: { run: { font: 'Calibri' } } } },
  });

  return Packer.toBuffer(doc);
}
