/* MOTORA — shared utilities */

export const fmtPrice = (n) => {
  if (n == null) return "PRICE ON REQUEST";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  return "$" + Number(n).toLocaleString("en-US");
};

export const fmtCount = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n));

export const parseNum = (s) => {
  const m = String(s ?? "").replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : NaN;
};

export const unitCode = (v) => "UNIT-" + String(Math.abs(hash(v.id)) % 900 + 100);

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
