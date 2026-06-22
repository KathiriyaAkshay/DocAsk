/** "employee-handbook" → "Employee Handbook" */
export function formatDocumentName(name: string): string {
  const base = name.replace(/\.pdf$/i, '').replace(/-/g, ' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSection(section: string): string {
  return section.replace(/^\d+\.\s*/, '').trim() || section;
}

export function citationLabel(documentName: string, section: string): string {
  return `${formatDocumentName(documentName)} · ${formatSection(section)}`;
}
