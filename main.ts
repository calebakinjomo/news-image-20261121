// THE WORLD IN ONE PICTURE — Saturday 21 November 2026.
// A deterministic newspaper front page drawn entirely in code.
// Node 22+ stdlib only. Writes one 1024x1024 PNG to $MAKEFUN_OUTPUT_DIR/entry.png
// (or /output/entry.png). No clock, no randomness, no file reads at run time:
// two runs produce byte-identical output.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// Palette: off-white paper, black ink, one muted red and one muted blue.
// ---------------------------------------------------------------------------
const PAPER: RGB = [247, 242, 231];
const INK: RGB = [26, 26, 26];
const RED: RGB = [168, 50, 38];
const BLUE: RGB = [31, 78, 121];
const GREY: RGB = [110, 104, 92];
const SKY: RGB = [196, 214, 228];
const SKY2: RGB = [158, 186, 205];
const SEA: RGB = [64, 108, 140];
const SEA2: RGB = [44, 84, 112];
const SAND: RGB = [214, 196, 150];
const ORANGE: RGB = [224, 122, 32];
const FLAME: RGB = [232, 78, 32];
const DARK: RGB = [52, 52, 52];

type RGB = [number, number, number];

// ---------------------------------------------------------------------------
// 5x7 bitmap font. Each glyph is 7 rows of 5 bits, written as strings.
// Uppercase, digits and the punctuation this poster needs.
// ---------------------------------------------------------------------------
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  "=": ["00000", "00000", "01110", "00000", "01110", "00000", "00000"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawGlyph(c: Canvas, ch: string, x: number, y: number, s: number, col: RGB): void {
  const g = GLYPHS[ch];
  if (!g) return;
  for (let r = 0; r < 7; r++) {
    for (let colI = 0; colI < 5; colI++) {
      if (g[r][colI] === "1") c.rect(x + colI * s, y + r * s, s, s, col);
    }
  }
}

function drawText(c: Canvas, s: string, x: number, y: number, scale: number, col: RGB): void {
  for (let i = 0; i < s.length; i++) drawGlyph(c, s[i], x + i * 6 * scale, y, scale, col);
}

function drawTextCentered(c: Canvas, s: string, cx: number, y: number, scale: number, col: RGB): void {
  drawText(c, s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, col);
}

// Greedy word wrap. Returns lines that fit maxWidth pixels at the given scale.
function wrap(s: string, maxWidth: number, scale: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur === "" ? w : cur + " " + w;
    if (textWidth(trial, scale) <= maxWidth) {
      cur = trial;
    } else {
      if (cur !== "") lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------------------
// Canvas: an RGB pixel buffer with simple filled shapes.
// ---------------------------------------------------------------------------
class Canvas {
  data: Uint8Array;
  constructor() {
    this.data = new Uint8Array(W * H * 3);
    this.rect(0, 0, W, H, PAPER);
  }
  set(x: number, y: number, col: RGB): void {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.data[i] = col[0];
    this.data[i + 1] = col[1];
    this.data[i + 2] = col[2];
  }
  rect(x: number, y: number, w: number, h: number, col: RGB): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(W, Math.ceil(x + w));
    const y1 = Math.min(H, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) this.set(xx, yy, col);
    }
  }
  hline(x0: number, x1: number, y: number, t: number, col: RGB): void {
    this.rect(x0, y, x1 - x0, t, col);
  }
  vline(x: number, y0: number, y1: number, t: number, col: RGB): void {
    this.rect(x, y0, t, y1 - y0, col);
  }
  // Bresenham line with a square brush of width t.
  line(x0: number, y0: number, x1: number, y1: number, t: number, col: RGB): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    const half = Math.floor(t / 2);
    for (;;) {
      this.rect(x - half, y - half, t, t, col);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  disc(cx: number, cy: number, r: number, col: RGB): void {
    for (let yy = -r; yy <= r; yy++) {
      for (let xx = -r; xx <= r; xx++) {
        if (xx * xx + yy * yy <= r * r) this.set(cx + xx, cy + yy, col);
      }
    }
  }
  ring(cx: number, cy: number, r: number, t: number, col: RGB): void {
    for (let a = 0; a < 360; a += 2) {
      const rad = (a * Math.PI) / 180;
      const px = Math.round(cx + Math.cos(rad) * r);
      const py = Math.round(cy + Math.sin(rad) * r);
      this.disc(px, py, Math.max(1, Math.floor(t / 2)), col);
    }
  }
  // Filled triangle by scanline interpolation.
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, col: RGB): void {
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    for (let y = minY; y <= maxY; y++) {
      const xs: number[] = [];
      const edges: [number, number, number, number][] = [
        [x0, y0, x1, y1],
        [x1, y1, x2, y2],
        [x2, y2, x0, y0],
      ];
      for (const [ax, ay, bx, by] of edges) {
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
        }
      }
      if (xs.length >= 2) {
        const lo = Math.min(...xs);
        const hi = Math.max(...xs);
        this.rect(Math.floor(lo), y, Math.ceil(hi) - Math.floor(lo) + 1, 1, col);
      }
    }
  }
  // Flame: three stacked triangles, orange outside, red core, yellow tip.
  flame(x: number, yBase: number, w: number, h: number): void {
    this.tri(x - w / 2, yBase, x + w / 2, yBase, x, yBase - h, ORANGE);
    this.tri(x - w / 4, yBase, x + w / 4, yBase, x, yBase - (h * 2) / 3, FLAME);
    this.tri(x - w / 8, yBase, x + w / 8, yBase, x, yBase - h / 3, [242, 196, 64]);
  }
}

// ---------------------------------------------------------------------------
// PNG encoder: truecolour, filter 0, zlib DEFLATE (node:zlib, level 9).
// Same input bytes always compress to the same output on this runtime, so
// two runs stay byte-identical.
// ---------------------------------------------------------------------------
const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crc = crc32(out.subarray(4, 8 + data.length));
  dv.setUint32(8 + data.length, crc);
  return out;
}

function encodePNG(c: Canvas): Uint8Array {
  // Raw scanlines: filter byte 0 + W*3 bytes per row.
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(c.data.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  // zlib stream via node:zlib at maximum compression (deterministic here).
  const zlib = deflateSync(raw, { level: 9 });

  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", zlib), chunk("IEND", new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let q = 0;
  for (const part of parts) {
    out.set(part, q);
    q += part.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Illustrations. All shapes are drawn by hand from rectangles, lines,
// discs and triangles — no images, no assets.
// ---------------------------------------------------------------------------

// Lead art: missiles streaking over the Gulf, Bahrain island with a burning
// industrial site, and a US warship of the Fifth Fleet on the water.
function drawLeadArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  const horizon = y + Math.floor(h * 0.62);
  c.rect(x, y, w, horizon - y, SKY);
  c.rect(x, horizon, w, y + h - horizon, SEA);
  c.rect(x, y, w, 3, BLUE);
  c.rect(x, y + h - 3, w, 3, BLUE);
  // Sun, hazy.
  c.disc(x + 90, y + 34, 22, [238, 214, 140]);
  c.ring(x + 90, y + 34, 28, 3, [238, 214, 140]);
  // Clouds.
  c.disc(x + 330, y + 26, 12, [255, 255, 255]);
  c.disc(x + 348, y + 22, 15, [255, 255, 255]);
  c.disc(x + 368, y + 28, 11, [255, 255, 255]);
  c.disc(x + 700, y + 18, 10, [255, 255, 255]);
  c.disc(x + 716, y + 14, 13, [255, 255, 255]);
  // Bahrain island, right of centre: a low flat-topped island meeting the water.
  const ix = x + Math.floor(w * 0.60);
  c.rect(ix + 26, horizon - 20, 210, 20, SAND);
  c.disc(ix + 60, horizon - 20, 26, SAND);
  c.disc(ix + 130, horizon - 24, 30, SAND);
  c.disc(ix + 200, horizon - 20, 24, SAND);
  // Industrial site on the island: tanks and towers, one on fire.
  c.rect(ix + 60, horizon - 44, 26, 24, DARK);
  c.rect(ix + 94, horizon - 36, 18, 16, DARK);
  c.rect(ix + 120, horizon - 56, 10, 36, DARK);
  c.rect(ix + 140, horizon - 40, 30, 20, DARK);
  c.flame(ix + 155, horizon - 40, 16, 26);
  c.flame(ix + 76, horizon - 44, 12, 18);
  // Smoke drifting up from the fire.
  c.disc(ix + 150, horizon - 66, 9, GREY);
  c.disc(ix + 142, horizon - 80, 11, GREY);
  c.disc(ix + 132, horizon - 94, 8, GREY);
  // US warship, left on the water.
  const sx = x + 60;
  const sy = horizon + 8;
  c.rect(sx, sy, 170, 14, DARK); // hull
  c.tri(sx + 170, sy, sx + 170, sy + 14, sx + 198, sy + 14, DARK); // bow
  c.rect(sx + 30, sy - 18, 70, 18, [90, 90, 90]); // superstructure
  c.rect(sx + 110, sy - 12, 34, 12, [90, 90, 90]);
  c.vline(sx + 60, sy - 40, sy - 18, 3, DARK); // mast
  c.disc(sx + 60, sy - 42, 5, RED); // radar
  c.rect(sx + 12, sy + 14, 150, 3, [255, 255, 255]); // wake
  // Sea sparkle.
  c.hline(x + 300, x + 380, horizon + 16, 2, [255, 255, 255]);
  c.hline(x + 520, x + 580, horizon + 26, 2, [255, 255, 255]);
  // Missile streaks diving from the upper right toward the island.
  c.line(x + 880, y + 8, ix + 190, horizon - 58, 3, FLAME);
  c.line(x + 830, y + 4, ix + 150, horizon - 52, 3, ORANGE);
  c.line(x + 760, y + 12, ix + 110, horizon - 60, 3, FLAME);
  c.disc(ix + 190, horizon - 58, 5, FLAME);
  c.disc(ix + 150, horizon - 52, 5, ORANGE);
  c.disc(ix + 110, horizon - 60, 5, FLAME);
  // Small label inside the art, bottom left.
  drawText(c, "THE GULF - SATURDAY", x + 8, y + h - 16, 1, [255, 255, 255]);
}

// COP31: a globe with a hot sun.
function drawCopArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, h, SKY);
  c.disc(x + 70, y + 34, 26, SEA);
  c.disc(x + 62, y + 28, 9, [96, 160, 90]);
  c.disc(x + 80, y + 42, 8, [96, 160, 90]);
  c.ring(x + 70, y + 34, 26, 2, BLUE);
  c.disc(x + 210, y + 22, 14, ORANGE);
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    c.line(
      x + 210 + Math.round(Math.cos(rad) * 20),
      y + 22 + Math.round(Math.sin(rad) * 20),
      x + 210 + Math.round(Math.cos(rad) * 28),
      y + 22 + Math.round(Math.sin(rad) * 28),
      2,
      ORANGE,
    );
  }
  // Thermometer.
  c.rect(x + 252, y + 10, 8, 32, [255, 255, 255]);
  c.rect(x + 254, y + 26, 4, 14, RED);
  c.disc(x + 256, y + 44, 6, RED);
  c.rect(x, y + h - 3, w, 3, BLUE);
}

// El Chapo: handcuffs.
function drawChapoArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, h, [232, 224, 205]);
  c.line(x + 120, y + 28, x + 175, y + 28, 4, DARK);
  c.ring(x + 105, y + 28, 20, 5, DARK);
  c.ring(x + 190, y + 28, 20, 5, DARK);
  c.disc(x + 105, y + 28, 4, RED);
  c.disc(x + 190, y + 28, 4, RED);
  c.rect(x, y + h - 3, w, 3, BLUE);
}

// Kryvyi Rih: city blocks with an explosion burst.
function drawKryvyiArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, h, [214, 206, 188]);
  c.rect(x + 20, y + 24, 40, 32, DARK);
  c.rect(x + 70, y + 14, 34, 42, DARK);
  c.rect(x + 114, y + 30, 44, 26, DARK);
  c.rect(x + 168, y + 20, 36, 36, DARK);
  // Lit windows.
  c.rect(x + 30, y + 32, 6, 6, [242, 196, 64]);
  c.rect(x + 80, y + 22, 6, 6, [242, 196, 64]);
  c.rect(x + 126, y + 38, 6, 6, [242, 196, 64]);
  // Explosion burst above the blocks: jagged red-orange rays, small core,
  // and grey smoke drifting left — not a sun.
  const bx = x + 240;
  const by = y + 22;
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    const len = a % 2 === 0 ? 24 : 15;
    c.line(
      bx + Math.round(Math.cos(rad) * 7),
      by + Math.round(Math.sin(rad) * 7),
      bx + Math.round(Math.cos(rad) * len),
      by + Math.round(Math.sin(rad) * len),
      3,
      a % 2 === 0 ? FLAME : ORANGE,
    );
  }
  c.disc(bx, by, 6, RED);
  c.disc(bx - 18, by - 8, 6, GREY);
  c.disc(bx - 26, by - 14, 7, GREY);
  c.rect(x, y + h - 3, w, 3, BLUE);
}

// Sparta II: a cargo ship on fire in the Baltic.
function drawSpartaArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, h, SKY2);
  // Waves.
  c.hline(x + 10, x + 90, y + 44, 3, [255, 255, 255]);
  c.hline(x + 200, x + 280, y + 48, 3, [255, 255, 255]);
  c.rect(x, y + 40, w, h - 40, SEA);
  // Hull.
  c.rect(x + 60, y + 26, 150, 16, DARK);
  c.tri(x + 210, y + 26, x + 210, y + 42, x + 234, y + 42, DARK);
  c.rect(x + 80, y + 12, 60, 14, [90, 90, 90]);
  c.rect(x + 150, y + 18, 26, 8, RED);
  c.flame(x + 120, y + 12, 18, 24);
  c.disc(x + 112, y - 6 + 14, 8, GREY);
  c.disc(x + 104, y - 14 + 14, 10, GREY);
  c.rect(x, y + h - 3, w, 3, BLUE);
}

// Wall Street: falling red bars and a down arrow.
function drawMarketArt(c: Canvas, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, h, [238, 232, 220]);
  const bars = [46, 40, 32, 24, 14];
  for (let i = 0; i < bars.length; i++) {
    const bx = x + 30 + i * 52;
    c.rect(bx, y + h - 6 - bars[i], 30, bars[i], RED);
  }
  c.line(x + 24, y + 8, x + 280, y + h - 10, 4, INK);
  c.tri(x + 280, y + h - 10, x + 262, y + h - 16, x + 288, y + h - 24, INK);
  drawText(c, "S&P -3.7%  NASDAQ -5.28%  DOW -1.9%", x + 320, y + 22, 1, INK);
  c.rect(x, y + h - 3, w, 3, BLUE);
}

// ---------------------------------------------------------------------------
// A secondary story box: kicker, wrapped headline, art strip, wrapped body.
// ---------------------------------------------------------------------------
interface Story {
  kicker: string;
  headline: string;
  body: string;
  art: (c: Canvas, x: number, y: number, w: number, h: number) => void;
}

function drawStoryBox(c: Canvas, s: Story, x: number, y: number, w: number, h: number): void {
  c.rect(x, y, w, 2, INK);
  const pad = 12;
  const inner = w - pad * 2;
  let cy = y + 12;
  drawText(c, s.kicker, x + pad, cy, 1, RED);
  cy += 12;
  const headLines = wrap(s.headline, inner, 2);
  for (const ln of headLines) {
    drawText(c, ln, x + pad, cy, 2, INK);
    cy += 18;
  }
  cy += 4;
  s.art(c, x + pad, cy, inner, 56);
  cy += 56 + 10;
  const bodyLines = wrap(s.body, inner, 1);
  for (const ln of bodyLines) {
    drawText(c, ln, x + pad, cy, 1, INK);
    cy += 10;
  }
  void h;
}

// ---------------------------------------------------------------------------
// Page layout.
// ---------------------------------------------------------------------------
function drawPage(): Canvas {
  const c = new Canvas();

  // Outer frame: thick rule, then a thin inner rule.
  c.rect(10, 10, W - 20, 3, INK);
  c.rect(10, H - 13, W - 20, 3, INK);
  c.rect(10, 10, 3, H - 20, INK);
  c.rect(W - 13, 10, 3, H - 20, INK);
  c.rect(20, 20, W - 40, 1, INK);
  c.rect(20, H - 21, W - 40, 1, INK);

  // Masthead.
  drawTextCentered(c, "THE WORLD IN ONE PICTURE", W / 2, 40, 5, INK);
  c.hline(60, W - 60, 88, 2, RED);
  drawTextCentered(c, "SATURDAY 21 NOVEMBER 2026", W / 2, 96, 3, RED);
  c.hline(60, W - 60, 122, 3, INK);
  c.hline(60, W - 60, 128, 1, INK);

  // ---- Lead story ----
  const lx = 40;
  const lw = W - 80;
  let ly = 142;
  drawText(c, "LEAD STORY", lx, ly, 1, RED);
  ly += 14;
  drawText(c, "IRAN STRIKES BAHRAIN", lx, ly, 4, INK);
  ly += 34;
  drawText(c, "US BASES TARGETED", lx, ly, 4, RED);
  ly += 34;
  drawLeadArt(c, lx, ly + 6, lw, 148);
  ly += 6 + 148 + 12;
  const leadBody =
    "IRAN'S REVOLUTIONARY GUARDS FIRED MISSILES AND DRONES AT US POSITIONS " +
    "AT AL-RIFFA AND AWALI IN BAHRAIN, HOME OF THE US NAVY'S FIFTH FLEET. " +
    "BAHRAIN SAID A CIVILIAN INDUSTRIAL SITE WAS HIT AND CAUGHT FIRE, WITH NO " +
    "INJURIES. ITS AIR DEFENCES INTERCEPTED MORE ATTACKS. TEHRAN CLAIMS TWO US " +
    "PATRIOT RADARS WERE DESTROYED. TWO TANKERS WERE ALSO HIT IN THE STRAIT OF HORMUZ.";
  const leadLines = wrap(leadBody, lw, 2);
  for (const ln of leadLines) {
    drawText(c, ln, lx, ly, 2, INK);
    ly += 20;
  }

  // Divider above the grid.
  c.hline(40, W - 40, 512, 3, INK);
  c.hline(40, W - 40, 518, 1, INK);

  // ---- Secondary grid: 3 across, 2 rows; Wall Street spans the last two cells.
  const stories: Story[] = [
    {
      kicker: "CLIMATE - COP31",
      headline: "COP31 IN OVERTIME: FOSSIL FUELS DROPPED",
      body:
        "TALKS IN ANTALYA RAN INTO A SECOND DAY OF OVERTIME. THE FINAL DRAFT " +
        "DROPS EVERY MENTION OF FOSSIL FUELS AND ANY PHASE-OUT. IT SETS A " +
        "35%-BY-2035 ELECTRIFICATION GOAL. THE EU SAYS IT MAY WALK AWAY RATHER THAN ACCEPT IT.",
      art: drawCopArt,
    },
    {
      kicker: "MEXICO",
      headline: "EL CHAPO ISIDRO CAPTURED - 11 DEAD",
      body:
        "MEXICAN SPECIAL FORCES CAPTURED FAUSTO ISIDRO MEZA FLORES IN GUASAVE, " +
        "SINALOA, WITH US INTELLIGENCE HELP. ELEVEN WERE KILLED - FOUR SOLDIERS " +
        "AND SEVEN GUNMEN. HE WAS FLOWN TO MEXICO CITY AT 04:00 ON SATURDAY.",
      art: drawChapoArt,
    },
    {
      kicker: "UKRAINE",
      headline: "TRIPLE-TAP STRIKE ON KRYVYI RIH",
      body:
        "RUSSIAN MISSILES HIT A RESTAURANT CAR PARK, THEN JET-POWERED DRONES " +
        "STRUCK RESCUERS TWICE MORE. A 7-YEAR-OLD BOY, TIKHON, AND A 20-YEAR-OLD " +
        "PARAMEDIC WERE KILLED. 58 WERE INJURED. IT WAS CHILDREN'S DAY IN UKRAINE.",
      art: drawKryvyiArt,
    },
    {
      kicker: "BALTIC SEA",
      headline: "RUSSIAN SHIP ABLAZE IN THE BALTIC",
      body:
        "DRONES HIT THE RUSSIAN CARGO SHIP SPARTA II IN THE GULF OF FINLAND ON " +
        "SATURDAY MORNING. THE SHIP CAUGHT FIRE AND DRIFTED INTO FINNISH WATERS. " +
        "ITS 16 CREW WERE EVACUATED. FINLAND SAYS UKRAINE WAS LIKELY BEHIND IT.",
      art: drawSpartaArt,
    },
  ];
  const colW = 312;
  const gap = 8;
  const gx = 40;
  const rowY = [528, 764];
  const rowH = 232;
  for (let i = 0; i < 3; i++) {
    drawStoryBox(c, stories[i], gx + i * (colW + gap), rowY[0], colW, rowH);
  }
  drawStoryBox(c, stories[3], gx, rowY[1], colW, rowH);

  // Wall Street wide box, bottom right.
  const wx = gx + colW + gap;
  const ww = colW * 2 + gap;
  const wy = rowY[1];
  c.rect(wx, wy, ww, 2, INK);
  let cy = wy + 12;
  drawText(c, "MARKETS", wx + 12, cy, 1, RED);
  cy += 12;
  drawText(c, "WALL STREET AI ROUT", wx + 12, cy, 3, INK);
  cy += 28;
  drawMarketArt(c, wx + 12, cy, ww - 24, 56);
  cy += 56 + 10;
  const marketBody =
    "S&P 500 -3.7% TO 6,910, IN CORRECTION. NASDAQ -5.28%, ITS WORST WEEK SINCE MARCH 2020. " +
    "DOW -1.9%, ALSO IN CORRECTION. NVIDIA -14% AFTER ITS CHIEF EXECUTIVE WAS OUSTED. " +
    "ANTHROPIC -9% ON ITS SECOND DAY AS A PUBLIC COMPANY. NASDAQ STOCKS LOST OVER $4 TRILLION IN A WEEK.";
  for (const ln of wrap(marketBody, ww - 24, 2)) {
    drawText(c, ln, wx + 12, cy, 2, INK);
    cy += 20;
  }

  return c;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output/entry.png";
  const dir = outDir.endsWith(".png") ? outDir.slice(0, outDir.lastIndexOf("/")) : outDir;
  const file = outDir.endsWith(".png") ? outDir : join(outDir, "entry.png");
  mkdirSync(dir === "" ? "." : dir, { recursive: true });
  const png = encodePNG(drawPage());
  writeFileSync(file, png);
}

main();
