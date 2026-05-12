// Parses WGS 84 coordinates stored as [N/S/E/W] + integer(decimal degrees × 100000)
// e.g. N5150111 = 5150111 / 100000 = 51.50111° = 51°30'3.996"N
export function toDMS(raw: string | number | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const match = s.match(/^([NSEWnsew])(\d+)$/);
  if (match) {
    const dir = match[1].toUpperCase();
    const decimal = parseInt(match[2], 10) / 100000;
    const deg = Math.floor(decimal);
    const minFloat = (decimal - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(3);
    return `${deg}°${min}'${sec}"${dir}`;
  }
  return s;
}
