// 緊急聯絡人 by Gareth.T - Chord Chart
// Key: E major (Capo 1) | Sounding key: F
// Arranged by: mochi_music_852

export const JINYULIANHEREN_CHORDS = {
  metadata: {
    title: "緊急聯絡人",
    artist: "Gareth.T",
    key: "E",
    capo: 1,
    originalKey: "F",
    tempo: 70,
    timeSignature: "4/4",
  },

  // Intro
  intro: [
    "Aadd9 B7",
    "G#m C#m",
    "A G#m",
    "F#m B",
  ],

  // Line-by-line chord mapping
  lines: [
    // Verse 1
    {
      lyric: "傳來法語 問你 是我的家屬吧",
      chords: "Emaj7 | G#m C#m",
    },
    {
      lyric: "原來我已 自那 白朗之巔墮下",
      chords: "Amaj7 | C#m",
    },
    {
      lyric: "明明分開 為何打這號碼",
      chords: "F#m | G#m7 C#m7",
    },
    {
      lyric: "你可會很不解 我怎不刪了它",
      chords: "Amaj7 | F#m7 B7",
    },
    {
      lyric: "我知不該 但是不改",
      chords: "A | Am6",
    },
    {
      lyric: "像某種流亡的愛 千里之外",
      chords: "G#m | C#7 F#m",
    },
    {
      lyric: "聯繫 還是 依在",
      chords: "A | B7",
    },

    // Chorus 1
    {
      lyric: "有沒有一絲 半秒 傷悲",
      chords: "Amaj7 | B",
    },
    {
      lyric: "要是我今晚 異地 斷氣",
      chords: "G#m7 | C#m7",
    },
    {
      lyric: "問你可肯即夜 趕搭通宵客機",
      chords: "F#m7 | A E",
    },
    {
      lyric: "有沒有一絲 半秒 歡喜",
      chords: "Amaj7 | B",
    },
    {
      lyric: "再無人以後 來煩住你",
      chords: "G# | C#m7",
    },
    {
      lyric: "若覺得 將這責任加諸 很離奇",
      chords: "A | F#m7",
    },
    {
      lyric: "是我自私 今世最後 騷擾的人兒",
      chords: "A | B",
    },
    {
      lyric: "只想 是你",
      chords: "E | E",
    },

    // Bridge
    {
      lyric: "誰聯絡你 若我在某冰川 遇難",
      chords: "Emaj7 | G#m C#m",
    },
    {
      lyric: "然而教你負痛 亦算黑色浪漫",
      chords: "Amaj7 | C#m",
    },
    {
      lyric: "甜蜜那陣時 鰥寡日子 總講到帶淚眼",
      chords: "F#m | G#m7 C#m7",
    },
    {
      lyric: "誰料情感無常 這假設太簡單",
      chords: "Amaj7 | F#m7 B7",
    },
    {
      lyric: "你 有沒有一絲 半秒 傷悲",
      chords: "Amaj7 | B",
    },

    // Chorus 2 (repeat structure)
    {
      lyric: "要是我今晚 異地 斷氣",
      chords: "G#m7 | C#m7",
    },
    {
      lyric: "問你可肯即夜 趕搭通宵客機",
      chords: "F#m7 | A E",
    },
    {
      lyric: "有沒有一絲 半秒 歡喜",
      chords: "Amaj7 | B",
    },
    {
      lyric: "再無人以後 去牽絆你",
      chords: "G# | C#m7",
    },
    {
      lyric: "若覺得 將這責任加諸 很離奇",
      chords: "A | F#m7",
    },
    {
      lyric: "是我自私 今世最後 騷擾的人兒",
      chords: "A | B",
    },
    {
      lyric: "只想 是你",
      chords: "E | E",
    },
    {
      lyric: "必須 是你",
      chords: "E",
    },
    {
      lyric: "很想被念記",
      chords: "E",
    },
    {
      lyric: "即使 淡淡 微微",
      chords: "A",
    },
    {
      lyric: "就算在生 亦被嫌棄",
      chords: "A | Am",
    },
    {
      lyric: "都想藉 遺言說 好想你",
      chords: "B | C#m7",
    },
    {
      lyric: "可惜 最尾 未夠 運氣 一起",
      chords: "A | B7 C7",
    },

    // Final Chorus
    {
      lyric: "有沒有一絲 Ha~",
      chords: "C",
    },
    {
      lyric: "要是我今晚 Ha~",
      chords: "Am7 | Dm7",
    },
    {
      lyric: "話到嘴邊打住",
      chords: "Bb",
    },
    {
      lyric: "早變陌路人 尚有幻想是大忌",
      chords: "Dm7 | C",
    },
    {
      lyric: "這號碼應該 長眠於手機",
      chords: "Bb | C",
    },
    {
      lyric: "就算死 亦別 再騷擾你",
      chords: "Am | Dm7",
    },
    {
      lyric: "若覺得 這惡作劇真的 很頑皮",
      chords: "Bb",
    },
    {
      lyric: "在告別式 給我帶淚 奔喪的情人",
      chords: "Bb | C",
    },
    {
      lyric: "只想 是你",
      chords: "C7 | F",
    },
  ],

  // Chord progression templates for sections
  sections: {
    intro: ["Aadd9 B7", "G#m C#m", "A G#m", "F#m B"],
    verse: ["Amaj7", "F#m7 B7"],
    chorus: ["Amaj7 B", "G#m7 C#m7", "F#m7 A E"],
    bridge: ["Emaj7 G#m C#m", "Amaj7 C#m"],
    outro: ["C7 F"],
  },

  // Capo reference for other keys
  keyVariations: {
    E: {
      capo: 1,
      soundingKey: "F",
      note: "Original key — diatonic E major shapes, capo 1, sounds in F",
      difficulty: "intermediate",
    },
  },
};

// Helper function to get chords for a specific lyric line
export function getChordsForLine(lyric) {
  const line = JINYULIANHEREN_CHORDS.lines.find(
    (l) => l.lyric.toLowerCase().trim() === lyric.toLowerCase().trim()
  );
  return line?.chords || null;
}

// Export for localStorage integration
export function saveChordsToStorage(storageId = "lrclib:jinyulianheren") {
  const chordMap = {};
  JINYULIANHEREN_CHORDS.lines.forEach((line, index) => {
    chordMap[index] = line.chords;
  });
  localStorage.setItem(`chords:${storageId}`, JSON.stringify(chordMap));
  return chordMap;
}
