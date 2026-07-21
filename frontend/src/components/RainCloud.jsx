import { useEffect, useRef } from "react";

const COLORS = ["#29b6d8", "#1ecfcf", "#0ef0c0", "#29b6d8", "#1ecfcf", "#ffffff"];
const randColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default function RainCloud() {
  const rainRef = useRef(null);
  const lightningRef = useRef(null);
  const rainStarted = useRef(false);
  const lightningStarted = useRef(false);

  useEffect(() => {
    if (rainStarted.current) return;
    rainStarted.current = true;

    const canvas = rainRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const drops = [];
    const splashes = [];
    let frame = 0;
    let animId;

    const spawnDrop = () => {
      drops.push({
        x: 38 + Math.random() * 144,
        y: 0,
        len: 8 + Math.random() * 28,
        speed: 3 + Math.random() * 5,
        color: randColor(),
        alpha: 0.5 + Math.random() * 0.5,
      });
    };

    const spawnSplash = (x, y, color) => {
      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        const angle = Math.PI + Math.random() * Math.PI;
        const speed = 1 + Math.random() * 3;
        splashes.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          len: 3 + Math.random() * 8,
          color, alpha: 0.8, life: 1,
        });
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      if (frame % 2 === 0) spawnDrop();

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.speed;
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        ctx.restore();
        if (d.y > H - 20) {
          spawnSplash(d.x, H - 20, d.color);
          drops.splice(i, 1);
        }
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.15;
        s.life -= 0.045; s.alpha = s.life * 0.8;
        if (s.life <= 0) { splashes.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.vx * s.len * 0.4, s.y + s.vy * s.len * 0.4);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = "#29b6d8";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const progress = ((frame * 0.8 + i * 80) % 200) / 200;
        const w = 20 + progress * 180;
        ctx.globalAlpha = 0.15 * (1 - progress);
        ctx.beginPath();
        ctx.moveTo(W / 2 - w / 2, H - 10);
        ctx.lineTo(W / 2 + w / 2, H - 10);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (lightningStarted.current) return;
    lightningStarted.current = true;

    const canvas = lightningRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let animId;
    let flashAlpha = 0;
    let nextFlash = 60 + Math.random() * 120;
    let frame = 0;

    const boltPoints = [
      { x: W / 2 + 8, y: 10 },
      { x: W / 2 - 4, y: 30 },
      { x: W / 2 + 10, y: 34 },
      { x: W / 2 - 14, y: 62 },
    ];

    const drawBolt = (alpha) => {
      ctx.clearRect(0, 0, W, H);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha * 0.25;
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, 55, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha * 0.35;
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      boltPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fff8b0";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      boltPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      frame++;
      if (frame >= nextFlash) {
        const e = frame - nextFlash;
        if (e < 4)       flashAlpha = e / 4;
        else if (e < 8)  flashAlpha = 1 - (e - 4) / 4;
        else if (e < 14) flashAlpha = e < 11 ? 0.6 : 0;
        else { flashAlpha = 0; nextFlash = frame + 80 + Math.random() * 160; }
      } else { flashAlpha = 0; }
      drawBolt(flashAlpha);
      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ width: 220, height: 360, position: "relative", background: "#13131a", borderRadius: 16, margin: "0 auto" }}>
      <svg
        width="220"
        height="110"
        viewBox="0 0 220 110"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", top: 40, left: 0, display: "block" }}
      >
        <ellipse cx="110" cy="82" rx="84" ry="30" fill="#3a3a45" />
        <ellipse cx="76"  cy="74" rx="44" ry="40" fill="#3a3a45" />
        <ellipse cx="140" cy="70" rx="48" ry="44" fill="#3a3a45" />
        <ellipse cx="108" cy="60" rx="44" ry="42" fill="#3d3d4a" />
        <ellipse cx="76"  cy="74" rx="42" ry="38" fill="#3d3d4a" />
        <ellipse cx="140" cy="68" rx="46" ry="42" fill="#3d3d4a" />
        <ellipse cx="110" cy="82" rx="82" ry="28" fill="#3d3d4a" />
      </svg>
      <canvas
        ref={lightningRef}
        width={220}
        height={110}
        style={{ position: "absolute", top: 40, left: 0, pointerEvents: "none" }}
      />
      <canvas
        ref={rainRef}
        width={220}
        height={210}
        style={{ position: "absolute", top: 150, left: 0, pointerEvents: "none" }}
      />
    </div>
  );
}