export function formatDateDDMMYYYY(value?: Date | string | null) {
  if (!value) return ''

  if (typeof value === 'string') {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoDate) return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`

    const displayDate = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (displayDate) return value
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export function parseInvoiceDate(value?: string | null) {
  if (!value) return undefined

  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDate) return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))

  const displayDate = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (displayDate) return new Date(Number(displayDate[3]), Number(displayDate[2]) - 1, Number(displayDate[1]))

  return new Date(value)
}
