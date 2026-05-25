export function ini(ad) {
  return ad
    .split(' ')
    .map(k => k[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}