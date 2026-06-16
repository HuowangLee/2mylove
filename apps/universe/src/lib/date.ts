export function toISODateString(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function daysSince(isoDate: string, now = new Date()) {
  const start = new Date(`${isoDate}T00:00:00`)
  const end = new Date(now)
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function dayNumberFrom(startIsoDate: string, isoDate: string) {
  const start = new Date(`${startIsoDate}T00:00:00`)
  const end = new Date(`${isoDate}T00:00:00`)
  const ms = end.getTime() - start.getTime()
  // start day is 1
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1
}


