import PDFDocument from 'pdfkit';

const TEMPLATE_CONFIGS = {
  1: { primaryColor: '#1e40af', font: 'Times-Roman', boldFont: 'Times-Bold', headerBg: '#1e3a5f' },
  2: { primaryColor: '#333333', font: 'Helvetica', boldFont: 'Helvetica-Bold', headerBg: '#2d2d2d' },
  3: { primaryColor: '#059669', font: 'Courier', boldFont: 'Courier-Bold', headerBg: '#0f766e' },
  4: { primaryColor: '#7c3aed', font: 'Helvetica', boldFont: 'Helvetica-Bold', headerBg: '#6d28d9' },
  5: { primaryColor: '#991b1b', font: 'Times-Roman', boldFont: 'Times-Bold', headerBg: '#7f1d1d' },
};

const MARGIN = 50;

function contentWidth(doc) {
  return doc.page.width - MARGIN * 2;
}

function checkPageBreak(doc, y, needed = 60) {
  if (y + needed > doc.page.height - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawHeader(doc, config, data) {
  const h = data.sections.header;
  doc.rect(0, 0, doc.page.width, 120).fill(config.headerBg);
  doc.fontSize(24).font(config.boldFont).fillColor('#ffffff');
  doc.text(h.name || 'Your Name', MARGIN, 25, { align: 'center', width: contentWidth(doc) });

  doc.fontSize(10).font(config.font);
  const contact = [h.email, h.phone, h.location].filter(Boolean).join(' | ');
  const links = [h.linkedin, h.website, h.github].filter(Boolean).join(' | ');
  if (contact) doc.text(contact, MARGIN, 60, { align: 'center', width: contentWidth(doc) });
  if (links) doc.text(links, MARGIN, 78, { align: 'center', width: contentWidth(doc) });
}

function drawSection(doc, config, title, y) {
  y = checkPageBreak(doc, y, 40);
  doc.fontSize(14).font(config.boldFont).fillColor(config.primaryColor);
  doc.text(title, MARGIN, y);
  doc.moveTo(MARGIN, y + 18).lineTo(doc.page.width - MARGIN, y + 18).strokeColor(config.primaryColor).stroke();
  return y + 28;
}

function drawBullets(doc, config, bullets, y) {
  doc.fontSize(10).font(config.font).fillColor('#333333');
  const cw = contentWidth(doc);
  for (const b of bullets) {
    const text = `•  ${b}`;
    const h = doc.heightOfString(text, { width: cw });
    y = checkPageBreak(doc, y, h + 4);
    doc.text(text, MARGIN, y, { width: cw, align: 'justify' });
    y += h + 4;
  }
  return y + 6;
}

export function generatePDF(data, templateId) {
  const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS[2];
  const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });

  drawHeader(doc, config, data);
  let y = 140;
  const cw = contentWidth(doc);

  if (data.sections.professionalSummary) {
    y = drawSection(doc, config, 'Professional Summary', y);
    doc.fontSize(10).font(config.font).fillColor('#333333');
    const h = doc.heightOfString(data.sections.professionalSummary, { width: cw });
    doc.text(data.sections.professionalSummary, MARGIN, y, { width: cw, align: 'justify' });
    y += h + 16;
  }

  if (data.sections.skills?.length) {
    y = drawSection(doc, config, 'Skills', y);
    doc.fontSize(10).font(config.font).fillColor('#333333');
    const skillsText = data.sections.skills.join('  •  ');
    const h = doc.heightOfString(skillsText, { width: cw });
    doc.text(skillsText, MARGIN, y, { width: cw });
    y += h + 16;
  }

  if (data.sections.experience?.length) {
    y = drawSection(doc, config, 'Experience', y);
    for (const exp of data.sections.experience) {
      y = checkPageBreak(doc, y, 40);
      doc.fontSize(11).font(config.boldFont).fillColor('#000000');
      const posText = exp.position || '';
      const posH = doc.heightOfString(posText, { width: cw * 0.65 });
      doc.text(posText, MARGIN, y, { width: cw * 0.65 });

      doc.fontSize(10).font(config.font).fillColor('#666666');
      const rightText = [exp.company, exp.dates].filter(Boolean).join(' | ');
      if (rightText) doc.text(rightText, doc.page.width - MARGIN - doc.widthOfString(rightText), y);
      y += posH + 4;

      if (exp.location) {
        doc.fontSize(9).font(config.font).fillColor('#888888');
        doc.text(exp.location, MARGIN, y);
        y += 14;
      }
      if (exp.bullets?.length) {
        y = drawBullets(doc, config, exp.bullets, y);
      }
      y += 8;
    }
  }

  if (data.sections.education?.length) {
    y = drawSection(doc, config, 'Education', y);
    for (const edu of data.sections.education) {
      y = checkPageBreak(doc, y, 36);
      doc.fontSize(11).font(config.boldFont).fillColor('#000000');
      const degreeText = [edu.degree, edu.field].filter(Boolean).join(' in ');
      const degH = doc.heightOfString(degreeText, { width: cw * 0.65 });
      doc.text(degreeText, MARGIN, y, { width: cw * 0.65 });

      doc.fontSize(10).font(config.font).fillColor('#666666');
      const eduRight = [edu.institution, edu.dates].filter(Boolean).join(' | ');
      if (eduRight) doc.text(eduRight, doc.page.width - MARGIN - doc.widthOfString(eduRight), y);
      y += degH + 4;

      if (edu.gpa) {
        doc.fontSize(10).font(config.font).fillColor('#333333');
        doc.text(`GPA: ${edu.gpa}`, MARGIN, y);
        y += 16;
      }
      y += 8;
    }
  }

  if (data.sections.projects?.length) {
    y = drawSection(doc, config, 'Projects', y);
    for (const proj of data.sections.projects) {
      y = checkPageBreak(doc, y, 40);
      doc.fontSize(11).font(config.boldFont).fillColor('#000000');
      doc.text(proj.name || '', MARGIN, y);
      y += 18;
      if (proj.technologies) {
        doc.fontSize(9).font(config.font).fillColor('#666666');
        doc.text(proj.technologies, MARGIN, y);
        y += 14;
      }
      if (proj.bullets?.length) {
        y = drawBullets(doc, config, proj.bullets, y);
      }
      y += 4;
    }
  }

  if (data.sections.certifications?.length) {
    y = drawSection(doc, config, 'Certifications', y);
    doc.fontSize(10).font(config.font).fillColor('#333333');
    for (const cert of data.sections.certifications) {
      const text = `•  ${cert}`;
      const h = doc.heightOfString(text, { width: cw });
      y = checkPageBreak(doc, y, h);
      doc.text(text, MARGIN, y, { width: cw });
      y += h + 4;
    }
    y += 4;
  }

  if (data.sections.publications?.length) {
    y = drawSection(doc, config, 'Publications', y);
    doc.fontSize(10).font(config.font).fillColor('#333333');
    for (const pub of data.sections.publications) {
      y = checkPageBreak(doc, y, 32);
      const titleText = `•  ${pub.title || ''}`;
      const titleH = doc.heightOfString(titleText, { width: cw });
      doc.text(titleText, MARGIN, y, { width: cw });
      y += titleH + 2;
      if (pub.journal || pub.year) {
        doc.fontSize(9).fillColor('#666666');
        const meta = [pub.journal, pub.year].filter(Boolean).join(', ');
        doc.text(meta, MARGIN + 15, y, { width: cw - 15 });
        y += 16;
      }
    }
  }

  doc.end();
  return doc;
}
