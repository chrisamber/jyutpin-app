import { describe, it, expect } from 'vitest'
import { transposeChord, capoFret, transposeLabel } from './transpose.js'

describe('transposeChord', () => {
  it('identity at 0 semitones returns original', () => {
    expect(transposeChord('C', 0)).toBe('C')
    expect(transposeChord('F#m', 0)).toBe('F#m')
    expect(transposeChord('Bbmaj7', 0)).toBe('Bbmaj7')
  })

  it('returns original for falsy / unparseable input', () => {
    expect(transposeChord('', 2)).toBe('')
    expect(transposeChord(null, 2)).toBe(null)
    expect(transposeChord('N.C.', 2)).toBe('N.C.')
  })

  it('transposes simple major/minor chords', () => {
    expect(transposeChord('C', 2)).toBe('D')
    expect(transposeChord('Am', 2)).toBe('Bm')
    expect(transposeChord('G', -2)).toBe('F')
  })

  it('preserves chord quality through transposition', () => {
    expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7')
    expect(transposeChord('Am7', 3)).toBe('Cm7')
    expect(transposeChord('Dsus4', 2)).toBe('Esus4')
  })

  it('F#m +2 → G#m — sharp input, sharp-or-flat canonical output', () => {
    // G# pitch class canonicalizes to Ab in this app's convention.
    expect(transposeChord('F#m', 2)).toBe('Abm')
  })

  it('Bbm -1 → Am — flat input, natural output', () => {
    expect(transposeChord('Bbm', -1)).toBe('Am')
  })

  it('handles slash-bass chords', () => {
    expect(transposeChord('C/G', 5)).toBe('F/C')
    expect(transposeChord('G/B', 3)).toBe('Bb/D')
    expect(transposeChord('D/F#', 2)).toBe('E/Ab')
  })

  it('normalizes enharmonics to canonical spelling', () => {
    // A# and Bb are the same pitch class — app prefers Bb (flats for those roots).
    expect(transposeChord('A', 1)).toBe('Bb')
    // D# → Eb canonical.
    expect(transposeChord('D', 1)).toBe('Eb')
  })

  it('wraps around the octave', () => {
    expect(transposeChord('C', 12)).toBe('C')
    expect(transposeChord('C', -12)).toBe('C')
    expect(transposeChord('B', 1)).toBe('C')
  })
})

describe('capoFret', () => {
  it('returns positive fret for small positive transposition', () => {
    expect(capoFret(0)).toBe(0)
    expect(capoFret(2)).toBe(2)
    expect(capoFret(5)).toBe(5)
  })

  it('returns negative fret (i.e. down-transpose) past halfway', () => {
    expect(capoFret(7)).toBe(-5)
    expect(capoFret(11)).toBe(-1)
  })

  it('wraps at the octave', () => {
    expect(capoFret(12)).toBe(0)
  })
})

describe('transposeLabel', () => {
  it('formats zero, positive, negative', () => {
    expect(transposeLabel(0)).toBe('0')
    expect(transposeLabel(3)).toBe('+3')
    expect(transposeLabel(-2)).toBe('-2')
  })
})
