export function normalize(text) {
  if (!text || typeof text !== 'string') return ''

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/(\d)\s*[.,]\s*(\d)/g, '$1.$2')
    .replace(/[^a-z0-9. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
