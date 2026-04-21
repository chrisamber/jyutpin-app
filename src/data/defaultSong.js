export const DEFAULT_SONG = {
  title: "背脊唱情歌",
  artist: "Gareth.T",
  translation: "Singing Love Songs With Your Back Turned",
  isDemo: true,
};

// Full verified lyrics (LyricFind, corrected to traditional characters for accurate jyutping)
export const FULL_LYRICS_TEXT = `麻煩 各位都不望我
望住 我怎麼敢去唱 情歌
然而 我想揀今日 來流露我淒楚
聽完的人 請你扮儍
但唱畢全場靜 其實路人並不傻
都猜中我 為你捱盡折磨
眼淚若嫌多 用背脊唱情歌
難道從後腦 可以望穿我心裡痛什麼
正面像全裸遮醜的布 就別來戳破
願這歌 悲到 一轉背 人間都 忘掉我
原來我不懂怎樣愛
但是作的戀歌也算精彩
忘形 到真失戀後 償還十倍悲哀
終於一個人 站在舞台
願這歌 流行著 遺下 二人 沒將來
歌者痛了 人們還在喝采
眼淚若嫌多 用背脊唱情歌
難道從後腦 可以望穿我心裡痛什麼
正面像全裸遮醜的布 就別來戳破
願這歌 悲到 一轉背 人間都 忘掉我
尚有 沉重的幾句 非要唱不可
世事沒如果 別再冀盼如果
明明 放低的你 經已唱新歌
我尚在如此 不知醜唱著別離開我
失去你 唯有等歌迷去喜歡我`;

// Curated annotations keyed to match FULL_LYRICS_TEXT line structure.
// Lines with no entry here are auto-analyzed (jyutping from to-jyutping, no danger zones).
// Repeated chorus lines (17-20) automatically reuse entries for lines 7-10 via text matching.
export const SONG_LINES = [
  // ── VERSE 1 ──────────────────────────────────────────────────────────────
  {
    chinese: "麻煩 各位都不望我",
    jyutping: "maa4 faan4 gok3 wai6 dou1 bat1 mong6 ngo5",
    translation: "Excuse me, none of you are watching me",
    dangers: [
      { word: "望", jyutping: "mong6", tone: 6, note: "Low level — must stay low and flat. If you rise on this, it sounds like 忘 (mong4, 'forget'). Two instances back-to-back: mong6 ngo5 mong6 zyu6. The pitch must dip consistently." },
    ],
  },
  {
    chinese: "望住 我怎麼敢去唱 情歌",
    jyutping: "mong6 zyu6 ngo5 zam2 mo1 gam2 heoi3 coeng3 cing4 go1",
    translation: "Looking on — how dare I go and sing a love song",
    dangers: [
      { word: "唱", jyutping: "coeng3", tone: 3, note: "Mid level — the 'c' initial is an aspirated ts- sound. Non-natives often miss the aspiration entirely. If you say 'zoeng3' instead, you're saying something else." },
      { word: "情", jyutping: "cing4", tone: 4, note: "Low falling — the emotional anchor word. Must drop clearly. If you sing it at mid-level (tone 3), '情' becomes '清' (clear/pure) — the entire emotional meaning collapses." },
    ],
  },
  {
    chinese: "然而 我想揀今日 來流露我淒楚",
    jyutping: "jin4 ji4 ngo5 soeng2 gaan2 gam1 jat6 loi4 lau4 lou6 ngo5 cai1 co2",
    translation: "Yet I want to choose today to reveal my sorrow",
    dangers: [
      { word: "揀", jyutping: "gaan2", tone: 2, note: "HIGH RISING — this is your 'scoop' tone. The melodic leap must be audible. If you flatten it, 揀 (choose) becomes 間 (gaan1, space/room). The act of choosing today is the singer's agency." },
      { word: "淒楚", jyutping: "cai1 co2", tone: "1→2", note: "High level drops into a rising tone. This is the emotional payoff word meaning 'sorrow/misery.' The contour from 1 to 2 creates a vocal sob. Flatten either and you lose the pathos." },
    ],
  },
  {
    chinese: "聽完的人 請你扮儍",
    jyutping: "teng1 jyun4 dik1 jan4 cing2 nei5 baan6 so4",
    translation: "Those who've heard it, please pretend to be foolish",
    dangers: [
      { word: "扮", jyutping: "baan6", tone: 6, note: "Low level — 'pretend.' If raised to tone 2, becomes 'half' (bun3→baan2 territory). The singer asks the audience to fake ignorance — the tone must be low, resigned." },
    ],
  },

  // ── CHORUS 1 ─────────────────────────────────────────────────────────────
  // (merged from what were two separate curated lines)
  {
    chinese: "但唱畢全場靜 其實路人並不傻",
    jyutping: "daan6 coeng3 bat1 cyun4 coeng4 zing6 kei4 sat6 lou6 jan4 bing6 bat1 so4",
    translation: "But when the singing ends, the whole venue falls silent — actually, passersby aren't foolish",
    dangers: [
      { word: "畢", jyutping: "bat1", tone: 1, note: "ENTERING TONE with -t stop. High, short, clipped. This is a make-or-break moment — if you release the -t (saying 'bat-uh'), it sounds foreign instantly. The stop must be unreleased: tongue touches ridge, no air escapes." },
      { word: "靜", jyutping: "zing6", tone: 6, note: "Low level — 'silence.' This word sits at the end of a phrase, and in singing, it often gets the most sustained note. You must maintain the low pitch even when holding the note long. Rising here = 'compete' (zing3→zing6 confusion)." },
      { word: "實", jyutping: "sat6", tone: 6, note: "ENTERING TONE with -t. Low, short. The -t is unreleased. 'sat' not 'sat-uh'. Combined with 其 (kei4), the pair kei4 sat6 goes from low-falling to low-entering. Keep it tight." },
    ],
  },
  {
    chinese: "都猜中我 為你捱盡折磨",
    jyutping: "dou1 caai1 zung3 ngo5 wai6 nei5 ngaai4 zeon6 zit3 mo4",
    translation: "They all guess that for you I endured all the torment",
    dangers: [
      { word: "捱", jyutping: "ngaai4", tone: 4, note: "Low falling — 'endure/suffer.' The ng- initial is a MAJOR telltale for non-natives. This nasal velar onset requires you to start with the back of your tongue pressed against your soft palate. Most non-natives skip it and say 'aai4.' Native ears catch this instantly." },
      { word: "折磨", jyutping: "zit3 mo4", tone: "3→4", note: "ENTERING TONE (zit3, -t stop) flowing into low falling (mo4). The 'torment' pair. The -t must be unreleased, then immediately voice the 'm' of mo4. This consonant cluster across the syllable boundary is technically demanding." },
    ],
  },
  {
    chinese: "眼淚若嫌多 用背脊唱情歌",
    jyutping: "ngaan5 leoi6 joek6 jim4 do1 jung6 bui3 zek3 coeng3 cing4 go1",
    translation: "If tears are too many, sing a love song with your back turned",
    dangers: [
      { word: "眼", jyutping: "ngaan5", tone: 5, note: "LOW RISING — your other 'scoop' tone. This is the gentle rise (23), NOT the dramatic rise of tone 2 (25). Over-scooping here = tone 2 = different word. The rise is subtle, like a sigh that lifts slightly." },
      { word: "背脊", jyutping: "bui3 zek3", tone: "3→3(entering)", note: "THE TITLE PHRASE. 'bui3' (back/behind) must be mid-level. 'zek3' is an entering tone with -k stop. The -k is unreleased — tongue hits the velum, stops. This two-syllable word is the emotional thesis of the entire song. Mispronounce it and the metaphor collapses." },
    ],
  },
  // merged from "難道從後腦 可以望穿我" + "心裏痛什麼"
  {
    chinese: "難道從後腦 可以望穿我心裡痛什麼",
    jyutping: "naan4 dou6 cung4 hau6 nou5 ho2 ji5 mong6 cyun1 ngo5 sam1 leoi5 tung3 sam6 mo1",
    translation: "Can you really see through me from behind my head — what pain is in my heart",
    dangers: [
      { word: "穿", jyutping: "cyun1", tone: 1, note: "High level — 'see through/penetrate.' Must stay high and sustained. If it drops to tone 3, you get 'cyun3' which shifts meaning. The high pitch here carries the rhetorical desperation." },
      { word: "痛", jyutping: "tung3", tone: 3, note: "Mid level — 'pain.' The aspirated t- is crucial. Non-natives often under-aspirate, making it sound like 'dung' (棟, a pillar). Heart-pain vs a structural pillar. The emotional core word demands correct aspiration." },
    ],
  },
  // merged from "正面像全裸" + "遮醜的布 就別來戳破"
  {
    chinese: "正面像全裸遮醜的布 就別來戳破",
    jyutping: "zing3 min6 zoeng6 cyun4 lo2 ze1 cau2 dik1 bou3 zau6 bit6 loi4 coek3 po3",
    translation: "The front is like being completely naked — the cloth hiding ugliness, don't come and poke through it",
    dangers: [
      { word: "裸", jyutping: "lo2", tone: 2, note: "High rising — 'naked/bare.' This dramatic scoop up reveals vulnerability. If you sing it flat (lo6 = 路, road), the metaphor of emotional exposure dies. The rise IS the exposure." },
      { word: "戳", jyutping: "coek3", tone: 3, note: "ENTERING TONE with -k stop. 'Poke/pierce.' The -k must be unreleased. This is an aggressive, pointed word — the abrupt stop of the entering tone mimics the physical act of piercing." },
      { word: "破", jyutping: "po3", tone: 3, note: "Mid level — 'break through.' Combined with coek3, this pair coek3 po3 is both entering-tone then level — two mid tones in succession. Keep them at the same pitch height. Don't let the second one rise." },
    ],
  },
  {
    chinese: "願這歌 悲到 一轉背 人間都 忘掉我",
    jyutping: "jyun6 ze5 go1 bei1 dou3 jat1 zyun3 bui3 jan4 gaan1 dou1 mong4 diu6 ngo5",
    translation: "I wish this song could be so sad that when I turn my back, the world forgets me",
    dangers: [
      { word: "忘", jyutping: "mong4", tone: 4, note: "Low falling — 'forget.' Compare with 望 (mong6) from line 1. Same consonant-vowel, different tone. mong4 (forget) vs mong6 (gaze). If you mix these up, the closing emotional plea — wanting to be forgotten — becomes wanting to be gazed at. The entire arc inverts." },
      { word: "轉背", jyutping: "zyun3 bui3", tone: "3→3", note: "'Turn one's back' — both mid-level. The pair echoes 背脊 from the chorus. Keep both flat and matched." },
    ],
  },

  // ── VERSE 2 ──────────────────────────────────────────────────────────────
  {
    chinese: "原來我不懂怎樣愛",
    jyutping: "jyun4 loi4 ngo5 bat1 dung2 zam2 joeng6 oi3",
    translation: "It turns out I never knew how to love",
    dangers: [
      { word: "懂", jyutping: "dung2", tone: 2, note: "High rising — 'understand.' The scoop carries self-realization. If flattened to dung6, you get 'pillar/ridgepole' territory again. The rising tone here is a vocal gasp of revelation." },
      { word: "愛", jyutping: "oi3", tone: 3, note: "Mid level — 'love.' The final word of the phrase. No initial consonant — pure open vowel. Non-natives often add a glottal stop. Let the 'oi' flow open from the throat with zero onset tension." },
    ],
  },
  {
    chinese: "但是作的戀歌也算精彩",
    jyutping: "daan6 si6 zok3 dik1 lyun2 go1 jaa5 syun3 zing1 coi2",
    translation: "But the love songs I wrote were still brilliant",
    dangers: [
      { word: "戀", jyutping: "lyun2", tone: 2, note: "High rising — 'romance/love-affair.' The 'ly-' initial requires lip rounding while the tongue is forward. Non-natives often collapse this to 'lun2' (losing the ü-like quality). This is the singer claiming: my art was real even if my love wasn't." },
    ],
  },
  {
    chinese: "忘形 到真失戀後 償還十倍悲哀",
    jyutping: "mong4 jing4 dou3 zan1 sat1 lyun2 hau6 soeng4 waan4 sap6 pui5 bei1 oi1",
    translation: "Lost myself until truly heartbroken, repaying tenfold in sorrow",
    dangers: [
      { word: "失", jyutping: "sat1", tone: 1, note: "ENTERING TONE with -t. High, abrupt. 'Lose.' The sharpness of the entering tone mirrors the sudden loss. If you extend this syllable or release the -t, the feeling of abrupt loss evaporates." },
      { word: "悲哀", jyutping: "bei1 oi1", tone: "1→1", note: "Both high level. 'Grief/sorrow.' Two sustained high tones back to back creates an unbroken wail. Don't let either drop — the sustained height IS the grief." },
    ],
  },
  {
    chinese: "終於一個人 站在舞台",
    jyutping: "zung1 jyu1 jat1 go3 jan4 zaam6 zoi6 mou5 toi4",
    translation: "Finally alone, standing on the stage",
    dangers: [
      { word: "舞台", jyutping: "mou5 toi4", tone: "5→4", note: "'Stage' — low rising into low falling. The 5→4 contour creates a gentle arc: rise then fall. This mirrors the physical act of stepping onto a stage (rising) and the emotional weight of being alone there (falling)." },
    ],
  },
  // "願這歌 流行著 遺下 二人 沒將來" — no curated annotation, auto-analyzed
  {
    chinese: "歌者痛了 人們還在喝采",
    jyutping: "go1 ze2 tung3 liu5 jan4 mun4 waan4 zoi6 hot3 coi2",
    translation: "The singer is in pain, but people are still cheering",
    dangers: [
      { word: "喝采", jyutping: "hot3 coi2", tone: "3(entering)→2", note: "'Applause/cheering.' hot3 has a -t entering tone — clipped, mid-height. Then coi2 rises. The entering tone followed by a rising tone creates a staccato-then-lift pattern. This mimics the sound of clapping (short) and cheering (rising)." },
    ],
  },

  // ── CHORUS 2 (lines 17-20) auto-matches entries above by text ────────────

  // ── BRIDGE ───────────────────────────────────────────────────────────────
  {
    chinese: "尚有 沉重的幾句 非要唱不可",
    jyutping: "soeng6 jau5 cam4 cung5 dik1 gei2 geoi3 fei1 jiu3 coeng3 bat1 ho2",
    translation: "There are still a few heavy lines I absolutely must sing",
    dangers: [
      { word: "沉重", jyutping: "cam4 cung5", tone: "4→5", note: "'Heavy/weighty.' Low falling into low rising. The 4→5 pair dips then lifts — like carrying a heavy burden and struggling upward. Both tones start low, distinguishing them from high tones is critical." },
    ],
  },
  {
    chinese: "世事沒如果 別再冀盼如果",
    jyutping: "sai3 si6 mut6 jyu4 gwo2 bit6 zoi3 kei3 paan3 jyu4 gwo2",
    translation: "Life has no 'what ifs' — stop hoping for 'what ifs'",
    dangers: [
      { word: "如果", jyutping: "jyu4 gwo2", tone: "4→2", note: "'If/what if.' Repeated twice for emphasis. jyu4 (low falling) into gwo2 (high rising). The 4→2 contour drops then dramatically rises — it's a vocal question mark, an ache. Both instances must match perfectly. Inconsistency here sounds like two different words." },
    ],
  },
  {
    chinese: "明明 放低的你 經已唱新歌",
    jyutping: "ming4 ming4 fong3 dai1 dik1 nei5 ging1 ji5 coeng3 san1 go1",
    translation: "The you I clearly let go has already moved on to new songs",
    dangers: [
      { word: "放低", jyutping: "fong3 dai1", tone: "3→1", note: "'Let go/put down.' Mid to high. The upward shift from 3→1 is counterintuitive — 'letting go' moves UP in pitch. This tonal irony is built into the language and the melody should follow." },
    ],
  },
  {
    chinese: "我尚在如此 不知醜唱著別離開我",
    jyutping: "ngo5 soeng6 zoi6 jyu4 ci2 bat1 zi1 cau2 coeng3 zoek6 bit6 lei4 hoi1 ngo5",
    translation: "I'm still here so shamelessly singing: don't leave me",
    dangers: [
      { word: "醜", jyutping: "cau2", tone: 2, note: "High rising — 'ugly/shameful.' The scoop rises into shame. If flattened, meaning shifts. This is the singer's self-awareness — I KNOW this is pathetic. The rising tone is almost a self-mocking laugh." },
      { word: "離開", jyutping: "lei4 hoi1", tone: "4→1", note: "'Leave.' Low falling to high level. The dramatic jump from low to high = the distance of separation. This interval is one of the widest in the song. You must commit to the full pitch range." },
    ],
  },
  {
    chinese: "失去你 唯有等歌迷去喜歡我",
    jyutping: "sat1 heoi3 nei5 wai4 jau5 dang2 go1 mai4 heoi3 hei2 fun1 ngo5",
    translation: "Having lost you, I can only wait for fans to love me instead",
    dangers: [
      { word: "失去", jyutping: "sat1 heoi3", tone: "1(entering)→3", note: "'Lost/lose.' The opening sat1 is entering tone — high, clipped with -t. Then heoi3 drops to mid. High-sharp falling to mid-sustained. The loss is sudden (entering tone) then lingers (level tone)." },
      { word: "喜歡", jyutping: "hei2 fun1", tone: "2→1", note: "'Like/love.' Rising then high-level. The audience's love is the consolation prize. The 2→1 scoop-into-plateau must feel like settling — not soaring. Keep fun1 steady, not climactic." },
    ],
  },
];

// Default section labels for the demo song, keyed by first Chinese line of each section.
// Matched against linesWithChords[i].chinese at load time to derive line indices.
// Lines that share the same Chinese text (both choruses) will all receive the same label.
export const DEFAULT_SECTIONS = {
  "麻煩 各位都不望我": "Verse",
  "但唱畢全場靜 其實路人並不傻": "Pre-Chorus",
  "眼淚若嫌多 用背脊唱情歌": "Chorus",
  "原來我不懂怎樣愛": "Verse",
  "願這歌 流行著 遺下 二人 沒將來": "Pre-Chorus",
  "尚有 沉重的幾句 非要唱不可": "Bridge",
};

export const DANGER_WORDS = [
  { rank: 1, word: "望 vs 忘", jp: "mong6 vs mong4", why: "The emotional axis. 'Gazing at me' (T6, flat low) vs 'forgetting me' (T4, falling low). The song uses both — and the difference between gazing and forgetting is a single tone step. This is the soul of the song's wordplay." },
  { rank: 2, word: "背脊", jp: "bui3 zek3", why: "The title metaphor. 'Back/spine.' The entering tone on 脊 (-k stop) must be clipped. This word carries the entire conceit of the song — singing with your back turned, hiding vulnerability. Release that -k and the metaphor sounds like it's wearing a costume." },
  { rank: 3, word: "情", jp: "cing4", why: "Appears in 情歌 (love song), the genre the singer is performing. T4 low-falling. If you sing it at T3 (mid), you get 清 (clear/pure) — a completely different aesthetic. The word '情' must FEEL heavy and low." },
  { rank: 4, word: "捱", jp: "ngaai4", why: "'Endure suffering.' The ng- initial is mandatory. Skip it and a native listener hears a different word. This is the most physically demanding onset in the song — tongue-back nasal before an open diphthong." },
  { rank: 5, word: "眼淚", jp: "ngaan5 leoi6", why: "'Tears.' Two ng-/low-register words in sequence. ngaan5 has a gentle T5 rise; leoi6 sits at T6 flat-low. The pair must feel heavy and wet. Over-scoop the T5 and it sounds like you're asking a question about crying instead of crying." },
  { rank: 6, word: "失", jp: "sat1", why: "'Lose.' Entering tone, T1 height, -t stop. Appears in 失戀 (heartbreak). The abruptness of the entering tone IS the feeling of sudden loss. Draw it out and you lose the meaning." },
  { rank: 7, word: "如果", jp: "jyu4 gwo2", why: "'What if.' Repeated twice in the bridge. T4→T2 creates a drop-then-rise arc: resignation lifting into desperate hope. Both instances must match exactly — inconsistency here sounds like two different phrases." },
  { rank: 8, word: "離開", jp: "lei4 hoi1", why: "'Leave.' T4→T1 is one of the widest intervals in the song: low-falling jumping to high-level. This IS the distance of departure. Compress the interval and the word loses its spatial metaphor." },
];

export const SINGING_RULES = [
  {
    title: "Rule 1: The Ordinal Pitch Law",
    body: "In Cantopop, songwriters match tone height to melodic pitch using an ordinal (relative) scale, not an exact pitch. This means Tone 1 syllables MUST sit higher than Tone 3 syllables in the melody, and Tone 3 MUST sit higher than Tone 6. You don't need perfect pitch — you need correct relative ordering. When you see consecutive syllables, check: is the higher-toned syllable on the higher note? If not, you're singing it wrong.",
    color: "#FF4444",
  },
  {
    title: "Rule 2: Avoid Contrary Settings",
    body: "The cardinal sin: if the linguistic pitch goes UP from one syllable to the next (e.g., Tone 6 → Tone 1), the melody must NOT go DOWN. And vice versa. This 'avoid contrary settings' rule is the backbone of Cantopop composition. As a singer, this means your instinct to add vocal ornaments or slides must respect the tonal direction. You can add vibrato or dynamics, but never reverse the pitch direction between syllables.",
    color: "#FF8800",
  },
  {
    title: "Rule 3: Unreleased Stops Are Rhythmic Tools",
    body: "In Cantopop, entering tones create natural rhythmic accents. Words like 失 (sat1), 畢 (bat1), 脊 (zek3) have built-in staccato from the unreleased -p/-t/-k. Native singers use these as percussive moments. Some singers even resyllabify: linking the unreleased consonant to the next word's onset (especially before /h/). Don't fight the clipped quality — lean into it.",
    color: "#FFCC00",
  },
  {
    title: "Rule 4: The ng- Initial Is Non-Negotiable",
    body: "Words beginning with ng- (我 ngo5, 眼 ngaan5, 捱 ngaai4) require you to start with the back of your tongue pressed against your soft palate — creating a nasal hum before the vowel. This doesn't exist in English word-initially. Practice: hum 'ng' (like the end of 'sing'), then open into the vowel without moving your tongue first. In singing, this creates a characteristic warm onset that marks native delivery.",
    color: "#44AA44",
  },
  {
    title: "Rule 5: Aspiration Distinguishes Meaning",
    body: "Cantonese has unaspirated/aspirated stop pairs: b/p, d/t, g/k, z/c. In Jyutping, 'b' is unaspirated (no air puff), 'p' is aspirated (air puff). Similarly, 'c' in Jyutping is aspirated (like English 'ts' with a puff), 'z' is unaspirated. The word 唱 (coeng3, 'sing') uses aspirated c-. If you drop the aspiration, it shifts toward a different initial. Hold your hand in front of your mouth: you should feel air on 'c' but not on 'z.'",
    color: "#4488FF",
  },
  {
    title: "Rule 6: Tone 2 vs Tone 5 — The Scoop Distinction",
    body: "You can scoop both — good. Now refine: Tone 2 rises from LOW to HIGH (25). Tone 5 rises from LOW to MID (23). The difference is the ceiling. Tone 2 is a dramatic swoop up; Tone 5 is a gentle lift. In this song: 揀 (gaan2, T2) = big scoop, 眼 (ngaan5, T5) = small lift. Over-scooping T5 to match T2 is a common intermediate error.",
    color: "#9944CC",
  },
];

export const DRILLS = [
  {
    title: "Drill 1: The Unreleased Stop Circuit (5 min)",
    steps: [
      "Take these words from the song: 畢 bat1, 失 sat1, 脊 zek3, 戳 coek3, 實 sat6, 喝 hot3",
      "Say each one slowly. At the final consonant, your tongue/lips must CLOSE but produce ZERO sound after closure.",
      "Test: hold a tissue in front of your mouth. On -p/-t/-k, the tissue should NOT move.",
      "Now say them in rhythm: bat1-sat1-zek3-coek3-sat6-hot3. Speed up gradually.",
      "Finally, sing them on a single pitch. The stop consonants should create natural staccato without you adding any extra silence.",
    ],
    color: "#FF4444",
  },
  {
    title: "Drill 2: The ng- Onset Warm-Up (3 min)",
    steps: [
      "Hum the sound at the end of the English word 'sing' — that's your ng.",
      "Now, WITHOUT moving your tongue, open your mouth from the hum into 'ah': ng→aaah. That's 我 ngo5 without the 'o'.",
      "Practice: ngo5 (I), ngaan5 (eye), ngaai4 (endure). Each must start with the nasal hum.",
      "Sing these three words ascending in pitch. The ng- must be audible on every one.",
      "Record yourself. If you can't hear the nasal onset before the vowel, you're skipping it.",
    ],
    color: "#44AA44",
  },
  {
    title: "Drill 3: The T4/T6 Separator (5 min)",
    steps: [
      "These pairs from the song: 望 mong6 (gaze) / 忘 mong4 (forget), 靜 zing6 (quiet) / 情 cing4 (emotion).",
      "T6 (22) = flat and low. Like humming at the bottom of your range. T4 (21) = starts low and drops LOWER. Like a disappointed sigh.",
      "Say mong6, then mong4. Exaggerate: make T6 absolutely flat, make T4 dip audibly.",
      "Now reduce the exaggeration to natural speech level. Can you still feel the difference?",
      "Sing a single note for T6 words. For T4 words, let your voice sag slightly off the note. That sag IS the tone.",
    ],
    color: "#9944CC",
  },
  {
    title: "Drill 4: The Aspiration Pairs (3 min)",
    steps: [
      "From the song: 唱 coeng3 (aspirated c-) vs imagine zoeng3 (unaspirated z-).",
      "Hold your palm 2 inches from your lips. Say 'coeng3' — you should feel a puff. Say 'zoeng3' — no puff.",
      "Other pairs: 痛 tung3 (aspirated t-) vs dung (unaspirated d-). Feel the air difference.",
      "Sing 唱情歌 (coeng3 cing4 go1) focusing only on the aspiration of c- in both words.",
      "The aspiration should be light but present — not explosive like English 'ch' but more than zero.",
    ],
    color: "#4488FF",
  },
  {
    title: "Drill 5: The T2/T5 Scoop Calibrator (5 min)",
    steps: [
      "From the song: 揀 gaan2 (T2, big rise 25) vs 眼 ngaan5 (T5, small rise 23).",
      "Sing T2 as a slide from your low range to your HIGH range. Dramatic.",
      "Sing T5 as a slide from your low range to your MID range. Restrained.",
      "Alternate: gaan2... ngaan5... gaan2... ngaan5. The T2 ceiling must be noticeably higher.",
      "In context: 我想揀 (ngo5 soeng2 gaan2) — the T2 on 揀 should be the peak of the phrase. 眼淚 (ngaan5 leoi6) — the T5 on 眼 should NOT reach that same height.",
    ],
    color: "#FF8800",
  },
  {
    title: "Drill 6: Full Phrase Contour Reading (10 min)",
    steps: [
      "Take the chorus: 眼淚若嫌多 用背脊唱情歌",
      "Write the tones above each character: 5-6-6-4-1 | 6-3-3-3-4-1",
      "SPEAK the line in exaggerated tonal contour — like a very melodic reading. Don't sing yet.",
      "Now hum the contour without words — just pitch. Does your hum match the melody you know?",
      "If your hum matches the melody: the song's composer already did your work. Your tones ARE the melody.",
      "Finally, sing with lyrics. If it sounds wrong, your tones are off — the melody and tones should be inseparable.",
    ],
    color: "#FFCC00",
  },
];
