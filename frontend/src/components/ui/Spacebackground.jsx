import { useEffect, useRef } from "react";


export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const stars = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 260; i++) {
      stars.push({
        x:     Math.random(),
        y:     Math.random(),
        r:     Math.random() * 1.05 + 0.1,
        base:  Math.random() * 0.5 + 0.08,
        speed: Math.random() * 0.006 + 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const a = s.base + Math.sin(t * s.speed + s.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* ── Base background ── */}
      <div style={{
        position: "fixed", inset: 0,
        background: "#020408",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* ── Animated star canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </>
  );
}