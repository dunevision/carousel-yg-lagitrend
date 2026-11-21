import {continueRender, delayRender} from 'remotion';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

export const SANS = '"Plus Jakarta Sans", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

const h = delayRender('fonts');
Promise.all([
  document.fonts.load('500 40px "Plus Jakarta Sans"'),
  document.fonts.load('600 40px "Plus Jakarta Sans"'),
  document.fonts.load('700 40px "Plus Jakarta Sans"'),
  document.fonts.load('800 40px "Plus Jakarta Sans"'),
  document.fonts.load('500 20px "JetBrains Mono"'),
  document.fonts.load('700 20px "JetBrains Mono"'),
])
  .catch(() => undefined)
  .then(() => continueRender(h));
