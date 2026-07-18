// ─── Slug ──────────────────────────────────────────────

/**
 * Converts a string into a URL-friendly slug.
 * Example: "Chó Poodle & Chó Corgi" → "cho-poodle-va-cho-corgi"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D')) // Handle Vietnamese đ
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (keep spaces and hyphens)
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

// ─── Price Formatting ──────────────────────────────────

/**
 * Formats a number or decimal string as VND currency.
 * Example: 150000 → "150.000₫"
 */
export function formatPrice(
  price: number | string | null | undefined | { toString(): string },
): string {
  if (price == null) return '0₫'
  const num = typeof price === 'object' ? parseFloat(price.toString()) : typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '0₫'
  return num.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}

/**
 * Formats a number or decimal string as a plain number with thousand separators.
 * Example: 150000 → "150.000"
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num == null) return '0'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  return n.toLocaleString('vi-VN')
}

// ─── Order Code ────────────────────────────────────────

let orderCounter = 0

/**
 * Generates a unique order code.
 * Format: DH-YYYYMMDD-XXXXX (DH = Đơn Hàng)
 * Counter resets on process restart (acceptable for most cases).
 */
export function generateOrderCode(): string {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  orderCounter = (orderCounter + 1) % 100000
  const seq = String(orderCounter).padStart(5, '0')

  return `DH-${y}${m}${d}-${seq}`
}

// ─── Date Formatting ───────────────────────────────────

/**
 * Formats a Date or ISO string to a human-readable Vietnamese format.
 * Example: 2026-07-18T10:30:00Z → "18/07/2026 10:30"
 */
export function formatDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Formats a Date or ISO string to a short date (no time).
 * Example: "18/07/2026"
 */
export function formatShortDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}
