const finalMap = [
  ['oeng', 'eung'],
  ['oek', 'euk'],
  ['eoi', 'eui'],
  ['eon', 'eun'],
  ['eot', 'eut'],
  ['oe', 'eu'],
];

const initialMap = [
  ['ch', 'ch'],
  ['c', 'ch'],
  ['z', 'j'],
  ['j', 'y'],
];

export function jyutpingToYale(jp) {
  if (!jp) return '';
  const toneMatch = jp.match(/([1-6])$/);
  const tone = toneMatch ? toneMatch[1] : '';
  let body = toneMatch ? jp.slice(0, -1) : jp;

  for (const [from, to] of initialMap) {
    if (body.startsWith(from)) {
      body = to + body.slice(from.length);
      break;
    }
  }

  for (const [from, to] of finalMap) {
    const idx = body.lastIndexOf(from);
    if (idx > 0) {
      body = body.slice(0, idx) + to + body.slice(idx + from.length);
      break;
    }
  }

  return body + tone;
}
