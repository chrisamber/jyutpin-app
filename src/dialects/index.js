// Dialect registry. Adding a dialect = new folder + one line here.

export const DIALECTS = [
  { code: 'yue', displayName: 'Cantonese', romanizationName: 'Jyutping', toneCount: 6 },
  { code: 'cmn', displayName: 'Mandarin', romanizationName: 'Pinyin', toneCount: 4 },
  { code: 'nan', displayName: 'Hokkien', romanizationName: 'POJ', toneCount: 8 },
];

export function findDialect(code) {
  return DIALECTS.find((d) => d.code === code) ?? DIALECTS[0];
}

export async function getEngine(code) {
  switch (code) {
    case 'yue': {
      const mod = await import('./yue/index.js');
      return mod.engine;
    }
    case 'cmn': {
      const mod = await import('./cmn/index.js');
      return mod.engine;
    }
    case 'nan': {
      const mod = await import('./nan/index.js');
      return mod.engine;
    }
    default:
      return null;
  }
}
