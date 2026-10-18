import * as THREE from 'three';

/**
 * Procedural Circular HUD Telemetry Texture
 * Generates razor-sharp sci-fi angle ticks, degree markings, and data arcs
 */
export function createHudDialTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Transparent dark base
  ctx.clearRect(0, 0, size, size);

  // Outer segmented ring
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  // Fine angular degree ticks (360 degrees)
  for (let i = 0; i < 360; i += 3) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 30 === 0;
    const isMedium = i % 15 === 0;

    const innerR = size * (isMajor ? 0.38 : isMedium ? 0.40 : 0.42);
    const outerR = size * 0.44;

    ctx.strokeStyle = isMajor
      ? '#00ffc8'
      : isMedium
      ? 'rgba(0, 229, 255, 0.7)'
      : 'rgba(0, 200, 180, 0.3)';
    ctx.lineWidth = isMajor ? 3 : isMedium ? 2 : 1;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    ctx.stroke();

    // Major numbers
    if (isMajor) {
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * (innerR - 22), cy + Math.sin(angle) * (innerR - 22));
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = '#7fd4c1';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}°`, 0, 0);
      ctx.restore();
    }
  }

  // Inner data arcs
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.8)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.32, 0.2, Math.PI * 0.7);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.32, Math.PI * 0.9, Math.PI * 1.6);
  ctx.stroke();

  // Tech crosshair reticle
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.46, cy);
  ctx.lineTo(cx + size * 0.46, cy);
  ctx.moveTo(cx, cy - size * 0.46);
  ctx.lineTo(cx, cy + size * 0.46);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Contact Shadow Disc Texture
 */
export function createContactShadowTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const rad = size / 2;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
  grad.addColorStop(0, 'rgba(0, 255, 200, 0.35)');
  grad.addColorStop(0.25, 'rgba(0, 150, 140, 0.2)');
  grad.addColorStop(0.65, 'rgba(0, 20, 30, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
