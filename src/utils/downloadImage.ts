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

// canvas の内容を PNG として保存
// iOS Safari: Web Share API → 「写真に保存」が出る
// iOS Chrome(CriOS)・Android・PC: <a download> でファイル保存
export async function savePng(canvas: HTMLCanvasElement, filename = 'image.png') {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
  );

  const ua       = navigator.userAgent;
  const isIOS    = /iPad|iPhone|iPod/.test(ua);
  const isChrome = /CriOS/.test(ua);

  if (isIOS && isChrome) {
    // Chrome iOS はネイティブシェアが使えないので新しいタブで開く
    // → 画像を長押し →「写真に追加」で保存
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }

  if (isIOS) {
    const file = new File([blob], filename, { type: 'image/png' });
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
