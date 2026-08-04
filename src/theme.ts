export const palette = {
  ink: '#08070B',
  inkRaised: '#111016',
  inkSoft: '#19171F',
  paper: '#F4F2EE',
  paperRaised: '#FFFFFF',
  text: '#F7F4EE',
  textDark: '#17151B',
  muted: '#9892A1',
  mutedDark: '#6C6672',
  lime: '#D8FF43',
  violet: '#9A70FF',
  coral: '#FF8064',
  pink: '#FF5BAA',
  line: 'rgba(255,255,255,0.10)',
  lineDark: 'rgba(21,18,26,0.10)',
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
};

export const getTheme = (dark: boolean) => ({
  background: dark ? palette.ink : palette.paper,
  surface: dark ? palette.inkRaised : palette.paperRaised,
  surfaceSoft: dark ? palette.inkSoft : '#EAE7E1',
  text: dark ? palette.text : palette.textDark,
  muted: dark ? palette.muted : palette.mutedDark,
  line: dark ? palette.line : palette.lineDark,
});
