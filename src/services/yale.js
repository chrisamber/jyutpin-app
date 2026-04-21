// Jyutping → Yale romanization conversion
// Low register tones (4,5,6) insert 'h' before the coda consonant.

export function jyutpingToYale(jp) {
  if (!jp) return null;

  const toneMatch = jp.match(/^(.+?)(\d)$/);
  if (!toneMatch) return jp;

  let base = toneMatch[1];
  const tone = parseInt(toneMatch[2]);

  // Initial consonant mappings (regex, applied to full syllable)
  base = base.replace(/^z(?=[aeiou])/, "j");
  base = base.replace(/^c(?=[aeiou])/, "ch");
  base = base.replace(/^j/, "y");

  // Vowel/final mappings (order matters: longer patterns first)
  base = base.replace(/oeng/, "eung");
  base = base.replace(/oek/, "euk");
  base = base.replace(/eoi/, "eui");
  base = base.replace(/oe/, "eu");

  // aa shortening: aa → a before coda consonants
  base = base.replace(/aa(i|u|m|n|p|t|k)/, "a$1");
  base = base.replace(/aa(ng)/, "a$1");
  // bare aa at end → a
  base = base.replace(/aa$/, "a");

  // Low register tones (4,5,6): insert 'h' before coda consonant
  if (tone >= 4) {
    const codaMatch = base.match(/(ng|[mnptk])$/);
    if (codaMatch) {
      const codaStart = base.length - codaMatch[0].length;
      base = base.slice(0, codaStart) + "h" + base.slice(codaStart);
    } else {
      base = base + "h";
    }
  }

  return base + tone;
}
