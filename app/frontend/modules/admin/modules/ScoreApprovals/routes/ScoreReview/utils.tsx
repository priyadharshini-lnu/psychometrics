import type { HighlightAnchor } from '../../core'
import styles from './ScoreReview.less'

export type HighlightColor = 'positive' | 'negative' | 'mixed'

export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const getHighlightClass = (color: HighlightColor): string => {
  if (color === 'positive') return styles.highlightPositive
  if (color === 'negative') return styles.highlightNegative
  return styles.highlightMixed
}

export const renderHighlightedText = (
  text: string,
  anchors: HighlightAnchor[],
): React.ReactNode[] | string => {
  if (!anchors || anchors.length === 0) return text

  const sorted = anchors
    .filter(anchor => anchor.sentiment !== 'neutral')
    .sort((a, b) => a.startChar - b.startChar)
  if (sorted.length === 0) return text

  const parts: React.ReactNode[] = []
  let lastIdx = 0

  sorted.forEach((anchor) => {
    const start = Math.max(anchor.startChar, lastIdx)
    const end = Math.min(anchor.endChar, text.length)

    if (start >= end) return

    if (start > lastIdx) {
      parts.push(text.slice(lastIdx, start))
    }

    const sentiment = anchor.sentiment as HighlightColor
    parts.push(
      <span key={`${start}-${end}`} className={getHighlightClass(sentiment)}>
        {text.slice(start, end)}
      </span>,
    )
    lastIdx = end
  })

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }

  return parts
}
