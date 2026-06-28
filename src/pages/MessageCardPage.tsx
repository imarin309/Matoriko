import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { AppHeader } from '../components/header';
import { loadImage, roundedRect, wrapText, saveImage } from '../utils/downloadImage';
import { todayString } from '../utils/date';

type FontStyle = 'apology' | 'pop';

const GRADIENTS = [
  { label: '白',        style: 'linear-gradient(160deg, #fefcfb 0%, #f5f2f0 100%)', from: '#fefcfb', to: '#f5f2f0', frame: 'rgba(180,160,150,0.60)' },
  { label: 'ピンク',    style: 'linear-gradient(160deg, #ffd6e7 0%, #ffe8f2 100%)', from: '#ffd6e7', to: '#ffe8f2', frame: 'rgba(220,100,140,0.60)' },
  { label: 'ブルー',    style: 'linear-gradient(160deg, #c8e4ff 0%, #dbeeff 100%)', from: '#c8e4ff', to: '#dbeeff', frame: 'rgba(80,140,210,0.60)'  },
  { label: 'イエロー',  style: 'linear-gradient(160deg, #ffedb0 0%, #fff6d6 100%)', from: '#ffedb0', to: '#fff6d6', frame: 'rgba(190,155,50,0.60)'  },
  { label: 'ラベンダー', style: 'linear-gradient(160deg, #dfc8ff 0%, #ede0ff 100%)', from: '#dfc8ff', to: '#ede0ff', frame: 'rgba(130,80,210,0.60)'  },
];

const STAMPS = [
  '/assets/anpan/funny.png',
  '/assets/anpan/anger.PNG',
  '/assets/anpan/sad.PNG',
];

const FONT_FAMILY: Record<FontStyle, string> = {
  apology: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
  pop:     '"Hiragino Maru Gothic ProN", "Rounded Mplus 1c", sans-serif',
};

async function downloadCard(params: {
  title: string;
  message: string;
  fontFamily: string;
  gradientIndex: number;
  stampSrc: string;
  showDate: boolean;
}) {
  const width  = 1280;
  const height = 720;

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const radius    = 28;
  const pad       = 90;
  const textMaxW  = width - pad * 2;
  const stampSize = 300;
  const titleSize = 38;
  const msgSize   = 28;
  const cx        = width / 2;

  // クリップ（角丸）
  roundedRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  // 背景グラデーション
  const grad = GRADIENTS[params.gradientIndex];
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, grad.from);
  g.addColorStop(1, grad.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // 装飾内枠
  const frameInset = 35;
  ctx.save();
  ctx.setLineDash([15, 15]);
  ctx.strokeStyle = grad.frame;
  ctx.lineWidth   = 6;
  roundedRect(ctx, frameInset, frameInset, width - frameInset * 2, height - frameInset * 2, 16);
  ctx.stroke();
  ctx.restore();

  // 日付
  if (params.showDate) {
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = '#7a6070';
    ctx.font         = `400 24px ${params.fontFamily}`;
    ctx.fillText(todayString(), 100, 80);
    ctx.restore();
  }

  // スタンプ画像
  try {
    const stampImg = await loadImage(params.stampSrc);
    const iw = stampImg.naturalWidth;
    const ih = stampImg.naturalHeight;
    const scale = Math.max(stampSize / iw, stampSize / ih);
    const sw    = stampSize / scale;
    const sh    = stampSize / scale;
    const sx    = (iw - sw) / 2;
    const sy    = (ih - sh) / 2;
    ctx.drawImage(stampImg, sx, sy, sw, sh, cx - stampSize / 2, pad, stampSize, stampSize);
  } catch { /* 画像読み込み失敗時はスキップ */ }

  const afterImageY = pad + stampSize + 10;

  // タイトル
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle    = '#6b5060';
  ctx.font         = `400 ${titleSize}px ${params.fontFamily}`;
  if ('letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = '0.1em';
  }
  if (params.title) {
    ctx.fillText(params.title, cx, afterImageY, textMaxW);
  }
  if ('letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = 'normal';
  }

  // メッセージ
  ctx.font      = `300 ${msgSize}px ${params.fontFamily}`;
  ctx.fillStyle = '#7a6070';
  if (params.message) {
    const lineH = msgSize * 2.0;
    const lines = wrapText(ctx, params.message, textMaxW);

    // メッセージ描画領域の高さ (217px) と上端Y座標 (454px)
    // 画面上の height: 16.9531cqw と top: 35.46875cqw に対応
    const areaH = 217;
    const areaTop = 454;
    const totalTextH = lines.length * lineH;
    const msgY = areaTop + Math.max(0, (areaH - totalTextH) / 2);

    lines.forEach((line, i) => ctx.fillText(line, cx, msgY + i * lineH, textMaxW));
  }

  await saveImage(canvas, 'message-card.jpg');
}

export function MessageCardPage() {
  const [title,         setTitle]         = useState('');
  const [message,       setMessage]       = useState('');
  const [font,          setFont]          = useState<FontStyle>('pop');
  const [gradientIndex, setGradientIndex] = useState(1);
  const [stampIndex,    setStampIndex]    = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDate,       setShowDate]      = useState(true);

  const fontFamily   = FONT_FAMILY[font];
  const currentGrad  = GRADIENTS[gradientIndex];
  const dateStr      = todayString();

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadCard({
        title, message, fontFamily,
        gradientIndex,
        stampSrc: STAMPS[stampIndex],
        showDate,
      });
    } catch (e) {
      console.error('download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(160deg, #fff0f5 0%, #f5eeff 50%, #eef5ff 100%)' }}
      />

      <div className="app-header">
        <AppHeader title="message" isSubPage />
        <div className="sub-toolbar">
          <div className="sub-toolbar-container flex-wrap gap-2">

            {/* 日付切り替え */}
            <button
              onClick={() => setShowDate(!showDate)}
              className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 ${showDate ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>日付</span>
            </button>

            {/* フォント切り替え */}
            <div className="flex gap-1">
              {(['pop', 'apology'] as FontStyle[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(f)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${font === f ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}
                  style={{ fontFamily: FONT_FAMILY[f] }}
                >
                  {f === 'apology' ? '明朝' : 'ポップ'}
                </button>
              ))}
            </div>

            {/* グラデーション切り替え */}
            <div className="flex gap-1.5 items-center">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGradientIndex(i)}
                  title={g.label}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${gradientIndex === i ? 'border-pink-400 scale-125' : 'border-gray-200 hover:border-pink-200'}`}
                  style={{ background: g.style }}
                />
              ))}
            </div>

            {/* 保存 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-sub-action"
            >
              <Download className="icon-sm" />
              <span className="text-xs">{isDownloading ? '処理中...' : '保存'}</span>
            </motion.button>

          </div>
        </div>
      </div>

      {/* カード表示エリア */}
      <div
        className="flex items-center justify-center px-4"
        style={{
          minHeight:    '100svh',
          paddingTop:    'max(11rem, calc(8rem + env(safe-area-inset-top)))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft:  '1rem',
          paddingRight: '1rem',
        }}
      >
        {/* コンテナクエリ用のラッパー */}
        <div
          className="w-full"
          style={{
            maxWidth:      '640px',
            containerType: 'inline-size',
          }}
        >
          <div
            className="w-full relative overflow-hidden"
            style={{
              aspectRatio:  '16 / 9',
              background:   currentGrad.style,
              fontFamily,
              borderRadius: '2.1875cqw',
              boxShadow:    '0 8px 40px rgba(200,150,180,0.18), 0 2px 8px rgba(180,130,160,0.10)',
            }}
          >
            {/* 装飾内枠 */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset:        '2.734375cqw',
                border:       `0.46875cqw dashed ${currentGrad.frame}`,
                borderRadius: '1.25cqw',
              }}
            />

            {/* 日付表示 */}
            {showDate ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDate(false); }}
                className="absolute z-10 cursor-pointer hover:opacity-60 transition-opacity"
                style={{
                  top:        '6.25cqw',
                  left:       '7.8125cqw',
                  fontSize:   '1.875cqw',
                  color:      '#7a6070',
                  background: 'none',
                  border:     'none',
                  padding:    0,
                  fontFamily,
                }}
                title="クリックして非表示"
              >
                {dateStr}
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDate(true); }}
                className="absolute z-10 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  top:          '6.25cqw',
                  left:         '7.8125cqw',
                  fontSize:     '1.25cqw',
                  color:        '#b8a0b0',
                  background:   'rgba(255,255,255,0.4)',
                  border:       '0.1cqw dashed #b8a0b0',
                  borderRadius: '0.4cqw',
                  padding:      '0.2cqw 0.6cqw',
                  fontFamily,
                }}
                title="クリックして日付を表示"
              >
                + 日付
              </button>
            )}

            {/* スタンプ画像 */}
            <button
              onClick={(e) => { e.stopPropagation(); setStampIndex((stampIndex + 1) % STAMPS.length); }}
              className="absolute overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                top:       '7.03125cqw',
                left:      '50%',
                transform: 'translateX(-50%)',
                width:     '23.4375cqw',
                height:    '23.4375cqw',
                border:    'none',
                background: 'none',
                padding:   0,
              }}
            >
              <img src={STAMPS[stampIndex]} alt="" className="w-full h-full object-cover" />
            </button>

            {/* タイトル */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="タイトル"
              className="absolute bg-transparent focus:outline-none text-center placeholder:text-[#b8a0b0]"
              style={{
                top:           '31.25cqw',
                left:          '50%',
                transform:     'translateX(-50%)',
                width:         '85.9375cqw',
                fontFamily,
                fontSize:      '2.96875cqw',
                color:         '#6b5060',
                border:        'none',
                padding:       0,
                lineHeight:    '1',
                letterSpacing: '0.1em',
              }}
            />

            {/* メッセージ */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="メッセージ"
              className="absolute bg-transparent focus:outline-none resize-none text-center placeholder:text-[#b8a0b0]"
              style={{
                top:        '35.46875cqw', // 36.5625cqw (msgY) - 0.5 * 2.1875cqw (fontSize) to align top of text linebox
                left:       '50%',
                transform:  'translateX(-50%)',
                width:      '85.9375cqw',
                height:     '16.9531cqw',
                fontFamily,
                fontSize:   '2.1875cqw',
                lineHeight: '2.0',
                color:      '#7a6070',
                border:     'none',
                padding:    0,
                wordBreak:  'break-all',
                alignContent: 'center', // 縦中央に配置
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
