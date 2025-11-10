import { useEffect, useState } from 'react'
import { Rate, RateProps } from 'antd'
import cs from 'classnames'
import styles from './styles.less'

export const AccessibleRating = ({ ...props }: RateProps) => {
  const [rating, setRating] = useState(props.value ?? props.defaultValue ?? 0)

  useEffect(() => {
    setRating(props.value ?? 0)
  }, [props.value])

  const handleChange = (newRating:number) => {
    const updatedRating = newRating || 0
    setRating(updatedRating)
    props.onChange?.(updatedRating)
  }

  return (
    <section>
      <Rate
        {...props}
        value={rating}
        onChange={handleChange}
        keyboard
        aria-hidden="true"
        className={cs(styles.starRating, props.className)}
      />
      <span className="sr-only" aria-live="polite">
        {rating ? `${rating} ${rating === 1 ? 'star' : 'stars'}` : 'No rating'}
      </span>
    </section>
  )
}
