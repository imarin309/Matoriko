import { loadImage, roundedRect, wrapText, saveImage } from '../../utils/downloadImage';
import { todayString } from '../../utils/date';
import { STEPS, type FormState } from './steps';

const WIDTH = 1080;
const MARGIN = 48; // カードの外側の余白
const PAD = 56; // カードの内側の余白
const CONTENT_W = WIDTH - (MARGIN + PAD) * 2;

const FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif';

const DATE_SIZE = 26;
const LABEL_SIZE = 26;
const BODY_SIZE = 30;
const BODY_LINE_H = 48;
const FOOTER_SIZE = 22;

const HEADER_H = 88;
const HEADER_GAP = 44;
const LABEL_GAP = 18; // ラベルと本文の間
const SECTION_GAP = 40;
const BAR_H = 22;
const FOOTER_GAP = 44;

const EMPTY = '（未入力）';

type Section = {
  label: string;
  accent: string;
  /** 本文（強度ステップは null） */
  lines: string[] | null;
  intensity: number | null;
  empty: boolean;
};

const bodyFont = `400 ${BODY_SIZE}px ${FONT}`;
const labelFont = `700 ${LABEL_SIZE}px ${FONT}`;

function buildSections(form: FormState, measure: CanvasRenderingContext2D): Section[] {
  measure.font = bodyFont;
  return STEPS.map((s) => {
    if (s.key === 'intensity') {
      return {
        label: s.hint,
        accent: s.accent,
        lines: null,
        intensity: form.intensity,
        empty: false,
      };
    }
    const value = (form[s.key] as string).trim();
    return {
      label: s.hint,
      accent: s.accent,
      lines: wrapText(measure, value || EMPTY, CONTENT_W),
      intensity: null,
      empty: !value,
    };
  });
}

const sectionHeight = (s: Section) =>
  LABEL_SIZE +
  LABEL_GAP +
  (s.intensity !== null ? BAR_H : (s.lines?.length ?? 1) * BODY_LINE_H);

/** 背景（画面のオーロラ背景を模したやわらかいグラデーション） */
function drawBackground(ctx: CanvasRenderingContext2D, height: number) {
  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, '#f8fafc');
  base.addColorStop(0.45, '#ffffff');
  base.addColorStop(1, '#f7f7fb');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, height);

  const wash = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WIDTH, height);
  };
  wash(80, 40, 560, 'rgba(14,165,233,0.16)');
  wash(WIDTH - 60, height - 80, 560, 'rgba(16,185,129,0.16)');
  wash(WIDTH + 40, height * 0.35, 420, 'rgba(139,92,246,0.10)');
}

/** 感情の強度バー */
function drawIntensityBar(ctx: CanvasRenderingContext2D, x: number, y: number, value: number) {
  ctx.save();
  roundedRect(ctx, x, y, CONTENT_W, BAR_H, BAR_H / 2);
  ctx.fillStyle = '#eceff3';
  ctx.fill();

  const filled = Math.max((CONTENT_W * value) / 100, BAR_H);
  roundedRect(ctx, x, y, filled, BAR_H, BAR_H / 2);
  ctx.clip();
  const g = ctx.createLinearGradient(x, 0, x + CONTENT_W, 0);
  g.addColorStop(0, '#34d399');
  g.addColorStop(0.25, '#a3e635');
  g.addColorStop(0.5, '#fbbf24');
  g.addColorStop(0.75, '#fb923c');
  g.addColorStop(1, '#fb7185');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, CONTENT_W, BAR_H);
  ctx.restore();
}

/** 入力内容を1枚のカード画像として canvas に描画する */
export async function renderMemoCanvas(form: FormState): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  const ctx = canvas.getContext('2d')!;

  // 1パス目：折り返しを計算して全体の高さを求める
  const sections = buildSections(form, ctx);
  const bodyH = sections.reduce((acc, s) => acc + sectionHeight(s), 0) + SECTION_GAP * (sections.length - 1);
  const cardH = PAD * 2 + HEADER_H + HEADER_GAP + bodyH + FOOTER_GAP + FOOTER_SIZE;
  const height = Math.round(cardH + MARGIN * 2);

  // 2パス目：描画（サイズ変更でコンテキストはリセットされる）
  canvas.height = height;
  drawBackground(ctx, height);

  // カード
  ctx.save();
  ctx.shadowColor = 'rgba(15,23,42,0.10)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  roundedRect(ctx, MARGIN, MARGIN, WIDTH - MARGIN * 2, cardH, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.fill();
  ctx.restore();

  const x = MARGIN + PAD;
  let y = MARGIN + PAD;

  // ヘッダー：あんぱん＋日付
  const iconSize = 72;
  try {
    const anpan = await loadImage('/assets/anpan.png');
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + iconSize / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(anpan.naturalWidth, anpan.naturalHeight);
    ctx.drawImage(
      anpan,
      (anpan.naturalWidth - side) / 2,
      (anpan.naturalHeight - side) / 2,
      side,
      side,
      x,
      y,
      iconSize,
      iconSize
    );
    ctx.restore();
  } catch {
    /* 画像が読めなければアイコンなしで続行 */
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9ca3af';
  ctx.font = `400 ${DATE_SIZE}px ${FONT}`;
  ctx.fillText(todayString(), x + iconSize + 24, y + iconSize / 2);

  y += HEADER_H;
  ctx.fillStyle = '#eef1f5';
  ctx.fillRect(x, y, CONTENT_W, 2);
  y += HEADER_GAP;

  // 各ステップ
  for (const s of sections) {
    ctx.textBaseline = 'alphabetic';

    // ラベル（色つきドット付き）
    const dotY = y + LABEL_SIZE / 2 - 3;
    ctx.beginPath();
    ctx.arc(x + 5, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = s.accent;
    ctx.fill();

    ctx.font = labelFont;
    ctx.fillStyle = s.accent;
    ctx.fillText(s.label, x + 22, y + LABEL_SIZE - 4);

    if (s.intensity !== null) {
      ctx.textAlign = 'right';
      ctx.font = `700 ${LABEL_SIZE + 6}px ${FONT}`;
      ctx.fillStyle = '#1f2937';
      ctx.fillText(String(s.intensity), x + CONTENT_W, y + LABEL_SIZE - 2);
      ctx.textAlign = 'left';
    }

    y += LABEL_SIZE + LABEL_GAP;

    if (s.intensity !== null) {
      drawIntensityBar(ctx, x, y, s.intensity);
      y += BAR_H + SECTION_GAP;
      continue;
    }

    ctx.font = bodyFont;
    ctx.fillStyle = s.empty ? '#d1d5db' : '#1f2937';
    for (const line of s.lines ?? []) {
      ctx.fillText(line, x, y + BODY_SIZE);
      y += BODY_LINE_H;
    }
    y += SECTION_GAP;
  }

  y -= SECTION_GAP;

  // フッター
  ctx.font = `400 ${FOOTER_SIZE}px ${FONT}`;
  ctx.fillStyle = '#c3c9d2';
  ctx.textAlign = 'right';
  ctx.fillText('mind-memo', x + CONTENT_W, y + FOOTER_GAP + FOOTER_SIZE - 4);

  return canvas;
}

/** 入力内容を画像として保存する */
export async function downloadMemoImage(form: FormState) {
  const canvas = await renderMemoCanvas(form);
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  await saveImage(canvas, `mindMemo_${stamp}.png`, { mime: 'image/png' });
}
