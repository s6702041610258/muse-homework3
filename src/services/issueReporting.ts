export type IssueCategory = 'playback' | 'search' | 'video' | 'visual' | 'other';

export interface IssueDiagnostics {
  platform: string;
  appVersion: string;
  expoSdk: string;
  screen: 'studio';
  themeColor: string;
}

export interface IssueReport {
  reference: string;
  createdAt: string;
  category: IssueCategory;
  description: string;
  reproductionSteps: string;
  contactEmail: string | null;
  diagnostics: IssueDiagnostics | null;
}

export interface IssueValidationErrors {
  description?: string;
  contactEmail?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateIssueReport(description: string, contactEmail: string): IssueValidationErrors {
  const errors: IssueValidationErrors = {};
  const cleanDescription = description.trim();
  const cleanEmail = contactEmail.trim();

  if (cleanDescription.length < 20) {
    errors.description = 'Please describe the issue in at least 20 characters.';
  } else if (cleanDescription.length > 1200) {
    errors.description = 'Please keep the description under 1,200 characters.';
  }
  if (cleanEmail && !EMAIL_PATTERN.test(cleanEmail)) {
    errors.contactEmail = 'Enter a valid email address or leave it blank.';
  }

  return errors;
}

export function createIssueReference(now = Date.now()) {
  return `MUSE-${now.toString(36).toUpperCase()}`;
}

export function formatIssueReport(report: IssueReport) {
  const diagnostics = report.diagnostics
    ? [
        `Platform: ${report.diagnostics.platform}`,
        `App: ${report.diagnostics.appVersion}`,
        `Expo SDK: ${report.diagnostics.expoSdk}`,
        `Screen: ${report.diagnostics.screen}`,
        `Theme: ${report.diagnostics.themeColor}`,
      ].join('\n')
    : 'Not included';

  return [
    `MUSE issue report · ${report.reference}`,
    '',
    `Category: ${report.category}`,
    `Created: ${report.createdAt}`,
    `Contact: ${report.contactEmail || 'Not provided'}`,
    '',
    'Description',
    report.description,
    '',
    'Steps to reproduce',
    report.reproductionSteps || 'Not provided',
    '',
    'Diagnostics',
    diagnostics,
  ].join('\n');
}

export async function submitIssueReport(report: IssueReport, endpoint: string, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const abortFromExternal = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(report),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Support endpoint returned ${response.status}.`);

    const data = await response.json().catch(() => null) as { id?: string; reference?: string; ticket?: string } | null;
    return data?.reference || data?.ticket || data?.id || report.reference;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The report timed out. Check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  }
}
