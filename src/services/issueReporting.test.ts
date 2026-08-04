import { describe, expect, it, vi } from 'vitest';
import { createIssueReference, formatIssueReport, IssueReport, submitIssueReport, validateIssueReport } from './issueReporting';

const report: IssueReport = {
  reference: 'MUSE-TEST',
  createdAt: '2026-08-02T00:00:00.000Z',
  category: 'playback',
  description: 'The preview pauses after five seconds.',
  reproductionSteps: 'Open a track and press play.',
  contactEmail: null,
  diagnostics: null,
};

describe('issue reporting', () => {
  it('validates the required description and optional email', () => {
    expect(validateIssueReport('Too short', '')).toHaveProperty('description');
    expect(validateIssueReport(report.description, 'not-an-email')).toHaveProperty('contactEmail');
    expect(validateIssueReport(report.description, 'listener@example.com')).toEqual({});
  });

  it('creates stable references and readable reports', () => {
    expect(createIssueReference(1_000)).toBe('MUSE-RS');
    expect(formatIssueReport(report)).toContain('The preview pauses after five seconds.');
  });

  it('posts JSON to a configured support endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ticket: 'SUPPORT-42' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitIssueReport(report, 'https://support.example.com/issues')).resolves.toBe('SUPPORT-42');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://support.example.com/issues',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(report) }),
    );
    vi.unstubAllGlobals();
  });
});
