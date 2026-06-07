export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const result: string[] = [];
  for (const para of text.split('\n')) {
    if (!para) { result.push(''); continue; }
    let line = '';
    for (const ch of para) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line) {
        result.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) result.push(line);
  }
  return result;
}

type SaveOptions = {
  mime?:    'image/jpeg' | 'image/png';
  quality?: number; // 0.0〜1.0（jpeg のみ有効）
};

// canvas の内容を画像として保存
// iOS Safari: Web Share API → シェアシートの「写真に保存」
// iOS Chrome: blob URL → 新しいタブで開き長押し保存
// Android・PC: <a download>
export async function saveImage(
  canvas: HTMLCanvasElement,
  filename = 'image.jpg',
  { mime = 'image/jpeg', quality = 0.85 }: SaveOptions = {}
) {
  const ua       = navigator.userAgent;
  const isIOS    = /iPad|iPhone|iPod/.test(ua);
  const isChrome = /CriOS/.test(ua);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), mime, quality)
  );

  if (isIOS && isChrome) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }

  if (isIOS) {
    const file = new File([blob], filename, { type: mime });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.download = filename;
  a.href     = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
