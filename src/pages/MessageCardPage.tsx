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
  if (params.title) {
    ctx.fillText(params.title, cx, afterImageY, textMaxW);
  }

  // メッセージ
  ctx.font      = `300 ${msgSize}px ${params.fontFamily}`;
  ctx.fillStyle = '#7a6070';
  if (params.message) {
    const lineH = msgSize * 2.0;
    const msgY  = afterImageY + titleSize + 10;
    const lines = wrapText(ctx, params.message, textMaxW);
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
        <div
          className="w-full relative overflow-hidden"
          style={{
            maxWidth:     '640px',
            aspectRatio:  '16 / 9',
            background:   currentGrad.style,
            fontFamily,
            borderRadius: '28px',
            boxShadow:    '0 8px 40px rgba(200,150,180,0.18), 0 2px 8px rgba(180,130,160,0.10)',
          }}
        >
          {/* 装飾内枠 */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset:        '18px',
              border:       `3px dashed ${currentGrad.frame}`,
              borderRadius: '10px',
            }}
          />

          {/* 日付表示 */}
          {showDate ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDate(false); }}
              className="absolute z-10 cursor-pointer hover:opacity-60 transition-opacity"
              style={{
                top: '11%',
                left: '8%',
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                color: '#7a6070',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily,
              }}
              title="クリックして非表示"
            >
              {dateStr}
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDate(true); }}
              className="absolute z-10 cursor-pointer hover:opacity-80 transition-opacity border border-dashed border-[#b8a0b0] rounded px-1.5 py-0.5 text-[10px] text-[#b8a0b0]"
              style={{
                top: '11%',
                left: '8%',
                background: 'rgba(255,255,255,0.4)',
                fontFamily,
              }}
              title="クリックして日付を表示"
            >
              + 日付
            </button>
          )}

          <div className="absolute inset-0 flex flex-col items-center p-[7%]">
            <button
              onClick={(e) => { e.stopPropagation(); setStampIndex((stampIndex + 1) % STAMPS.length); }}
              className="overflow-hidden shrink-0 cursor-pointer"
              style={{ width: 'clamp(56px, 16%, 130px)', height: 'clamp(56px, 16%, 130px)' }}
            >
              <img src={STAMPS[stampIndex]} alt="" className="w-full h-full object-cover" />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="タイトル"
              className="bg-transparent focus:outline-none w-full text-center mt-2 tracking-widest placeholder:text-[#b8a0b0]"
              style={{ fontFamily, fontSize: 'clamp(1.1rem, 3.2vw, 1.5rem)', color: '#6b5060' }}
            />
            <div className="flex-1 flex items-center w-full">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="メッセージ"
                className="bg-transparent focus:outline-none resize-none w-full text-center leading-loose placeholder:text-[#b8a0b0]"
                style={{ fontFamily, fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: '#7a6070' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
