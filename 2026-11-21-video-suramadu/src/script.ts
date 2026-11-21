// Naskah + timing. Timing di sini PERKIRAAN (tanpa suara). Kalau suara ElevenLabs sudah ada,
// isi src/align.json (lihat README.md) dan timing kata otomatis dipakai.
import align from './align.json';

export const FPS = 30;

export type Scene = {
  id: string;
  kicker: string;
  title: string; // *kata* = highlight hijau
  phrases: string[];
};
export type Word = {t: string; s: number; e: number};
export type Phrase = {text: string; words: Word[]; s: number; e: number};
export type Timed = Scene & {phr: Phrase[]; dur: number; from: number; speechEnd: number};

export const SCENES: Scene[] = [
  {id: 's01', kicker: '31 MARET 2009', title: 'Jembatan Suramadu, *menjelang tengah malam*',
    phrases: ['Jembatan Suramadu,', 'tiga puluh satu Maret dua ribu sembilan.']},
  {id: 's02', kicker: 'NYATU DI TENGAH', title: 'Potongan terakhir *naik ke celah*',
    phrases: ['Potongan lantai baja terakhir naik ke celah,', 'dan dua ujung jembatan tersambung.']},
  {id: 's03', kicker: 'TENGAH MALAM', title: 'Kembang api *menyala*',
    phrases: ['Kembang api menyala.']},
  {id: 's04', kicker: '5 TAHUN SEBELUMNYA', title: 'Mulainya di *dasar laut*',
    phrases: ['Tapi ceritanya mulai lima tahun sebelumnya.']},
  {id: 's05', kicker: 'FEBRUARI 2004', title: 'Kapal AL *nyisir* jalur jembatan',
    phrases: ['Awal Februari dua ribu empat,', 'kapal Angkatan Laut menyisir jalur jembatan.']},
  {id: 's06', kicker: 'RANJAU LAUT', title: 'Di dasar selat ada *ranjau*',
    phrases: ['Di dasar selat ini', 'masih ada ranjau laut sisa perang.', 'Tahap pertama, lima puluh enam ranjau diledakkan.']},
  {id: 's07', kicker: 'PONDASI', title: 'Tiang pondasi *dibenamkan*',
    phrases: ['Setelah jalurnya aman,', 'tiang-tiang pondasi dibenamkan ke dasar selat.']},
  {id: 's08', kicker: 'NAHAN PAKAI GESEKAN', title: 'Kayak tongkat di *lumpur sawah*',
    phrases: ['Kayak tongkat yang ditancap di lumpur sawah,', 'makin dalam, makin kuat tertahan', 'gesekan sepanjang batangnya.']},
  {id: 's09', kicker: 'MENARA 140 M', title: 'Dua menara beton *naik*',
    phrases: ['Di atasnya, dua menara beton naik,', 'tingginya sekitar seratus empat puluh meter.']},
  {id: 's10', kicker: 'LANTAI BAJA + KABEL', title: 'Dipasang *satu-satu*, digantung kabel',
    phrases: ['Dari tiap menara,', 'potongan lantai dipasang satu-satu ke kiri dan kanan,', 'langsung digantung kabel.']},
  {id: 's11', kicker: 'KIRI-KANAN SEIMBANG', title: 'Mirip *tukang pikul*',
    phrases: ['Beban kiri dan kanan harus seimbang,', 'persis kayak tukang pikul.']},
  {id: 's12', kicker: '35 M BUAT KAPAL', title: 'Lantai *35 m* di atas laut',
    phrases: ['Lantai bentang utamanya dijaga tiga puluh lima meter,', 'biar kapal besar tetap bisa lewat.']},
  {id: 's13', kicker: 'MAKIN DEKET', title: 'Dua ujung *maju ke tengah*',
    phrases: ['Dua ujungnya terus maju,', 'bentang tengah mulai dikerjakan November dua ribu lima.']},
  {id: 's14', kicker: '31 MARET, MALAM', title: 'Dua ujung akhirnya *bertemu*',
    phrases: ['Dan tiga puluh satu Maret malam itu,', 'dua ujungnya bertemu di tengah.', 'Sepuluh Juni dua ribu sembilan, jembatan dibuka untuk umum.']},
];

const LEAD = 0.45;
const TAIL = 0.55;
const wordDur = (w: string) => 0.062 * w.replace(/[^\p{L}\p{N}]/gu, '').length + 0.07;

type AlignScene = {phrases: {words: {t: string; s: number; e: number}[]}[]; dur?: number};
const A = align as Record<string, AlignScene>;

let acc = 0;
export const TIMED: Timed[] = SCENES.map((sc) => {
  let t = LEAD;
  const al = A[sc.id];
  const phr: Phrase[] = sc.phrases.map((text, pi) => {
    let words: Word[];
    if (al?.phrases?.[pi]) {
      words = al.phrases[pi].words;
    } else {
      words = text.split(' ').map((w) => {
        const s = t;
        t += wordDur(w);
        return {t: w, s, e: t};
      });
      t += /[.]$/.test(text) ? 0.3 : 0.14;
    }
    return {text, words, s: words[0].s, e: words[words.length - 1].e};
  });
  const speechEnd = phr[phr.length - 1].e;
  const dur = Math.ceil((al?.dur ?? speechEnd + TAIL) * FPS);
  const out: Timed = {...sc, phr, dur, from: acc, speechEnd};
  acc += dur;
  return out;
});
export const TOTAL = acc;
