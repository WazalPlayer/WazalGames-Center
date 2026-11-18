export default function Avatar({ src, name, size = 36 }) {
  const style = { width: size, height: size, minWidth: size };
  if (src) {
    return <img src={src} alt={name || ''} style={style} />;
  }
  const letter = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="avatar-fallback" style={{ ...style, fontSize: size * 0.4 }}>
      {letter}
    </div>
  );
}
