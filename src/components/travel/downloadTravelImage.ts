import { loadImage, roundedRect, wrapText, saveImage } from '../../utils/downloadImage';
import { todayString } from '../../utils/date';
import { DAY_COLORS, formatDate, type DayPlan, type TravelPlan } from './itinerary';

const WIDTH = 1080;
const MARGIN = 56;
const CONTENT_W = WIDTH - MARGIN * 2;

const CARD_PAD_X = 44;
const CARD_PAD_Y = 36;
const CARD_INNER_W = CONTENT_W - CARD_PAD_X * 2;
const CARD_RADIUS = 48;
const CARD_BORDER_W = 3;

const FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif';

const TITLE_SIZE = 56;
const TITLE_LINE_H = 76;
const DATE_RANGE_SIZE = 30;
const TITLE_DATE_GAP = 20;

const SECTION_HEADER_ICON = 52;
const SECTION_HEADER_SIZE = 30;
const SECTION_HEADER_GAP = 24;

const BADGE_SIZE = 60;
const DAY_DATE_SIZE = 34;
const DAY_HEADER_GAP = 28;
const DAY_GAP = 32;

const TIME_W = 110;
const TIME_SIZE = 26;
const PLACE_SIZE = 32;
const PLACE_LINE_H = 46;
const ITEM_MEMO_SIZE = 26;
const ITEM_MEMO_LINE_H = 40;
const ITEM_GAP = 28;

const TEXT_SIZE = 30;
const TEXT_LINE_H = 48;
const BULLET_R = 6;
const BULLET_INDENT = 28;
const PACKING_GAP = 12;

// ステッカーがセクション見出しの文字にかぶりすぎないよう、セクション間を広めに取る
const SECTION_GAP = 120;
const STICKER_SIZE = 140;

const ICON_SRC = '/assets/travel_anpan.png';
const STICKERS = [
  { src: '/assets/takoyaki_anpan.png', side: 'right', deg: 12 },
  { src: '/assets/onsen_anpan.png', side: 'left', deg: -10 },
  { src: '/assets/montain_anpan.png', side: 'right', deg: -8 },
] as const;

type Block = {
  height: number;
  draw: (ctx: CanvasRenderingContext2D, y: number) => void;
};

const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

const loadOptional = (src: string) => loadImage(src).catch(() => null);

function stack(blocks: Block[], gap: number): Block {
  const height =
    blocks.reduce((sum, b) => sum + b.height, 0) + gap * Math.max(blocks.length - 1, 0);
  return {
    height,
    draw: (ctx, y) => {
      let cy = y;
      for (const b of blocks) {
        b.draw(ctx, cy);
        cy += b.height + gap;
      }
    },
  };
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineH: number,
  size: number
) {
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH + (lineH - size) / 2));
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  y: number,
  height: number,
  fill: string | CanvasGradient,
  border: string
) {
  roundedRect(ctx, MARGIN, y, CONTENT_W, height, CARD_RADIUS);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = CARD_BORDER_W;
  ctx.strokeStyle = border;
  ctx.stroke();
}

function drawBackground(ctx: CanvasRenderingContext2D, height: number) {
  const bg = ctx.createLinearGradient(0, 0, WIDTH, height);
  bg.addColorStop(0, '#fff0f5');
  bg.addColorStop(0.45, '#fff8f0');
  bg.addColorStop(1, '#f0f5ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, height);
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  sticker: (typeof STICKERS)[number],
  centerY: number
) {
  const scale = STICKER_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const centerX =
    sticker.side === 'right'
      ? WIDTH - MARGIN - 16 - STICKER_SIZE / 2
      : MARGIN + 16 + STICKER_SIZE / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((sticker.deg * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function titleBlock(ctx: CanvasRenderingContext2D, plan: TravelPlan): Block {
  ctx.font = font(700, TITLE_SIZE);
  const lines = wrapText(ctx, plan.title.trim() || '旅のしおり', CARD_INNER_W);
  const titleH = lines.length * TITLE_LINE_H;
  const height = CARD_PAD_Y * 2 + titleH + TITLE_DATE_GAP + DATE_RANGE_SIZE;

  return {
    height,
    draw: (ctx, y) => {
      const bg = ctx.createLinearGradient(MARGIN, y, MARGIN + CONTENT_W, y + height);
      bg.addColorStop(0, '#fff0f5');
      bg.addColorStop(1, '#fff8f0');
      drawCard(ctx, y, height, bg, '#f9c0d0');

      const x = MARGIN + CARD_PAD_X;
      ctx.fillStyle = '#1f2937';
      ctx.font = font(700, TITLE_SIZE);
      drawLines(ctx, lines, x, y + CARD_PAD_Y, TITLE_LINE_H, TITLE_SIZE);

      ctx.fillStyle = '#4b5563';
      ctx.font = font(500, DATE_RANGE_SIZE);
      ctx.fillText(
        `${formatDate(plan.startDate)} 〜 ${formatDate(plan.endDate)}`,
        x,
        y + CARD_PAD_Y + titleH + TITLE_DATE_GAP
      );
    },
  };
}

function sectionHeaderBlock(label: string, icon: HTMLImageElement | null): Block {
  return {
    height: SECTION_HEADER_ICON,
    draw: (ctx, y) => {
      const x = MARGIN + 8;
      if (icon) ctx.drawImage(icon, x, y, SECTION_HEADER_ICON, SECTION_HEADER_ICON);
      ctx.fillStyle = '#6b7280';
      ctx.font = font(700, SECTION_HEADER_SIZE);
      ctx.fillText(
        label,
        x + SECTION_HEADER_ICON + 16,
        y + (SECTION_HEADER_ICON - SECTION_HEADER_SIZE) / 2
      );
    },
  };
}

function section(header: Block, body: Block[], bodyGap: number): Block {
  return body.length === 0 ? header : stack([header, stack(body, bodyGap)], SECTION_HEADER_GAP);
}

function dayBlock(ctx: CanvasRenderingContext2D, day: DayPlan, dayNumber: number): Block {
  const color = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
  const items = day.items.filter((i) => i.time || i.place.trim() || i.memo.trim());
  // 1日の中で時刻の列をそろえるため、時刻のある項目が1つでもあれば全行で幅を確保する
  const textOffset = items.some((i) => i.time) ? TIME_W : 0;
  const textW = CARD_INNER_W - textOffset;

  const rows = items.map((item) => {
    ctx.font = font(700, PLACE_SIZE);
    const placeLines = item.place.trim() ? wrapText(ctx, item.place.trim(), textW) : [];
    ctx.font = font(400, ITEM_MEMO_SIZE);
    const memoLines = item.memo.trim() ? wrapText(ctx, item.memo.trim(), textW) : [];
    const placeH = placeLines.length * PLACE_LINE_H;
    const height = Math.max(placeH + memoLines.length * ITEM_MEMO_LINE_H, PLACE_LINE_H);
    return { time: item.time, placeLines, memoLines, placeH, height };
  });

  const itemsH =
    rows.reduce((sum, r) => sum + r.height, 0) + ITEM_GAP * Math.max(rows.length - 1, 0);
  const height = CARD_PAD_Y * 2 + BADGE_SIZE + (rows.length ? DAY_HEADER_GAP + itemsH : 0);

  return {
    height,
    draw: (ctx, y) => {
      drawCard(ctx, y, height, color.bg, color.border);

      const x = MARGIN + CARD_PAD_X;
      const headerY = y + CARD_PAD_Y;

      ctx.beginPath();
      ctx.arc(x + BADGE_SIZE / 2, headerY + BADGE_SIZE / 2, BADGE_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = color.badge;
      ctx.fill();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = font(700, 26);
      ctx.fillText(String(dayNumber), x + BADGE_SIZE / 2, headerY + BADGE_SIZE / 2);
      ctx.restore();

      ctx.fillStyle = color.text;
      ctx.font = font(700, DAY_DATE_SIZE);
      ctx.fillText(
        formatDate(day.date) || `Day ${dayNumber}`,
        x + BADGE_SIZE + 24,
        headerY + (BADGE_SIZE - DAY_DATE_SIZE) / 2
      );

      let rowY = headerY + BADGE_SIZE + DAY_HEADER_GAP;
      for (const row of rows) {
        if (row.time) {
          ctx.fillStyle = '#9ca3af';
          ctx.font = font(500, TIME_SIZE);
          ctx.fillText(row.time, x, rowY + (PLACE_LINE_H - TIME_SIZE) / 2);
        }
        ctx.fillStyle = '#1f2937';
        ctx.font = font(700, PLACE_SIZE);
        drawLines(ctx, row.placeLines, x + textOffset, rowY, PLACE_LINE_H, PLACE_SIZE);

        ctx.fillStyle = '#6b7280';
        ctx.font = font(400, ITEM_MEMO_SIZE);
        drawLines(
          ctx,
          row.memoLines,
          x + textOffset,
          rowY + row.placeH,
          ITEM_MEMO_LINE_H,
          ITEM_MEMO_SIZE
        );

        rowY += row.height + ITEM_GAP;
      }
    },
  };
}

function packingBlock(ctx: CanvasRenderingContext2D, texts: string[]): Block {
  ctx.font = font(400, TEXT_SIZE);
  const items = texts.map((text) => wrapText(ctx, text, CARD_INNER_W - BULLET_INDENT));
  const height =
    CARD_PAD_Y * 2 +
    items.reduce((sum, lines) => sum + lines.length * TEXT_LINE_H, 0) +
    PACKING_GAP * (items.length - 1);

  return {
    height,
    draw: (ctx, y) => {
      drawCard(ctx, y, height, '#fdf4ff', '#e9d5ff');

      const x = MARGIN + CARD_PAD_X;
      let itemY = y + CARD_PAD_Y;
      ctx.font = font(400, TEXT_SIZE);
      for (const lines of items) {
        ctx.beginPath();
        ctx.arc(x + BULLET_R, itemY + TEXT_LINE_H / 2, BULLET_R, 0, Math.PI * 2);
        ctx.fillStyle = '#c084fc';
        ctx.fill();

        ctx.fillStyle = '#374151';
        drawLines(ctx, lines, x + BULLET_INDENT, itemY, TEXT_LINE_H, TEXT_SIZE);
        itemY += lines.length * TEXT_LINE_H + PACKING_GAP;
      }
    },
  };
}

function memoBlock(ctx: CanvasRenderingContext2D, memo: string): Block {
  ctx.font = font(400, TEXT_SIZE);
  const lines = wrapText(ctx, memo, CARD_INNER_W);
  const height = CARD_PAD_Y * 2 + lines.length * TEXT_LINE_H;

  return {
    height,
    draw: (ctx, y) => {
      drawCard(ctx, y, height, '#fefce8', '#fde68a');
      ctx.fillStyle = '#374151';
      ctx.font = font(400, TEXT_SIZE);
      drawLines(ctx, lines, MARGIN + CARD_PAD_X, y + CARD_PAD_Y, TEXT_LINE_H, TEXT_SIZE);
    },
  };
}

export async function renderTravelCanvas(plan: TravelPlan): Promise<HTMLCanvasElement> {
  const [icon, ...stickers] = await Promise.all(
    [ICON_SRC, ...STICKERS.map((s) => s.src)].map(loadOptional)
  );

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  const ctx = canvas.getContext('2d')!;

  // 1パス目：折り返しを計算して全体の高さを求める
  const sections: Block[] = [
    titleBlock(ctx, plan),
    section(
      sectionHeaderBlock('旅程', icon),
      plan.days.map((day, i) => dayBlock(ctx, day, i + 1)),
      DAY_GAP
    ),
  ];

  const packingTexts = plan.packing.map((p) => p.text.trim()).filter(Boolean);
  if (packingTexts.length) {
    sections.push(
      section(sectionHeaderBlock('持ち物', icon), [packingBlock(ctx, packingTexts)], 0)
    );
  }

  const memo = plan.memo.trim();
  if (memo) {
    sections.push(section(sectionHeaderBlock('メモ', icon), [memoBlock(ctx, memo)], 0));
  }

  const body = stack(sections, SECTION_GAP);

  // 2パス目：描画（サイズ変更でコンテキストはリセットされる）
  canvas.height = body.height + MARGIN * 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawBackground(ctx, canvas.height);
  body.draw(ctx, MARGIN);

  let boundaryY = MARGIN;
  sections.slice(0, -1).forEach((s, i) => {
    boundaryY += s.height;
    const img = stickers[i];
    if (img) drawSticker(ctx, img, STICKERS[i], boundaryY + SECTION_GAP / 2);
    boundaryY += SECTION_GAP;
  });

  return canvas;
}

export async function downloadTravelImage(plan: TravelPlan) {
  const canvas = await renderTravelCanvas(plan);
  await saveImage(canvas, `travel-${plan.startDate || todayString()}.png`, { mime: 'image/png' });
}
