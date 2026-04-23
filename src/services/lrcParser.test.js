import { describe, it, expect } from 'vitest'
import { parseLRC, getActiveLyricIndex } from './lrcParser.js'

describe('parseLRC', () => {
  it('returns empty array for falsy input', () => {
    expect(parseLRC('')).toEqual([])
    expect(parseLRC(null)).toEqual([])
    expect(parseLRC(undefined)).toEqual([])
  })

  it('parses a single timestamped line', () => {
    const result = parseLRC('[00:12.34]Hello world')
    expect(result).toHaveLength(1)
    expect(result[0].time).toBeCloseTo(12.34, 2)
    expect(result[0].text).toBe('Hello world')
  })

  it('parses multiple lines and computes seconds correctly', () => {
    const input = '[00:10.00]Line A\n[01:30.500]Line B\n[02:05.123]Line C'
    const result = parseLRC(input)
    expect(result).toHaveLength(3)
    expect(result[0].time).toBeCloseTo(10.0, 2)
    expect(result[1].time).toBeCloseTo(90.5, 2)
    expect(result[2].time).toBeCloseTo(125.123, 3)
  })

  it('skips lines that do not match the timestamp pattern', () => {
    const input = 'Title: Foo\n[00:05.00]Real line\n[invalid]skip me'
    const result = parseLRC(input)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Real line')
  })
})

describe('getActiveLyricIndex', () => {
  const stamps = [
    { time: 0, text: 'a' },
    { time: 10, text: 'b' },
    { time: 20, text: 'c' },
  ]

  it('returns -1 before any line starts', () => {
    expect(getActiveLyricIndex(stamps, -1)).toBe(-1)
  })

  it('returns the last line whose time has passed', () => {
    expect(getActiveLyricIndex(stamps, 0)).toBe(0)
    expect(getActiveLyricIndex(stamps, 9.9)).toBe(0)
    expect(getActiveLyricIndex(stamps, 10)).toBe(1)
    expect(getActiveLyricIndex(stamps, 25)).toBe(2)
  })
})
