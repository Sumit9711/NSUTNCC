export default function BackgroundOrbs() {
  return (
    <>
      <div
        className="fixed rounded-full pointer-events-none z-0 animate-orb-float"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, #3d8b3d, transparent 70%)',
          top: -200, left: -200,
          filter: 'blur(90px)',
          opacity: 0.18,
        }}
      />
      <div
        className="fixed rounded-full pointer-events-none z-0 animate-orb-float-reverse"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, #c9a84c, transparent 70%)',
          bottom: 100, right: -100,
          filter: 'blur(90px)',
          opacity: 0.18,
        }}
      />
      <div
        className="fixed rounded-full pointer-events-none z-0 animate-orb-float-slow"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, #2a5c2a, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          filter: 'blur(90px)',
          opacity: 0.18,
        }}
      />
    </>
  )
}
