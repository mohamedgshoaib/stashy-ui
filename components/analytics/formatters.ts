export function formatAnalyticsCurrency(locale: string, value: number) {
  return `${new Intl.NumberFormat(locale).format(value)} EGP`
}

export function formatAnalyticsSignedCurrency(locale: string, value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${new Intl.NumberFormat(locale).format(Math.abs(value))} EGP`
}

export function formatAnalyticsMonthLabel(locale: string, isoDate: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`))
}

export function formatAnalyticsMonthShort(locale: string, isoDate: string) {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(`${isoDate}T00:00:00`))
}

export function formatAnalyticsDayLong(locale: string, isoDate: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`))
}
