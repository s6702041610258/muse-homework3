import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { AlertCircle, Bug, CheckCircle2, Cpu, Send, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMusicStore } from '../store/useMusicStore';
import { getTheme, palette, radii } from '../theme';
import {
  createIssueReference,
  formatIssueReport,
  IssueCategory,
  IssueReport,
  IssueValidationErrors,
  submitIssueReport,
  validateIssueReport,
} from '../services/issueReporting';

const DRAFT_KEY = 'muse-issue-report-draft-v1';
const categories: { value: IssueCategory; label: string }[] = [
  { value: 'playback', label: 'Playback' },
  { value: 'search', label: 'Search' },
  { value: 'video', label: 'Video' },
  { value: 'visual', label: 'Visual' },
  { value: 'other', label: 'Other' },
];

type SubmissionState =
  | { kind: 'idle'; message: '' }
  | { kind: 'submitting'; message: string }
  | { kind: 'success' | 'handoff' | 'error'; message: string };

interface ReportIssueSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface IssueDraft {
  category: IssueCategory;
  description: string;
  reproductionSteps: string;
  contactEmail: string;
  includeDiagnostics: boolean;
}

const emptySubmission: SubmissionState = { kind: 'idle', message: '' };

export function ReportIssueSheet({ visible, onClose }: ReportIssueSheetProps) {
  const insets = useSafeAreaInsets();
  const activeThemeColor = useMusicStore((state) => state.activeThemeColor);
  const isDarkMode = useMusicStore((state) => state.isDarkMode);
  const theme = getTheme(isDarkMode);
  const [category, setCategory] = useState<IssueCategory>('playback');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [errors, setErrors] = useState<IssueValidationErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>(emptySubmission);
  const draftLoaded = useRef(false);
  const submissionController = useRef<AbortController | null>(null);
  const endpoint = process.env.EXPO_PUBLIC_SUPPORT_ENDPOINT?.trim() ?? '';
  const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? '';

  useEffect(() => {
    if (!visible || draftLoaded.current) return;
    void AsyncStorage.getItem(DRAFT_KEY).then((savedDraft) => {
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft) as Partial<IssueDraft>;
          if (categories.some((item) => item.value === draft.category)) setCategory(draft.category as IssueCategory);
          if (typeof draft.description === 'string') setDescription(draft.description);
          if (typeof draft.reproductionSteps === 'string') setReproductionSteps(draft.reproductionSteps);
          if (typeof draft.contactEmail === 'string') setContactEmail(draft.contactEmail);
          if (typeof draft.includeDiagnostics === 'boolean') setIncludeDiagnostics(draft.includeDiagnostics);
        } catch {
          void AsyncStorage.removeItem(DRAFT_KEY);
        }
      }
      draftLoaded.current = true;
    });
  }, [visible]);

  useEffect(() => {
    if (!visible || !draftLoaded.current) return;
    const draft: IssueDraft = { category, description, reproductionSteps, contactEmail, includeDiagnostics };
    const timeoutId = setTimeout(() => {
      void AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [category, contactEmail, description, includeDiagnostics, reproductionSteps, visible]);

  useEffect(() => () => submissionController.current?.abort(), []);

  const clearForm = () => {
    setCategory('playback');
    setDescription('');
    setReproductionSteps('');
    setContactEmail('');
    setIncludeDiagnostics(true);
    setErrors({});
    setSubmission(emptySubmission);
    void AsyncStorage.removeItem(DRAFT_KEY);
  };

  const createReport = (): IssueReport => ({
    reference: createIssueReference(),
    createdAt: new Date().toISOString(),
    category,
    description: description.trim(),
    reproductionSteps: reproductionSteps.trim().slice(0, 1000),
    contactEmail: contactEmail.trim() || null,
    diagnostics: includeDiagnostics
      ? {
          platform: Platform.OS,
          appVersion: '1.0.0',
          expoSdk: '57',
          screen: 'studio',
          themeColor: activeThemeColor,
        }
      : null,
  });

  const handOffReport = async (report: IssueReport) => {
    const title = `MUSE issue · ${report.category} · ${report.reference}`;
    const message = formatIssueReport(report);

    if (Platform.OS === 'web') {
      const webNavigator = navigator as Navigator & { share?: (data: { title: string; text: string }) => Promise<void> };
      if (webNavigator.share) {
        await webNavigator.share({ title, text: message });
      } else {
        await Linking.openURL(`mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`);
      }
    } else if (supportEmail) {
      await Linking.openURL(`mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`);
    } else {
      const result = await Share.share({ title, message });
      if (result.action === Share.dismissedAction) return false;
    }

    setSubmission({ kind: 'handoff', message: 'Report draft opened. Complete the send step in the app you selected.' });
    return true;
  };

  const submit = async () => {
    const nextErrors = validateIssueReport(description, contactEmail);
    setErrors(nextErrors);
    setSubmission(emptySubmission);
    if (Object.keys(nextErrors).length > 0) return;

    const report = createReport();
    setSubmission({ kind: 'submitting', message: endpoint ? 'Transmitting report…' : 'Preparing secure handoff…' });
    let activeController: AbortController | null = null;
    try {
      if (endpoint) {
        submissionController.current?.abort();
        const controller = new AbortController();
        activeController = controller;
        submissionController.current = controller;
        const reference = await submitIssueReport(report, endpoint, controller.signal);
        setSubmission({ kind: 'success', message: `Report received · ${reference}` });
        setDescription('');
        setReproductionSteps('');
        void AsyncStorage.removeItem(DRAFT_KEY);
      } else {
        const handedOff = await handOffReport(report);
        if (!handedOff) setSubmission(emptySubmission);
      }
    } catch (error) {
      if (activeController?.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        setSubmission(emptySubmission);
        return;
      }
      const message = error instanceof Error ? error.message : 'The report could not be prepared. Please try again.';
      setSubmission({ kind: 'error', message });
    } finally {
      if (!activeController || submissionController.current === activeController) submissionController.current = null;
    }
  };

  const close = () => {
    submissionController.current?.abort();
    setErrors({});
    setSubmission(emptySubmission);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(8,7,11,0.64)' : 'rgba(39,31,48,0.24)' }]}>
        <BlurView intensity={isDarkMode ? 82 : 68} tint={isDarkMode ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, styles.noPointerEvents]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.dock, styles.boxNonePointerEvents]}>
          <View style={[styles.sheet, { paddingBottom: Math.max(18, insets.bottom + 8), borderColor: theme.line, backgroundColor: theme.surface }]} accessibilityViewIsModal>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <View style={styles.kickerRow}><Bug size={13} color={activeThemeColor} /><Text style={[styles.kicker, { color: activeThemeColor }]}>SUPPORT SIGNAL</Text></View>
                <Text style={[styles.title, { color: theme.text }]}>Report an issue</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>Tell us what happened. Drafts stay on this device until you send them.</Text>
              </View>
              <Pressable onPress={close} style={[styles.close, { borderColor: theme.line }]} accessibilityRole="button" accessibilityLabel="Close issue report"><X size={18} color={theme.text} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
              <View>
                <Text style={[styles.label, { color: theme.muted }]}>ISSUE TYPE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
                  {categories.map((item) => {
                    const selected = item.value === category;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => setCategory(item.value)}
                        style={[styles.category, { borderColor: selected ? activeThemeColor : theme.line, backgroundColor: selected ? `${activeThemeColor}22` : theme.surfaceSoft }]}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.label} issue`}
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.categoryText, { color: selected ? activeThemeColor : theme.text }]}>{item.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View>
                <View style={styles.labelRow}><Text style={[styles.label, { color: theme.muted }]}>WHAT HAPPENED *</Text><Text style={[styles.counter, { color: description.length > 1200 ? palette.coral : theme.muted }]}>{description.length}/1200</Text></View>
                <TextInput
                  value={description}
                  onChangeText={(value) => { setDescription(value); if (errors.description) setErrors((current) => ({ ...current, description: undefined })); }}
                  placeholder="Example: The preview stops when I open the video panel…"
                  placeholderTextColor={theme.muted}
                  multiline
                  maxLength={1250}
                  textAlignVertical="top"
                  style={[styles.textArea, { color: theme.text, borderColor: errors.description ? palette.coral : theme.line, backgroundColor: theme.surfaceSoft }]}
                  accessibilityLabel="Issue description"
                />
                {errors.description && <Text style={styles.fieldError} accessibilityRole="alert">{errors.description}</Text>}
              </View>

              <View>
                <Text style={[styles.label, { color: theme.muted }]}>STEPS TO REPRODUCE</Text>
                <TextInput
                  value={reproductionSteps}
                  onChangeText={setReproductionSteps}
                  placeholder="1. Search for…  2. Tap…  3. The app…"
                  placeholderTextColor={theme.muted}
                  multiline
                  maxLength={1000}
                  textAlignVertical="top"
                  style={[styles.stepsArea, { color: theme.text, borderColor: theme.line, backgroundColor: theme.surfaceSoft }]}
                  accessibilityLabel="Steps to reproduce the issue"
                />
              </View>

              <View>
                <Text style={[styles.label, { color: theme.muted }]}>CONTACT EMAIL · OPTIONAL</Text>
                <TextInput
                  value={contactEmail}
                  onChangeText={(value) => { setContactEmail(value); if (errors.contactEmail) setErrors((current) => ({ ...current, contactEmail: undefined })); }}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.text, borderColor: errors.contactEmail ? palette.coral : theme.line, backgroundColor: theme.surfaceSoft }]}
                  accessibilityLabel="Optional contact email"
                />
                {errors.contactEmail && <Text style={styles.fieldError} accessibilityRole="alert">{errors.contactEmail}</Text>}
              </View>

              <View style={[styles.diagnostics, { borderColor: theme.line, backgroundColor: theme.surfaceSoft }]}> 
                <View style={[styles.diagnosticsIcon, { backgroundColor: `${activeThemeColor}18` }]}><Cpu size={18} color={activeThemeColor} /></View>
                <View style={styles.diagnosticsCopy}><Text style={[styles.diagnosticsTitle, { color: theme.text }]}>Include diagnostics</Text><Text style={[styles.diagnosticsText, { color: theme.muted }]}>Platform, app version, screen and theme only. Never search history.</Text></View>
                <Switch value={includeDiagnostics} onValueChange={setIncludeDiagnostics} trackColor={{ false: '#302C34', true: activeThemeColor }} thumbColor={includeDiagnostics && activeThemeColor === palette.lime ? palette.ink : '#FFFFFF'} accessibilityLabel="Include diagnostics" />
              </View>

              {submission.kind !== 'idle' && (
                <View style={[styles.status, submission.kind === 'error' ? styles.statusError : styles.statusSuccess]} accessibilityLiveRegion="polite">
                  {submission.kind === 'error' ? <AlertCircle size={16} color={palette.coral} /> : submission.kind === 'submitting' ? <ActivityIndicator size="small" color={activeThemeColor} /> : <CheckCircle2 size={16} color={activeThemeColor} />}
                  <Text style={[styles.statusText, { color: submission.kind === 'error' ? palette.coral : theme.text }]}>{submission.message}</Text>
                </View>
              )}

              <Pressable
                disabled={submission.kind === 'submitting'}
                onPress={() => void submit()}
                style={({ pressed }) => [styles.submit, { backgroundColor: activeThemeColor }, pressed && styles.pressed, submission.kind === 'submitting' && styles.disabled]}
                accessibilityRole="button"
                accessibilityLabel={endpoint ? 'Submit issue report' : 'Share issue report'}
              >
                {submission.kind === 'submitting' ? <ActivityIndicator color={palette.ink} /> : <Send size={17} color={palette.ink} />}
                <Text style={styles.submitText}>{endpoint ? 'TRANSMIT REPORT' : 'SHARE REPORT'}</Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={[styles.privacy, { color: theme.muted }]}>{endpoint ? 'Sent directly to the configured MUSE support endpoint.' : 'No endpoint configured · your device handles the final send.'}</Text>
                {(description || reproductionSteps || contactEmail) ? <Pressable onPress={clearForm} accessibilityRole="button" accessibilityLabel="Clear report draft"><Text style={[styles.clearText, { color: theme.muted }]}>Clear draft</Text></Pressable> : null}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  noPointerEvents: { pointerEvents: 'none' },
  boxNonePointerEvents: { pointerEvents: 'box-none' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  dock: { width: '100%', maxHeight: '94%', justifyContent: 'flex-end' },
  sheet: { width: '100%', maxWidth: 620, maxHeight: '100%', alignSelf: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 18 },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(150,145,158,0.48)', alignSelf: 'center', marginTop: 9, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerCopy: { flex: 1 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.25 },
  title: { fontSize: 29, lineHeight: 32, fontWeight: '900', letterSpacing: -1.1, marginTop: 5 },
  subtitle: { maxWidth: 390, fontSize: 10.5, lineHeight: 15, fontWeight: '600', marginTop: 4 },
  close: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  form: { paddingTop: 20, paddingBottom: 6, gap: 17 },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 7.5, fontWeight: '800', marginBottom: 7 },
  categoryRail: { gap: 7, paddingRight: 10 },
  category: { height: 36, paddingHorizontal: 13, borderRadius: radii.pill, borderWidth: 1, justifyContent: 'center' },
  categoryText: { fontSize: 9.5, fontWeight: '800' },
  textArea: { minHeight: 116, borderRadius: 18, borderWidth: 1, padding: 13, fontSize: 12, lineHeight: 18 },
  stepsArea: { minHeight: 82, borderRadius: 18, borderWidth: 1, padding: 13, fontSize: 12, lineHeight: 18 },
  input: { height: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, fontSize: 12 },
  fieldError: { color: palette.coral, fontSize: 9, lineHeight: 13, fontWeight: '700', marginTop: 5 },
  diagnostics: { minHeight: 72, borderRadius: 19, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center' },
  diagnosticsIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  diagnosticsCopy: { flex: 1, marginHorizontal: 10 },
  diagnosticsTitle: { fontSize: 11.5, fontWeight: '800' },
  diagnosticsText: { fontSize: 8.5, lineHeight: 12, fontWeight: '600', marginTop: 2 },
  status: { minHeight: 46, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusSuccess: { borderColor: 'rgba(216,255,67,0.30)', backgroundColor: 'rgba(216,255,67,0.07)' },
  statusError: { borderColor: 'rgba(255,112,88,0.38)', backgroundColor: 'rgba(255,112,88,0.08)' },
  statusText: { flex: 1, fontSize: 9.5, lineHeight: 14, fontWeight: '700' },
  submit: { height: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: palette.ink, fontSize: 10.5, fontWeight: '900', letterSpacing: 0.85 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
  footerRow: { minHeight: 30, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  privacy: { flex: 1, fontSize: 7.5, lineHeight: 11 },
  clearText: { fontSize: 8, fontWeight: '800', textDecorationLine: 'underline' },
});
